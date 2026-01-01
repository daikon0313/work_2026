#!/usr/bin/env python3
"""
connection.tomlからterraform.tfvarsを生成するスクリプト
"""

import tomli
import sys
from pathlib import Path


def load_connection_toml(config_path: Path) -> dict:
    """connection.tomlを読み込む"""
    if not config_path.exists():
        print(f"Error: {config_path} が見つかりません", file=sys.stderr)
        sys.exit(1)

    with open(config_path, "rb") as f:
        config = tomli.load(f)

    return config.get("snowflake", {})


def generate_tfvars(snowflake_config: dict, env: str = "dev") -> str:
    """terraform.tfvarsの内容を生成"""

    # 必須項目のチェック
    required_fields = ["account", "user", "private_key_path", "database", "warehouse"]
    missing_fields = [f for f in required_fields if f not in snowflake_config]

    if missing_fields:
        print(f"Error: connection.tomlに以下の項目が見つかりません: {', '.join(missing_fields)}", file=sys.stderr)
        sys.exit(1)

    # Account identifierをorganization_nameとaccount_nameに分割
    # フォーマット: {organization}-{account} (例: ON44798-DS_NEW_YEAR_PARTY)
    account_identifier = snowflake_config['account']
    if '-' in account_identifier:
        parts = account_identifier.split('-', 1)  # 最初のハイフンで分割
        organization_name = parts[0]
        account_name = parts[1]
    else:
        print(f"Error: account identifier '{account_identifier}' の形式が正しくありません。{'{'}organization{'}'}-{'{'}account{'}'}の形式である必要があります", file=sys.stderr)
        sys.exit(1)

    tfvars_content = f'''# Generated from connection.toml
# Do not edit manually - this file is auto-generated

# Snowflake認証情報
snowflake_organization_name = "{organization_name}"
snowflake_account_name      = "{account_name}"
snowflake_user              = "{snowflake_config['user']}"
snowflake_role              = "{snowflake_config.get('role', 'SYSADMIN')}"
snowflake_private_key_path  = "{snowflake_config['private_key_path']}"
snowflake_warehouse         = "{snowflake_config['warehouse']}"

# Database設定
database_name   = "{snowflake_config['database']}"
schema_name     = "QUIZ_SPCS"
create_database = true

# Image Repository設定
image_repository_name = "QUIZ_APP_REPO"

# Compute Pool設定（Snowflakeは大文字を要求）
compute_pool_name = "QUIZ_APP_POOL_{env.upper()}"
instance_family   = "CPU_X64_XS"
min_nodes         = 1
max_nodes         = 1
'''

    return tfvars_content


def main():
    # プロジェクトルートのパスを取得
    script_dir = Path(__file__).parent
    project_root = script_dir.parent

    # connection.tomlのパス
    connection_toml_path = project_root / "connection.toml"

    # 環境を取得（引数から、デフォルトはdev）
    env = sys.argv[1] if len(sys.argv) > 1 else "dev"

    # connection.tomlを読み込む
    print(f"Reading {connection_toml_path}...")
    snowflake_config = load_connection_toml(connection_toml_path)

    # terraform.tfvarsを生成
    print(f"Generating terraform.tfvars for environment: {env}")
    tfvars_content = generate_tfvars(snowflake_config, env)

    # 出力先のパス
    tfvars_path = project_root / "terraform" / "env" / env / "terraform.tfvars"

    # ディレクトリが存在するか確認
    if not tfvars_path.parent.exists():
        print(f"Error: ディレクトリが見つかりません: {tfvars_path.parent}", file=sys.stderr)
        sys.exit(1)

    # ファイルに書き込み
    print(f"Writing to {tfvars_path}...")
    with open(tfvars_path, "w") as f:
        f.write(tfvars_content)

    # Account情報を表示用に取得
    account_identifier = snowflake_config['account']
    if '-' in account_identifier:
        parts = account_identifier.split('-', 1)
        organization_name = parts[0]
        account_name = parts[1]
    else:
        organization_name = account_identifier
        account_name = account_identifier

    print(f"✓ terraform.tfvars generated successfully!")
    print(f"\nGenerated values:")
    print(f"  Account Identifier: {snowflake_config['account']}")
    print(f"  Organization:       {organization_name}")
    print(f"  Account:            {account_name}")
    print(f"  User:               {snowflake_config['user']}")
    print(f"  Database:           {snowflake_config['database']}")
    print(f"  Role:               {snowflake_config.get('role', 'SYSADMIN')}")
    print(f"  Environment:        {env}")


if __name__ == "__main__":
    main()
