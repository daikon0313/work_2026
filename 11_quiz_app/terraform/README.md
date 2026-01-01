# Terraform Configuration for Quiz App SPCS Deployment

このディレクトリには、クイズアプリケーションをSnowflake SPCS（Snowpark Container Services）にデプロイするためのTerraform設定が含まれています。

## ディレクトリ構造

```
terraform/
├── modules/
│   └── spcs/                    # SPCSリソースモジュール
│       ├── main.tf              # Compute Pool, Service, Image Repository等
│       ├── variables.tf         # モジュール変数
│       ├── outputs.tf           # モジュール出力
│       └── specs/
│           └── service.yaml     # SPCS サービス仕様
└── env/
    └── dev/                     # 開発環境設定
        ├── main.tf              # Providerとモジュール呼び出し
        ├── variables.tf         # 環境変数
        ├── outputs.tf           # 環境出力
        ├── backend.tf           # バックエンド設定
        ├── terraform.tfvars     # 実際の値 (.gitignore)
        └── terraform.tfvars.example  # サンプル
```

## クイックスタート

### 1. 環境設定ファイルの作成

```bash
cd env/dev
cp terraform.tfvars.example terraform.tfvars
# terraform.tfvarsを編集して実際の値を設定
```

### 2. Terraform初期化

```bash
terraform init
```

### 3. プランの確認

```bash
terraform plan
```

### 4. 適用

```bash
terraform apply
```

## 作成されるリソース

### Compute Pool
- **リソース名**: `snowflake_compute_pool.quiz_app`
- **用途**: SPCSサービスの実行環境
- **設定可能項目**:
  - `instance_family`: インスタンスタイプ (CPU_X64_XS, CPU_X64_S等)
  - `min_nodes`: 最小ノード数
  - `max_nodes`: 最大ノード数
  - `auto_suspend_secs`: 自動サスペンドまでの秒数

### Image Repository
- **リソース名**: `snowflake_image_repository.quiz_app`
- **用途**: Dockerイメージの保存
- **URL形式**: `<account>.registry.snowflakecomputing.com/<database>/<schema>/<repo_name>`

### Service
- **リソース名**: `snowflake_service.quiz_app`
- **用途**: クイズアプリケーションの実行
- **設定可能項目**:
  - `min_instances`: 最小インスタンス数
  - `max_instances`: 最大インスタンス数
  - `spec`: サービス仕様（YAMLファイル）

### Schema
- **リソース名**: `snowflake_schema.quiz_schema`
- **用途**: SPCSリソースの格納
- **デフォルト名**: `QUIZ_SPCS`

### Stage
- **リソース名**: `snowflake_stage.service_spec`
- **用途**: サービス仕様ファイルの保存

## 変数

主要な変数（`variables.tf`で定義）:

| 変数名 | 説明 | デフォルト値 |
|--------|------|-------------|
| `snowflake_account` | Snowflakeアカウント | - |
| `snowflake_user` | Snowflakeユーザー | - |
| `snowflake_role` | 使用するロール | `SYSADMIN` |
| `database_name` | データベース名 | - |
| `schema_name` | スキーマ名 | `QUIZ_SPCS` |
| `compute_pool_name` | Compute Pool名 | `quiz_app_pool_dev` |
| `instance_family` | インスタンスファミリー | `CPU_X64_XS` |
| `service_name` | サービス名 | `quiz_app_service_dev` |

詳細は`env/dev/variables.tf`を参照してください。

## 出力

デプロイ後、以下の情報が出力されます:

```bash
terraform output
```

| 出力名 | 説明 |
|--------|------|
| `compute_pool_name` | 作成されたCompute Pool名 |
| `image_repository_url` | イメージリポジトリのURL |
| `service_name` | 作成されたサービス名 |
| `service_dns_name` | サービスのDNS名（エンドポイント） |
| `database_name` | 使用しているデータベース名 |
| `schema_name` | 使用しているスキーマ名 |

## モジュール構成

### modules/spcs

SPCSリソースを管理する再利用可能なモジュール。

**入力変数**:
- Compute Pool設定（`compute_pool_name`, `instance_family`等）
- Database設定（`database_name`, `schema_name`等）
- Service設定（`service_name`, `min_instances`等）

**出力**:
- `compute_pool_name`
- `image_repository_url`
- `service_name`
- `service_dns_name`

### env/dev

開発環境固有の設定。

**特徴**:
- 開発用の小さいインスタンスサイズ
- 自動サスペンド有効
- 最小リソース構成

## ベストプラクティス

### 1. バージョン管理

- `terraform.tfvars`は`.gitignore`に含める（機密情報）
- `terraform.tfvars.example`をテンプレートとして提供
- `.terraform.lock.hcl`はコミット（依存関係の固定）

### 2. 状態管理

本番環境では、リモートバックエンドの使用を推奨:

```hcl
# backend.tf
terraform {
  backend "s3" {
    bucket = "your-terraform-state"
    key    = "quiz-app/dev/terraform.tfstate"
    region = "us-east-1"
  }
}
```

### 3. 環境分離

- `env/dev`: 開発環境
- `env/staging`: ステージング環境（将来追加）
- `env/prod`: 本番環境（将来追加）

各環境で異なる設定を使用:
- 開発: 小さいインスタンス、自動サスペンド
- 本番: 大きいインスタンス、高可用性設定

## トラブルシューティング

### 認証エラー

```bash
Error: authentication failed
```

**解決策**:
1. `terraform.tfvars`の認証情報を確認
2. 秘密鍵のパスが正しいか確認
3. Snowflakeユーザーに適切な権限があるか確認

### リソース作成エラー

```bash
Error: error creating compute pool
```

**解決策**:
1. SPCSが有効化されているか確認
2. 使用しているロールに権限があるか確認
3. アカウントのリソース制限を確認

### 状態の不整合

```bash
terraform refresh
terraform plan
```

必要に応じて:

```bash
terraform import <resource_type>.<name> <id>
```

## 次のステップ

1. **CI/CDパイプライン**: GitHub Actionsでの自動デプロイ
2. **本番環境**: `env/prod`の作成
3. **モニタリング**: Snowflakeのモニタリング機能の活用
4. **セキュリティ**: ネットワークポリシーの設定

## 参考資料

- [Terraform Snowflake Provider](https://registry.terraform.io/providers/Snowflake-Labs/snowflake/latest/docs)
- [Snowflake SPCS Documentation](https://docs.snowflake.com/en/developer-guide/snowpark-container-services/overview)
- [Terraform Best Practices](https://www.terraform.io/docs/language/settings/backends/index.html)
