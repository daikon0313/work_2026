# Digdag + PostgreSQL チュートリアル

Digdagを使ってローカルのPostgreSQLに対してSQLワークフローを実行するチュートリアルです。

## 前提条件

- PostgreSQL がインストール・起動済みであること
- Digdag がインストール済みであること

## セットアップ

### 1. Digdag のインストール

```bash
# curl でインストール
curl -o ~/bin/digdag --create-dirs -L "https://dl.digdag.io/digdag-latest"
chmod +x ~/bin/digdag

# または Homebrew（macOS）
brew install --HEAD digdag/brew/digdag
```

インストール確認:

```bash
digdag --version
```

### 2. PostgreSQL の準備

チュートリアル用のデータベースを作成します。

```bash
createdb digdag_tutorial
```

### 3. 接続設定の確認

`digdag.properties` を環境に合わせて編集してください。

```properties
database.host = localhost
database.port = 5432
database.database = digdag_tutorial
database.user = postgres
database.password = postgres
```

`tutorial.dig` 内の `_export.pg` セクションも同様に変更してください。

## ワークフローの実行

```bash
cd 98_digdag
digdag run tutorial.dig
```

## ワークフローの内容

| ステップ | SQLファイル | 内容 |
|---|---|---|
| step1 | `queries/01_create_table.sql` | `users` テーブルと `orders` テーブルを作成 |
| step2 | `queries/02_insert_data.sql` | サンプルデータを挿入（ユーザー5名、注文10件） |
| step3 | `queries/03_transform.sql` | JOIN + フィルタリングで `user_orders` テーブルを作成 |
| step4 | `queries/04_aggregate.sql` | ユーザーごとの注文集計を `user_order_summary` テーブルに作成 |

## 実行結果の確認

ワークフロー実行後、PostgreSQLで結果を確認できます。

```bash
psql digdag_tutorial
```

```sql
-- 変換結果（5,000円以上の注文一覧）
SELECT * FROM user_orders;

-- 集計結果（ユーザーごとの注文サマリー）
SELECT * FROM user_order_summary;
```

## ファイル構成

```
98_digdag/
├── tutorial.dig          # メインワークフロー定義
├── queries/
│   ├── 01_create_table.sql   # テーブル作成
│   ├── 02_insert_data.sql    # サンプルデータ挿入
│   ├── 03_transform.sql      # データ変換（JOIN + フィルタ）
│   └── 04_aggregate.sql      # 集計クエリ
├── digdag.properties     # DB接続設定
└── README.md             # このファイル
```
