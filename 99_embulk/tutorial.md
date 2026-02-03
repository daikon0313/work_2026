# Embulk チュートリアル：CSV → Snowflake

## 1. Embulkとは

Embulkは**オープンソースのバルクデータローダー**です。さまざまなデータソース（CSV、DB、APIなど）からデータを抽出し、別のストレージ（DB、クラウドDWHなど）にロードするETLツールとして使われます。

### アーキテクチャの概念

```
┌──────────┐    ┌──────────┐    ┌──────────┐
│  Input   │ →  │  Filter  │ →  │  Output  │
│  Plugin  │    │  Plugin  │    │  Plugin  │
└──────────┘    └──────────┘    └──────────┘
  (CSV, DB)     (カラム変換等)    (Snowflake等)
```

- **Input Plugin**: データの読み込み元を定義（file, mysql, s3 など）
- **Filter Plugin**: データの変換・加工（カラム名変更、型変換など）
- **Output Plugin**: データの書き込み先を定義（snowflake, bigquery など）
- **Parser/Formatter**: データ形式の解析・整形（csv, json など）

### 特徴

| 特徴 | 説明 |
|------|------|
| プラグインベース | Input/Output/Filterをプラグインとして自由に組み合わせ可能 |
| YAML設定 | 設定ファイル1つでデータパイプラインを定義 |
| Java(JVM)ベース | Java上で動作し、プラットフォーム非依存 |
| guess機能 | 入力データからスキーマを自動推測 |
| 並列処理 | マルチスレッドで高速にデータ転送 |

---

## 2. 環境構築

### 2-1. Javaのインストール

EmbulkはJVM上で動作するため、Javaが必要です。

```bash
# Homebrewでインストール (macOS)
brew install openjdk@8

# 動作確認
java -version
```

### 2-2. Embulkのインストール

最新バージョンは **v0.11.5** です（2024年9月時点）。

```bash
# Embulk本体のダウンロード
curl --create-dirs -o ~/.embulk/bin/embulk \
  -L "https://dl.embulk.org/embulk-0.11.5.jar"

# 実行権限の付与
chmod +x ~/.embulk/bin/embulk

# PATHに追加（zshの場合）
echo 'export PATH="$HOME/.embulk/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# 動作確認
embulk --version
```

### 2-3. Snowflake Output プラグインのインストール

```bash
embulk gem install embulk-output-snowflake
```

---

## 3. プロジェクト構成

```
99_embulk/
├── tutorial.md         # 本ドキュメント
├── config.yml          # Embulk設定ファイル
└── data/
    └── sample.csv      # 入力CSVファイル
```

---

## 4. チュートリアル：CSV → Snowflake

### 4-1. サンプルCSVの準備

`data/sample.csv` を作成します。

```csv
id,name,email,department,created_at
1,田中太郎,tanaka@example.com,engineering,2025-01-15 10:30:00
2,佐藤花子,sato@example.com,marketing,2025-02-20 14:00:00
3,鈴木一郎,suzuki@example.com,sales,2025-03-10 09:15:00
4,山田美咲,yamada@example.com,engineering,2025-04-05 16:45:00
5,高橋健一,takahashi@example.com,marketing,2025-05-01 11:00:00
```

### 4-2. Snowflake側の準備

Snowflakeで受け入れ先のテーブルを作成します。

```sql
-- データベースとスキーマの作成
CREATE DATABASE IF NOT EXISTS embulk_tutorial;
USE DATABASE embulk_tutorial;
CREATE SCHEMA IF NOT EXISTS public;

-- テーブルの作成
CREATE TABLE IF NOT EXISTS users (
    id INTEGER,
    name VARCHAR(100),
    email VARCHAR(255),
    department VARCHAR(50),
    created_at TIMESTAMP
);
```

### 4-3. Embulk設定ファイルの作成

`config.yml` を作成します。

```yaml
in:
  type: file
  path_prefix: ./data/sample.csv
  parser:
    type: csv
    charset: UTF-8
    delimiter: ","
    quote: '"'
    skip_header_lines: 1
    columns:
      - { name: id,         type: long }
      - { name: name,       type: string }
      - { name: email,      type: string }
      - { name: department, type: string }
      - { name: created_at, type: timestamp, format: "%Y-%m-%d %H:%M:%S" }

out:
  type: snowflake
  host: <your-account>.snowflakecomputing.com
  user: <your-user>
  password: <your-password>
  warehouse: <your-warehouse>
  database: embulk_tutorial
  schema: public
  table: users
  mode: insert
```

