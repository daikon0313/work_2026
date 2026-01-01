#!/bin/bash
set -e

# クイズアプリケーションSPCSデプロイスクリプト

# スクリプトのディレクトリを取得し、プロジェクトルート(11_quiz_app)に移動
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

echo "Working directory: $(pwd)"

# 色の定義
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 環境変数
ENV=${1:-dev}
IMAGE_TAG=${2:-$ENV}
ENV_UPPER=$(echo "${ENV}" | tr '[:lower:]' '[:upper:]')

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Quiz App SPCS Deployment - ${ENV}${NC}"
echo -e "${BLUE}========================================${NC}"

# 1. 設定ファイルの確認と生成
echo -e "\n${GREEN}[1/6] 設定ファイルを確認中...${NC}"
if [ ! -f "connection.toml" ]; then
    echo -e "${RED}Error: connection.toml が見つかりません${NC}"
    exit 1
fi

# connection.tomlからterraform.tfvarsを自動生成
echo -e "${BLUE}connection.tomlからterraform.tfvarsを生成中...${NC}"
python3 scripts/generate_tfvars.py ${ENV}

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: terraform.tfvars の生成に失敗しました${NC}"
    exit 1
fi

# connection.tomlから設定を読み込む
# 注意: USERはシェルの予約変数なので、SF_USERを使用
ACCOUNT=$(grep 'account' connection.toml | cut -d'"' -f2 | tr -d ' ')
DATABASE=$(grep 'database' connection.toml | cut -d'"' -f2 | tr -d ' ')
SF_USER=$(grep 'user' connection.toml | cut -d'"' -f2 | tr -d ' ')
PRIVATE_KEY_PATH=$(grep 'private_key_path' connection.toml | cut -d'"' -f2 | tr -d ' ')
ROLE=$(grep 'role' connection.toml | cut -d'"' -f2 | tr -d ' ')
WAREHOUSE=$(grep 'warehouse' connection.toml | cut -d'"' -f2 | tr -d ' ')
SCHEMA="QUIZ_SPCS"
REPO_NAME="QUIZ_APP_REPO"

# Snowflake Image Registryは完全小文字のURLを要求するため、すべて小文字に変換
ACCOUNT_LOWER=$(echo "$ACCOUNT" | tr '[:upper:]' '[:lower:]')
DATABASE_LOWER=$(echo "$DATABASE" | tr '[:upper:]' '[:lower:]')
SCHEMA_LOWER=$(echo "$SCHEMA" | tr '[:upper:]' '[:lower:]')
REPO_NAME_LOWER=$(echo "$REPO_NAME" | tr '[:upper:]' '[:lower:]')

if [ -z "$ACCOUNT" ] || [ -z "$DATABASE" ] || [ -z "$SF_USER" ] || [ -z "$PRIVATE_KEY_PATH" ]; then
    echo -e "${RED}Error: connection.toml から必須項目を読み込めませんでした${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Account: ${ACCOUNT} (registry: ${ACCOUNT_LOWER})${NC}"
echo -e "${GREEN}✓ Database: ${DATABASE} (registry: ${DATABASE_LOWER})${NC}"
echo -e "${GREEN}✓ Schema: ${SCHEMA} (registry: ${SCHEMA_LOWER})${NC}"
echo -e "${GREEN}✓ User: ${SF_USER}${NC}"
echo -e "${GREEN}✓ Role: ${ROLE}${NC}"
echo -e "${GREEN}✓ terraform.tfvars generated${NC}"

# service.yamlを生成（テンプレートから）
echo -e "${BLUE}service.yamlを生成中...${NC}"
SERVICE_YAML_TEMPLATE="terraform/modules/spcs/specs/service.yaml.template"
SERVICE_YAML_OUTPUT="terraform/modules/spcs/specs/service.yaml"

