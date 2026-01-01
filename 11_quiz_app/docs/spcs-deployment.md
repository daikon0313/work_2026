# Snowflake SPCS デプロイメントガイド

## 概要

このドキュメントでは、Terraformを使用してクイズアプリケーションをSnowflake SPCS（Snowpark Container Services）にデプロイする方法を説明します。

## 前提条件

### 必要なツール

- **Docker**: コンテナイメージのビルド
  ```bash
  docker --version  # 20.10.0 以上
  ```

- **Terraform**: インフラストラクチャのプロビジョニング
  ```bash
  terraform --version  # 1.5.0 以上
  ```

- **Snowflake CLI** (オプション): Snowflakeとの対話
  ```bash
  snow --version
  ```

### Snowflakeの要件

- SPCS有効化済みのSnowflakeアカウント
- 必要な権限:
  - `CREATE COMPUTE POOL`
  - `CREATE SERVICE`
  - `CREATE IMAGE REPOSITORY`
  - `CREATE STAGE`
  - `CREATE DATABASE` (新規作成する場合)

## ディレクトリ構造

```
11_quiz_app/
├── terraform/
│   ├── modules/
│   │   └── spcs/                    # SPCSモジュール
│   │       ├── main.tf              # メインリソース定義
│   │       ├── variables.tf         # 変数定義
│   │       ├── outputs.tf           # 出力定義
│   │       └── specs/
│   │           └── service.yaml     # サービス仕様
│   └── env/
│       └── dev/                     # 開発環境
│           ├── main.tf              # 環境固有設定
│           ├── variables.tf         # 環境変数
│           ├── outputs.tf           # 出力
│           ├── backend.tf           # バックエンド設定
│           ├── terraform.tfvars     # 実際の値 (gitignore)
│           └── terraform.tfvars.example  # サンプル
├── Dockerfile                       # コンテナイメージ定義
├── .dockerignore                    # Docker除外設定
└── scripts/
    └── deploy.sh                    # デプロイスクリプト
```

## セットアップ手順

### 1. Terraform変数ファイルの作成

```bash
cd terraform/env/dev
cp terraform.tfvars.example terraform.tfvars
```

`terraform.tfvars`を編集して実際の値を設定:

```hcl
# Snowflake認証情報
snowflake_account          = "YOUR_ACCOUNT"
snowflake_user             = "YOUR_USERNAME"
snowflake_role             = "SYSADMIN"
snowflake_private_key_path = "/path/to/your/private_key.pem"

# Database設定
database_name   = "YOUR_DATABASE"
schema_name     = "QUIZ_SPCS"
create_database = false  # 既存のデータベースを使用

# Compute Pool設定
compute_pool_name = "quiz_app_pool_dev"
instance_family   = "CPU_X64_XS"

# Service設定
service_name  = "quiz_app_service_dev"
image_tag     = "dev"
```

### 2. connection.tomlの確認

プロジェクトルートに`connection.toml`があることを確認:

```toml
[snowflake]
account = "YOUR_ACCOUNT"
user = "YOUR_USERNAME"
private_key_path = "/path/to/your/private_key.pem"
warehouse = "YOUR_WAREHOUSE"
database = "YOUR_DATABASE"
schema = "QUIZ"
role = "YOUR_ROLE"
```

## デプロイ方法

### 方法1: デプロイスクリプトを使用（推奨）

```bash
# プロジェクトルートで実行
./scripts/deploy.sh dev

# 特定のイメージタグを指定
./scripts/deploy.sh dev v1.0.0
```

デプロイスクリプトは以下を実行します:
1. 設定ファイルの確認
2. Dockerイメージのビルド
3. Snowflake Image Repositoryへのログイン
4. イメージのプッシュ
5. Terraformによるインフラのデプロイ

### 方法2: 手動デプロイ

#### ステップ1: Dockerイメージのビルドとプッシュ

```bash
# イメージをビルド
docker build -t quiz-app:dev .

# Snowflake Image Repositoryにログイン
docker login <ACCOUNT>.registry.snowflakecomputing.com -u <USERNAME>
# Password: Snowflakeのパスワードを入力

# イメージをタグ付け
REPO_URL="<ACCOUNT>.registry.snowflakecomputing.com/<DATABASE>/QUIZ_SPCS/quiz_app_repo"
docker tag quiz-app:dev ${REPO_URL}:dev

# イメージをプッシュ
docker push ${REPO_URL}:dev
```