> **注意**: `<your-account>`, `<your-user>`, `<your-password>`, `<your-warehouse>` は自分のSnowflake環境に合わせて書き換えてください。

### 4-4. 実行手順

```bash
# ① guessでスキーマを自動推測（inputの確認に便利）
embulk guess config.yml -o guessed.yml

# ② previewで出力データをプレビュー（実際にはロードしない）
embulk preview config.yml

# ③ 実行（データをSnowflakeにロード）
embulk run config.yml
```

### 4-5. 各コマンドの解説

| コマンド | 説明 |
|---------|------|
| `embulk guess` | 入力データを分析し、スキーマ（カラム名・型）を自動推測して設定ファイルを生成 |
| `embulk preview` | 実際のデータ出力のプレビュー表示。Output先にはデータを送らない |
| `embulk run` | 実際にデータ転送を実行 |

### 4-6. 実行結果の確認

Snowflakeで以下のクエリを実行してデータが入ったことを確認します。

```sql
USE DATABASE embulk_tutorial;

SELECT * FROM users;
```

---

## 5. Output モードの解説

`embulk-output-snowflake` は複数のモードをサポートしています。

| モード | 動作 | トランザクション | 用途 |
|--------|------|-----------------|------|
| `insert` | 中間テーブル経由でINSERT（UNION ALL） | あり | 初回ロード |
| `insert_direct` | 対象テーブルに直接INSERT | なし | 高速な追記 |
| `truncate_insert` | テーブルをTRUNCATEしてからINSERT | あり | 洗い替え |
| `replace` | 中間テーブルに書き込み後、元テーブルと入れ替え | あり | 全量入替 |
| `merge` | MERGE INTOで既存データとマッチング更新/挿入 | あり | 差分更新 |

### mergeモードの設定例

既存データとのキーマッチングで更新・挿入を行う場合：

```yaml
out:
  type: snowflake
  host: <your-account>.snowflakecomputing.com
  user: <your-user>
  password: <your-password>
  warehouse: <your-warehouse>
  database: embulk_tutorial
  schema: public
  table: users
  mode: merge
  merge_keys:
    - id
```

---

## 6. 応用設定

### 6-1. キーペア認証

パスワードの代わりにRSA鍵ペアで認証できます（本番環境推奨）。

```yaml
out:
  type: snowflake
  host: <account>.snowflakecomputing.com
  user: <user>
  privateKey: /path/to/rsa_key.p8
  private_key_passphrase: <passphrase>
  warehouse: <warehouse>
  database: embulk_tutorial
  schema: public
  table: users
  mode: insert
```

### 6-2. Filterプラグインの使用

カラム名の変更など、転送中にデータを加工できます。

```yaml
in:
  type: file
  path_prefix: ./data/sample.csv
  parser:
    type: csv
    # ... (省略)

filters:
  - type: rename
    columns:
      name: user_name
      email: user_email

out:
  type: snowflake
  # ... (省略)
```

### 6-3. before_load / after_load フック

データロードの前後にSQLを実行できます。

```yaml
out:
  type: snowflake
  # ... (省略)
  before_load: "DELETE FROM users WHERE department = 'engineering'"
  after_load: "CALL update_user_stats()"
```

### 6-4. カラムごとの型指定

```yaml
out:
  type: snowflake
  # ... (省略)
  column_options:
    id:
      type: "INTEGER NOT NULL"
    created_at:
      type: "TIMESTAMP_NTZ"
      timestamp_format: "%Y-%m-%d %H:%M:%S"
```

---

## 7. トラブルシューティング

| 問題 | 対処法 |
|------|--------|
| `Java not found` | Java 8がインストールされているか `java -version` で確認 |
| `Plugin not found` | `embulk gem install` でプラグインがインストール済みか確認 |
| `Connection refused` | Snowflakeのhost名、ネットワーク接続を確認 |
| `Authentication failed` | user/password、またはキーペアの設定を確認 |
| `Table not found` | Snowflake側にテーブルが存在するか、schema名が正しいか確認 |
| CSVパースエラー | delimiter、quote、skip_header_linesの設定を見直す |
| 文字化け | `charset: UTF-8` が正しく設定されているか確認 |

---

## 8. 参考リンク

- [Embulk 公式ドキュメント](https://www.embulk.org/docs/built-in.html)
- [embulk-output-snowflake (GitHub)](https://github.com/trocco-io/embulk-output-snowflake)
- [Embulk GitHub Releases](https://github.com/embulk/embulk/releases)