if [ -f "${SERVICE_YAML_TEMPLATE}" ]; then
    # Snowflake Image pathは小文字である必要がある
    sed -e "s|__SNOWFLAKE_ACCOUNT__|${ACCOUNT}|g" \
        -e "s|__SNOWFLAKE_WAREHOUSE__|${WAREHOUSE}|g" \
        -e "s|__SNOWFLAKE_DATABASE__|${DATABASE}|g" \
        -e "s|__DATABASE_LOWER__|${DATABASE_LOWER}|g" \
        -e "s|__IMAGE_TAG__|${IMAGE_TAG}|g" \
        "${SERVICE_YAML_TEMPLATE}" > "${SERVICE_YAML_OUTPUT}"
    echo -e "${GREEN}✓ service.yaml generated${NC}"
else
    echo -e "${RED}Warning: ${SERVICE_YAML_TEMPLATE} が見つかりません${NC}"
fi

# 2. Terraformで基盤リソースを作成
echo -e "\n${GREEN}[2/6] Terraformで基盤リソースを作成中...${NC}"
echo -e "${BLUE}terraform.tfvarsから設定を読み込みます${NC}"

cd terraform/env/${ENV}

# 古い初期化ファイルをクリーンアップ
if [ -d ".terraform" ]; then
    echo -e "${BLUE}既存のTerraform初期化ファイルをクリーンアップ中...${NC}"
    rm -rf .terraform .terraform.lock.hcl
fi

echo -e "${BLUE}Terraform初期化...${NC}"
terraform init

echo -e "${BLUE}Terraform plan実行...${NC}"
terraform plan -out=tfplan

echo -e "${BLUE}適用しますか？ (yes/no)${NC}"
read -p "> " APPLY_CONFIRM

if [ "$APPLY_CONFIRM" = "yes" ]; then
    terraform apply tfplan
    echo -e "${GREEN}✓ 基盤リソースの作成完了${NC}"
else
    echo -e "${RED}デプロイをキャンセルしました${NC}"
    exit 1
fi

cd ../../..

# 2.5. External Access Integration確認
echo -e "\n${GREEN}[2.5/6] External Access Integrationを確認中...${NC}"
echo -e "${BLUE}注意: External Access IntegrationはACCOUNTADMINロールで手動作成が必要です${NC}"
echo -e "${BLUE}まだ作成していない場合は、以下のSQLを実行してください:${NC}"
echo -e ""
echo -e "${BLUE}USE ROLE ACCOUNTADMIN;${NC}"
echo -e "${BLUE}CREATE NETWORK RULE IF NOT EXISTS ${DATABASE}.${SCHEMA}.SNOWFLAKE_NETWORK_RULE${NC}"
echo -e "${BLUE}  MODE = EGRESS${NC}"
echo -e "${BLUE}  TYPE = HOST_PORT${NC}"
echo -e "${BLUE}  VALUE_LIST = ('${ACCOUNT}.snowflakecomputing.com:443');${NC}"
echo -e "${BLUE}CREATE OR REPLACE EXTERNAL ACCESS INTEGRATION QUIZ_APP_SNOWFLAKE_ACCESS${NC}"
echo -e "${BLUE}  ALLOWED_NETWORK_RULES = (${DATABASE}.${SCHEMA}.SNOWFLAKE_NETWORK_RULE)${NC}"
echo -e "${BLUE}  ENABLED = TRUE;${NC}"
echo -e "${BLUE}GRANT USAGE ON INTEGRATION QUIZ_APP_SNOWFLAKE_ACCESS TO ROLE SYSADMIN;${NC}"
echo -e ""

# 3. Dockerイメージをビルド
echo -e "\n${GREEN}[3/6] Dockerイメージをビルド中...${NC}"

# Docker用のconnection.tomlを作成（秘密鍵のパスをコンテナ内のパスに変更）
echo -e "${BLUE}Docker用のconnection.tomlを作成中...${NC}"
cat > connection.docker.toml << EOF
[snowflake]
account = "${ACCOUNT}"
user = "${SF_USER}"
role = "${ROLE}"
warehouse = "${WAREHOUSE}"
database = "${DATABASE}"
schema = "QUIZ"
private_key_path = "/app/snowflake_key.pem"
EOF

# 秘密鍵をコピー
cp "${PRIVATE_KEY_PATH}" snowflake_key.pem

