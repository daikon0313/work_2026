# ステップ2: Snowflakeテーブルの作成

## 目的

クイズ結果を保存するための Snowflake テーブルを設計・作成する。

## 実施内容

### 2-1. テーブル設計

クイズアプリのデータ構造に基づき、2つのテーブルを設計しました。

#### テーブル1: QUIZ_SESSIONS（クイズセッション情報）

クイズ全体の結果を記録するテーブル。

| カラム名 | データ型 | 説明 |
|---------|---------|------|
| session_id | VARCHAR(36) | セッションID（UUID、主キー） |
| user_id | VARCHAR(100) | ユーザーID（任意、現在は null 許可） |
| score | INTEGER | 正解数 |
| total_questions | INTEGER | 総問題数 |
| correct_rate | FLOAT | 正解率（%） |
| completed_at | TIMESTAMP_NTZ | クイズ完了日時 |
| created_at | TIMESTAMP_NTZ | レコード作成日時 |

#### テーブル2: QUIZ_ANSWERS（クイズ回答詳細）

各問題の回答履歴を記録するテーブル（分析用）。

| カラム名 | データ型 | 説明 |
|---------|---------|------|
| answer_id | INTEGER | 回答ID（自動採番、主キー） |
| session_id | VARCHAR(36) | セッションID（外部キー） |
| question_id | INTEGER | 問題ID |
| question_text | VARCHAR(1000) | 問題文 |
| selected_answer | INTEGER | 選択した回答のインデックス |
| correct_answer | INTEGER | 正解のインデックス |
| is_correct | BOOLEAN | 正解かどうか |
| answered_at | TIMESTAMP_NTZ | 回答日時 |

**リレーション:**
- QUIZ_ANSWERS.session_id → QUIZ_SESSIONS.session_id（外部キー）

### 2-2. schema.sql の作成

テーブル定義を SQL ファイルに記述しました。

```sql
-- スキーマの作成
CREATE SCHEMA IF NOT EXISTS YOUR_DATABASE.QUIZ;

-- クイズセッションテーブル
CREATE TABLE IF NOT EXISTS YOUR_DATABASE.QUIZ.QUIZ_SESSIONS (
    session_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(100),
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    correct_rate FLOAT,
    completed_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
    created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);

-- クイズ回答詳細テーブル
CREATE TABLE IF NOT EXISTS YOUR_DATABASE.QUIZ.QUIZ_ANSWERS (
    answer_id INTEGER AUTOINCREMENT PRIMARY KEY,
    session_id VARCHAR(36) NOT NULL,
    question_id INTEGER NOT NULL,
    question_text VARCHAR(1000),
    selected_answer INTEGER NOT NULL,
    correct_answer INTEGER NOT NULL,
    is_correct BOOLEAN NOT NULL,
    answered_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
    FOREIGN KEY (session_id) REFERENCES YOUR_DATABASE.QUIZ.QUIZ_SESSIONS(session_id)
);
```

**SQL の重要ポイント:**

- `CREATE SCHEMA IF NOT EXISTS`: スキーマが存在しない場合のみ作成
- `CREATE TABLE IF NOT EXISTS`: テーブルが存在しない場合のみ作成（冪等性を保つ）
- `PRIMARY KEY`: 主キー制約（一意性を保証）
- `AUTOINCREMENT`: 自動採番（連番を自動生成）
- `FOREIGN KEY`: 外部キー制約（参照整合性を保証）
- `TIMESTAMP_NTZ`: タイムゾーンなしのタイムスタンプ（NTZ = No Time Zone）
- `DEFAULT CURRENT_TIMESTAMP()`: デフォルト値として現在時刻を設定

### 2-3. setup_db.py の作成

connection.toml の設定を使って Snowflake に接続し、テーブルを作成する Python スクリプトを作成しました。

```python
import tomli
import snowflake.connector
from cryptography.hazmat.primitives import serialization

def load_config():
    """connection.toml から設定を読み込む"""
    with open("../connection.toml", "rb") as f:
        config = tomli.load(f)
    return config["snowflake"]

def load_private_key(private_key_path):
    """秘密鍵ファイルを読み込む"""
    with open(private_key_path, "rb") as key_file:
        private_key = serialization.load_pem_private_key(
            key_file.read(),
            password=None,
            backend=default_backend()
        )
    # PKCS8形式にシリアライズ
    return private_key.private_bytes(...)

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
```