#### ステップ2: Terraformでデプロイ

```bash
cd terraform/env/dev

# 初期化
terraform init

# プランの確認
terraform plan

# 適用
terraform apply
```

## デプロイ後の確認

### サービスの状態確認

```sql
-- Snowflake UIまたはSnowflake CLIで実行
SHOW SERVICES IN SCHEMA YOUR_DATABASE.QUIZ_SPCS;

-- サービスの詳細
DESC SERVICE YOUR_DATABASE.QUIZ_SPCS.quiz_app_service_dev;

-- サービスのログ
CALL SYSTEM$GET_SERVICE_LOGS('YOUR_DATABASE.QUIZ_SPCS.quiz_app_service_dev', 0);
```

### エンドポイントの確認

```sql
-- サービスのエンドポイントを取得
SHOW ENDPOINTS IN SERVICE YOUR_DATABASE.QUIZ_SPCS.quiz_app_service_dev;
```

Terraformの出力でも確認可能:

```bash
cd terraform/env/dev
terraform output service_dns_name
```

### アプリケーションへのアクセス

サービスのDNS名を使用してアクセス:

- **フロントエンド**: `https://<SERVICE_DNS_NAME>:5173`
- **バックエンドAPI**: `https://<SERVICE_DNS_NAME>:8000`
- **API Docs**: `https://<SERVICE_DNS_NAME>:8000/docs`

## リソースの更新

### イメージの更新

```bash
# 新しいイメージをビルド
docker build -t quiz-app:v1.1 .

# プッシュ
docker tag quiz-app:v1.1 ${REPO_URL}:v1.1
docker push ${REPO_URL}:v1.1

# サービスを更新（Snowflake UIまたはSQL）
ALTER SERVICE YOUR_DATABASE.QUIZ_SPCS.quiz_app_service_dev
  FROM SPECIFICATION $$
  # 新しいイメージタグを指定
  $$;
```

### Terraform設定の更新

```bash
cd terraform/env/dev

# 変更を確認
terraform plan

# 適用
terraform apply
```

## トラブルシューティング

### サービスが起動しない

```sql
-- ログを確認
CALL SYSTEM$GET_SERVICE_LOGS('YOUR_DATABASE.QUIZ_SPCS.quiz_app_service_dev', 0);

-- サービスの状態を確認
SELECT SYSTEM$GET_SERVICE_STATUS('YOUR_DATABASE.QUIZ_SPCS.quiz_app_service_dev');
```

### イメージがプッシュできない

1. Docker認証を確認:
   ```bash
   docker login <ACCOUNT>.registry.snowflakecomputing.com
   ```

2. リポジトリが存在するか確認:
   ```sql
   SHOW IMAGE REPOSITORIES IN SCHEMA YOUR_DATABASE.QUIZ_SPCS;
   ```

### Terraform エラー

```bash
# 状態を確認
terraform show

# 特定のリソースを再作成
terraform taint snowflake_service.quiz_app
terraform apply
```

## クリーンアップ

### サービスの削除

```bash
cd terraform/env/dev
terraform destroy
```

または、個別に削除:

```sql
-- サービスを削除
DROP SERVICE YOUR_DATABASE.QUIZ_SPCS.quiz_app_service_dev;

-- Compute Poolを削除
DROP COMPUTE POOL quiz_app_pool_dev;
```

## コスト最適化

- **Auto-suspend**: 使用していない時は自動的にサスペンド
  - Compute Pool: `auto_suspend_secs = 600` (10分)
  - Service: `auto_resume = true`

- **インスタンスサイズ**: 必要最小限のサイズを使用
  - 開発環境: `CPU_X64_XS` (最小)
  - 本番環境: ワークロードに応じて調整

- **スケーリング**: 必要な時だけスケールアップ
  - `min_instances = 1`
  - `max_instances` を適切に設定

## 次のステップ

- CI/CDパイプラインの構築
- モニタリングとアラートの設定
- 本番環境（env/prod）の構築
- カスタムドメインの設定
- HTTPSの設定

## 参考リンク

- [Snowflake SPCS Documentation](https://docs.snowflake.com/en/developer-guide/snowpark-container-services/overview)
- [Terraform Snowflake Provider](https://registry.terraform.io/providers/Snowflake-Labs/snowflake/latest/docs)
- [Docker Documentation](https://docs.docker.com/)