echo -e "${BLUE}SPCS用にlinux/amd64プラットフォームでビルドします...${NC}"
docker build --platform linux/amd64 -t quiz-app:${IMAGE_TAG} .

# クリーンアップ
rm -f connection.docker.toml snowflake_key.pem

echo -e "${GREEN}✓ イメージビルド完了${NC}"

# 4. Snowflake Image Repositoryにログイン
echo -e "\n${GREEN}[4/6] Snowflake Image Repositoryにログイン中...${NC}"
REGISTRY_HOST="${ACCOUNT_LOWER}.registry.snowflakecomputing.com"
REPO_URL="${REGISTRY_HOST}/${DATABASE_LOWER}/${SCHEMA_LOWER}/${REPO_NAME_LOWER}"

echo -e "${BLUE}レジストリホスト: ${REGISTRY_HOST}${NC}"
echo -e "${BLUE}リポジトリURL: ${REPO_URL}${NC}"

# Snowflake CLIを使ってdocker loginを実行
if command -v snow &> /dev/null; then
    echo -e "${BLUE}snow spcs image-registry login を使用してログインします...${NC}"

    # Snow CLIの設定ファイルパス
    SNOW_CONFIG_DIR="${HOME}/Library/Application Support/snowflake"
    SNOW_CONFIG_FILE="${SNOW_CONFIG_DIR}/config.toml"
    CONNECTION_NAME="quiz_app_deploy"

    # 設定ディレクトリが存在しない場合は作成
    mkdir -p "${SNOW_CONFIG_DIR}"

    # 既存の設定ファイルをバックアップ
    if [ -f "${SNOW_CONFIG_FILE}" ]; then
        cp "${SNOW_CONFIG_FILE}" "${SNOW_CONFIG_FILE}.backup"
    fi

    echo -e "${BLUE}Snow CLI接続設定を作成中...${NC}"

    # 接続設定を直接TOMLファイルに書き込む
    cat > "${SNOW_CONFIG_FILE}" << EOF
default_connection_name = "${CONNECTION_NAME}"

[connections.${CONNECTION_NAME}]
account = "${ACCOUNT}"
user = "${SF_USER}"
authenticator = "SNOWFLAKE_JWT"
private_key_path = "${PRIVATE_KEY_PATH}"
database = "${DATABASE}"
schema = "${SCHEMA}"
role = "${ROLE}"
warehouse = "${WAREHOUSE}"
EOF

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ 接続設定を作成しました${NC}"
    else
        echo -e "${RED}Error: 接続設定の作成に失敗しました${NC}"
        exit 1
    fi

    echo ""

    # SnowCLIのimage-registry loginコマンドを使用
    echo -e "${BLUE}Image Registryにログイン中...${NC}"
    snow spcs image-registry login \
        --connection "${CONNECTION_NAME}" \
        --database "${DATABASE}" \
        --schema "${SCHEMA}"

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Snowflake Image Registryへのログインに成功しました${NC}"
    else
        echo -e "${RED}Error: snow CLIでのログインに失敗しました${NC}"
        echo -e "${BLUE}上記のエラーメッセージを確認してください${NC}"

        # バックアップを復元
        if [ -f "${SNOW_CONFIG_FILE}.backup" ]; then
            mv "${SNOW_CONFIG_FILE}.backup" "${SNOW_CONFIG_FILE}"
        fi

        exit 1
    fi

    # Image Repository URLを取得
    echo -e "${BLUE}Image Repository URLを取得中...${NC}"
    REPO_URL_FROM_SNOWFLAKE=$(snow spcs image-repository url \
        "${REPO_NAME}" \
        --connection "${CONNECTION_NAME}" \
        --database "${DATABASE}" \
        --schema "${SCHEMA}" 2>&1 | grep -v "^[[:space:]]*$" | tail -1)

    if [ $? -eq 0 ] && [ -n "${REPO_URL_FROM_SNOWFLAKE}" ]; then
        echo -e "${GREEN}✓ Repository URL: ${REPO_URL_FROM_SNOWFLAKE}${NC}"
        REPO_URL="${REPO_URL_FROM_SNOWFLAKE}"
    else
        echo -e "${BLUE}URLの自動取得に失敗。手動構築したURLを使用します${NC}"
        echo -e "${BLUE}Repository URL: ${REPO_URL}${NC}"
    fi

    # 成功したらバックアップを削除
    if [ -f "${SNOW_CONFIG_FILE}.backup" ]; then
        rm "${SNOW_CONFIG_FILE}.backup"
    fi
