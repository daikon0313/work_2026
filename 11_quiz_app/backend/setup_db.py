"""
Snowflake データベーステーブルのセットアップスクリプト
connection.toml の設定を使用してテーブルを作成
"""

import tomli
import snowflake.connector
from pathlib import Path
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import serialization


def load_config():
    """connection.toml から設定を読み込む"""
    config_path = Path(__file__).parent.parent / "connection.toml"
    with open(config_path, "rb") as f:
        config = tomli.load(f)
    return config["snowflake"]


def load_private_key(private_key_path):
    """秘密鍵ファイルを読み込む"""
    with open(private_key_path, "rb") as key_file:
        private_key = serialization.load_pem_private_key(
            key_file.read(),
            password=None,  # パスワード保護されていない場合
            backend=default_backend()
        )

    # PKCS8形式にシリアライズ
    pkb = private_key.private_bytes(
        encoding=serialization.Encoding.DER,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    )
    return pkb


def create_connection(config):
    """Snowflake に接続"""
    private_key_bytes = load_private_key(config["private_key_path"])

    conn = snowflake.connector.connect(
        account=config["account"],
        user=config["user"],
        private_key=private_key_bytes,
        warehouse=config["warehouse"],
        database=config["database"],
        schema=config["schema"],
        role=config["role"]
    )
    return conn


def execute_sql_file(conn, sql_file_path, config):
    """SQLファイルを実行"""
    with open(sql_file_path, "r", encoding="utf-8") as f:
        sql_content = f.read()

    # プレースホルダーを実際の値で置換
    sql_content = sql_content.replace("{DATABASE}", config["database"])
    sql_content = sql_content.replace("{SCHEMA}", config["schema"])

    # セミコロンで分割して各SQL文を実行
    cursor = conn.cursor()

    # コメント行と空行を除外
    sql_statements = []
    for statement in sql_content.split(";"):
        statement = statement.strip()
        # コメント除去（簡易的な処理）
        lines = [line for line in statement.split("\n")
                 if not line.strip().startswith("--") and line.strip()]
        clean_statement = "\n".join(lines).strip()
        if clean_statement:
            sql_statements.append(clean_statement)

    # 各SQL文を実行
    for i, statement in enumerate(sql_statements, 1):
        try:
            print(f"Executing statement {i}/{len(sql_statements)}...")
            cursor.execute(statement)
            print(f"✅ Success")
        except Exception as e:
            print(f"❌ Error in statement {i}: {e}")
            print(f"Statement: {statement[:100]}...")

    cursor.close()


def main():
    """メイン処理"""
    print("=" * 50)
    print("Snowflake テーブルセットアップ")
    print("=" * 50)

    # 設定読み込み
    print("\n1. 設定ファイル読み込み中...")
    config = load_config()
    print(f"✅ Account: {config['account']}")
    print(f"✅ Database: {config['database']}")
    print(f"✅ Schema: {config['schema']}")

    # Snowflake接続
    print("\n2. Snowflake に接続中...")
    conn = create_connection(config)
    print("✅ 接続成功")

    # SQLファイル実行
    print("\n3. テーブル作成中...")
    sql_file_path = Path(__file__).parent / "schema.sql"
    execute_sql_file(conn, sql_file_path, config)

    # 確認
    print("\n4. テーブル確認...")
    cursor = conn.cursor()
    cursor.execute("""
        SELECT table_name, created
        FROM information_schema.tables
        WHERE table_schema = 'QUIZ'
        ORDER BY created DESC
    """)
    tables = cursor.fetchall()

    if tables:
        print("✅ 作成されたテーブル:")
        for table_name, created in tables:
            print(f"  - {table_name} (作成日時: {created})")
    else:
        print("⚠️  テーブルが見つかりません")

    cursor.close()
    conn.close()

    print("\n" + "=" * 50)
    print("セットアップ完了！")
    print("=" * 50)


if __name__ == "__main__":
    main()