**コードの説明:**

#### 設定ファイル読み込み
```python
config = tomli.load(f)
```
- `tomli`: TOML 形式のファイルを Python 辞書に変換するライブラリ

#### 秘密鍵認証
```python
private_key = serialization.load_pem_private_key(...)
```
- Snowflake は秘密鍵認証をサポート（パスワード不要）
- PEM 形式の秘密鍵を読み込み、PKCS8 形式に変換

#### Snowflake 接続
```python
snowflake.connector.connect(account=..., private_key=...)
```
- `snowflake-connector-python`: Snowflake 公式の Python ドライバ
- `account`: Snowflake アカウント識別子
- `warehouse`: 計算リソース（クエリ実行環境）
- `database` / `schema`: データの保存場所

### 2-4. テーブル作成の実行

```bash
python3 setup_db.py
```

**実行結果:**
```
==================================================
Snowflake テーブルセットアップ
==================================================

1. 設定ファイル読み込み中...
✅ Account: YOUR_ACCOUNT
✅ Database: YOUR_DATABASE
✅ Schema: QUIZ

2. Snowflake に接続中...
✅ 接続成功

3. テーブル作成中...
Executing statement 1/3...
✅ Success
Executing statement 2/3...
✅ Success
Executing statement 3/3...
✅ Success

4. テーブル確認...
✅ 作成されたテーブル:
  - QUIZ_ANSWERS
  - QUIZ_SESSIONS

==================================================
セットアップ完了！
==================================================
```

### 2-5. テーブルの確認

Snowflake UI または SQL で確認できます。

```sql
-- テーブル一覧
SELECT table_name, created
FROM information_schema.tables
WHERE table_schema = 'QUIZ';

-- 空のテーブル確認
SELECT * FROM YOUR_DATABASE.QUIZ.QUIZ_SESSIONS;
SELECT * FROM YOUR_DATABASE.QUIZ.QUIZ_ANSWERS;
```

## 重要な概念

### DDL (Data Definition Language)
- データベースの構造を定義する SQL 文
- `CREATE`, `ALTER`, `DROP` など
- テーブル、スキーマ、インデックスなどを作成・変更・削除

### 主キー (PRIMARY KEY)
- テーブル内の各行を一意に識別するカラム
- 重複・NULL 値は許可されない
- 例: session_id, answer_id

### 外部キー (FOREIGN KEY)
- 他のテーブルの主キーを参照するカラム
- 参照整合性を保証（存在しない session_id は挿入できない）
- 例: QUIZ_ANSWERS.session_id → QUIZ_SESSIONS.session_id

### UUID (Universally Unique Identifier)
- 世界中で一意な識別子
- session_id に使用（重複の心配がない）
- 形式: `550e8400-e29b-41d4-a716-446655440000`

### タイムスタンプ
- **TIMESTAMP_NTZ**: タイムゾーンなしのタイムスタンプ
- `CURRENT_TIMESTAMP()`: 現在時刻を取得
- `DEFAULT`: カラムのデフォルト値を設定

### 秘密鍵認証
- パスワード不要のセキュアな認証方式
- 公開鍵を Snowflake に登録、秘密鍵でローカル認証
- connection.toml に秘密鍵のパスを指定

## トラブルシューティング

### エラー: Schema does not exist
**原因**: QUIZ スキーマが存在しない
**対処**: SQL ファイルに `CREATE SCHEMA IF NOT EXISTS` を追加

### エラー: Table is not a hybrid table
**原因**: Snowflake の通常テーブルでは `CREATE INDEX` が使えない
**対処**: INDEX 作成文を削除（小規模データでは不要）

## ファイル構成

```
backend/
├── schema.sql         # テーブル定義 SQL
└── setup_db.py        # テーブル作成スクリプト
```

## 次のステップ

ステップ3: connection.toml を読み込む Snowflake 接続モジュール作成
- 再利用可能な接続ヘルパー関数を作成
- API エンドポイントから Snowflake にデータ挿入