else
    echo -e "${RED}Error: snow CLIがインストールされていません${NC}"
    echo -e "${BLUE}snow CLIをインストールしてください:${NC}"
    echo -e "${BLUE}  pip install snowflake-cli-labs${NC}"
    echo -e "${BLUE}または、手動でdocker loginを実行してください:${NC}"
    echo -e "${BLUE}  docker login ${REGISTRY_HOST} -u ${SF_USER}${NC}"
    exit 1
fi

# 5. イメージをタグ付けしてプッシュ
echo -e "\n${GREEN}[5/6] イメージをSnowflakeにプッシュ中...${NC}"
docker tag quiz-app:${IMAGE_TAG} ${REPO_URL}/quiz-app:${IMAGE_TAG}
docker push ${REPO_URL}/quiz-app:${IMAGE_TAG}

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: イメージのプッシュに失敗しました${NC}"
    exit 1
fi

echo -e "${GREEN}✓ イメージプッシュ完了${NC}"

# 6. service.yamlをStageにアップロード
echo -e "\n${GREEN}[6/6] service.yamlをSnowflake Stageにアップロード中...${NC}"

# service.yamlのパスを取得
SERVICE_YAML_PATH="${PROJECT_ROOT}/terraform/modules/spcs/specs/service.yaml"

if [ ! -f "${SERVICE_YAML_PATH}" ]; then
    echo -e "${RED}Error: ${SERVICE_YAML_PATH} が見つかりません${NC}"
    exit 1
fi

echo -e "${BLUE}Stageにservice.yamlをアップロード中...${NC}"
snow stage copy "${SERVICE_YAML_PATH}" \
    @SERVICE_SPECS \
    --connection "${CONNECTION_NAME}" \
    --database "${DATABASE}" \
    --schema "${SCHEMA}" \
    --overwrite

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ service.yamlのアップロード完了${NC}"
else
    echo -e "${RED}Error: service.yamlのアップロードに失敗しました${NC}"
    exit 1
fi

# 完了メッセージとServiceの手動デプロイ手順
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}基盤リソースのデプロイが完了しました！${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e ""
echo -e "${BLUE}次のステップ：Serviceを手動でデプロイしてください${NC}"
echo -e ""
echo -e "${BLUE}1. Service仕様ファイルを確認:${NC}"
echo -e "   terraform/modules/spcs/specs/service.yaml"
echo -e ""
echo -e "${BLUE}2. Snowflake SQLでServiceを作成:${NC}"
echo -e "   USE DATABASE ${DATABASE};"
echo -e "   USE SCHEMA QUIZ_SPCS;"
echo -e "   "
echo -e "   CREATE SERVICE QUIZ_APP_SERVICE_${ENV_UPPER}"
echo -e "     IN COMPUTE POOL QUIZ_APP_POOL_${ENV_UPPER}"
echo -e "     FROM @SERVICE_SPECS"
echo -e "     SPEC='service.yaml';"
echo -e ""
echo -e "${BLUE}3. Serviceのステータスを確認:${NC}"
echo -e "   SHOW SERVICES;"
echo -e "   CALL SYSTEM\\\$GET_SERVICE_STATUS('QUIZ_APP_SERVICE_${ENV_UPPER}');"
echo -e ""
echo -e "${BLUE}または、Terraform経由でデプロイする場合:${NC}"
echo -e "   cd terraform/env/${ENV}"
echo -e "   terraform apply -target=module.spcs.snowflake_service.quiz_app"
echo -e ""

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}デプロイスクリプト完了${NC}"
echo -e "${GREEN}========================================${NC}"
