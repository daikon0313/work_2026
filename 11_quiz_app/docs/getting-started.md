# クイズアプリケーション - 起動手順とテスト

## 概要

このドキュメントでは、クイズアプリケーションを初めて起動し、動作確認するための詳細な手順を説明します。

## 前提条件

以下がインストールされていることを確認してください：

- **Node.js 18+**
  ```bash
  node --version  # v18.0.0 以上
  ```

- **Python 3.9+**
  ```bash
  python3 --version  # 3.9.0 以上
  ```

- **Snowflake アカウント**
  - アカウント作成済み
  - `connection.toml` に認証情報が設定済み

## 初回セットアップ

### 1. プロジェクトディレクトリに移動

```bash
cd /Users/d.harato/personal/2026/11_quiz_app
```

### 2. フロントエンドの依存パッケージをインストール

```bash
# package.json があることを確認
ls package.json

# 依存パッケージをインストール
npm install

# インストール確認
npm list react
```

**期待される出力:**
```
11_quiz_app@0.0.0 /Users/d.harato/personal/2026/11_quiz_app
└── react@19.2.0
```

### 3. バックエンドの依存パッケージをインストール

```bash
cd backend

# Python 仮想環境を作成（推奨）
python3 -m venv venv

# 仮想環境を有効化
source venv/bin/activate  # macOS/Linux
# または
venv\Scripts\activate  # Windows

# 依存パッケージをインストール
pip install -r requirements.txt

# インストール確認
pip list | grep -E "fastapi|uvicorn|snowflake"
```

**期待される出力:**
```
fastapi                  0.109.0
snowflake-connector-python 3.6.0
uvicorn                  0.27.0
```

### 4. Snowflake テーブルの作成

```bash
# backend ディレクトリにいることを確認
pwd
# → /Users/d.harato/personal/2026/11_quiz_app/backend

# テーブル作成スクリプトを実行
python3 setup_db.py
```

**期待される出力:**
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

**エラーが出た場合:**
- `connection.toml` の設定を確認
- Snowflake アカウントにログインできるか確認
- 秘密鍵ファイルのパスが正しいか確認

## アプリケーションの起動

### ターミナル1: バックエンドサーバーの起動

```bash
# backend ディレクトリに移動
cd /Users/d.harato/personal/2026/11_quiz_app/backend

# 仮想環境を有効化（まだの場合）
source venv/bin/activate

# FastAPI サーバーを起動
uvicorn main:app --reload --port 8000
```

**期待される出力:**
```
INFO:     Will watch for changes in these directories: ['/Users/d.harato/personal/2026/11_quiz_app/backend']
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [xxxxx] using WatchFiles
INFO:     Started server process [xxxxx]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**動作確認:**
1. ブラウザで http://localhost:8000 を開く
   - `{"message":"Quiz API is running!","status":"ok"}` が表示される

2. ブラウザで http://localhost:8000/docs を開く
   - Swagger UI が表示される
   - `/api/quiz/submit` と `/api/quiz/sessions` のエンドポイントが見える

### ターミナル2: フロントエンドサーバーの起動

```bash
# プロジェクトルートに移動
cd /Users/d.harato/personal/2026/11_quiz_app

# 開発サーバーを起動
npm run dev
```

**期待される出力:**
```
VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

**動作確認:**
- ブラウザで http://localhost:5173 を開く
- クイズアプリケーションが表示される

## 統合テスト

### テストシナリオ 1: クイズの完了とデータ保存

1. **クイズを開始**
   - ブラウザで http://localhost:5173 を開く
   - 「質問 1 / 3」と表示される

2. **問題1に回答**
   - 質問: 「日本の首都はどこですか?」
   - 選択肢から「東京」をクリック
   - 「✅ 正解！」と表示される
   - 「次の質問へ」ボタンをクリック

3. **問題2に回答**
   - 質問: 「1 + 1 = ?」
   - 選択肢から「2」をクリック
   - 「✅ 正解！」と表示される
   - 「次の質問へ」ボタンをクリック

4. **問題3に回答**
   - 質問: 「Reactのフックで状態管理に使うのは?」
   - 選択肢から「useState」をクリック
   - 「✅ 正解！」と表示される
   - 「結果を見る」ボタンをクリック

5. **結果画面を確認**
   - 「クイズ終了！」と表示される
   - 「スコア: 3 / 3」が表示される
   - 「正解率: 100%」が表示される
   - 「💾 結果を保存中...」が表示される（一瞬）
   - 「✅ クイズ結果を保存しました」と表示される

6. **ブラウザのコンソールを確認**（オプション）
   - F12 キーを押して開発者ツールを開く
   - Console タブを確認
   - エラーがないことを確認

7. **バックエンドのログを確認**
   - ターミナル1（バックエンド）を確認
   - 以下のようなログが表示される:
   ```
   INFO:     127.0.0.1:xxxxx - "POST /api/quiz/submit HTTP/1.1" 200 OK
   ```

### テストシナリオ 2: Snowflake でデータ確認

1. **Snowflake UI にログイン**
   - https://app.snowflake.com/
   - 認証情報を入力してログイン

2. **ワークシートを開く**
   - 左メニューから「Worksheets」を選択
   - 新しいワークシートを作成

3. **データベースとスキーマを選択**
   ```sql
   USE DATABASE YOUR_DATABASE;
   USE SCHEMA QUIZ;
   ```

4. **セッション一覧を確認**
   ```sql
   SELECT
       session_id,
       score,
       total_questions,
       correct_rate,
       completed_at
   FROM QUIZ_SESSIONS
   ORDER BY completed_at DESC
   LIMIT 5;
   ```

   **期待される結果:**
   - 最新のセッションが表示される
   - `score = 3`, `total_questions = 3`, `correct_rate = 100.0`

5. **回答詳細を確認**
   ```sql
   -- 最新セッションの回答詳細を取得
   SELECT
       q.question_id,
       q.question_text,
       q.selected_answer,
       q.correct_answer,
       q.is_correct,
       q.answered_at
   FROM QUIZ_ANSWERS q
   JOIN (
       SELECT session_id
       FROM QUIZ_SESSIONS
       ORDER BY completed_at DESC
       LIMIT 1
   ) s ON q.session_id = s.session_id
   ORDER BY q.question_id;
   ```

   **期待される結果:**
   - 3件の回答が表示される
   - すべて `is_correct = TRUE`

### テストシナリオ 3: API の直接テスト（cURL）

バックエンドが起動している状態で、別のターミナルから実行:

```bash
# セッション一覧を取得
curl http://localhost:8000/api/quiz/sessions?limit=5
```

**期待される出力:**
```json
{
  "success": true,
  "count": 1,
  "sessions": [
    {
      "session_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "user_id": null,
      "score": 3,
      "total_questions": 3,
      "correct_rate": 100.0,
      "completed_at": "2025-12-30T12:34:56.789",
      "created_at": "2025-12-30T12:34:56.789"
    }
  ]
}
```

## トラブルシューティング

### 問題: バックエンドが起動しない

**症状:**
```
ModuleNotFoundError: No module named 'fastapi'
```

**解決方法:**
```bash
# 仮想環境が有効化されているか確認
which python3
# → .../backend/venv/bin/python3 となっていればOK

# 依存パッケージを再インストール
pip install -r requirements.txt
```

### 問題: フロントエンドが起動しない

**症状:**
```
Error: Cannot find module 'react'
```

**解決方法:**
```bash
# node_modules を削除して再インストール
rm -rf node_modules package-lock.json
npm install
```

### 問題: CORS エラー

**症状:**
ブラウザコンソールに以下のエラー:
```
Access to fetch at 'http://localhost:8000/api/quiz/submit' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**解決方法:**
1. バックエンドが起動しているか確認: http://localhost:8000/health
2. `backend/main.py` の CORS 設定を確認:
   ```python
   allow_origins=["http://localhost:5173"]
   ```
3. バックエンドを再起動

### 問題: Snowflake 接続エラー

**症状:**
```
Error inserting quiz session: 250001 (08001): Failed to connect to DB
```

**解決方法:**
1. `connection.toml` のパスを確認
   ```bash
   cat /Users/d.harato/personal/2026/11_quiz_app/connection.toml
   ```

2. 秘密鍵ファイルが存在するか確認
   ```bash
   ls -la /path/to/your/private_key.pem
   ```

3. Snowflake アカウントにログインできるか確認
   - https://app.snowflake.com/

4. ネットワーク接続を確認
   ```bash
   ping snowflake.com
   ```

### 問題: 保存に失敗する

**症状:**
結果画面に「❌ 結果の保存に失敗しました」と表示される

**チェックリスト:**
1. バックエンドが起動しているか
   ```bash
   curl http://localhost:8000/health
   ```

2. Snowflake テーブルが存在するか
   ```bash
   python3 setup_db.py
   ```

3. バックエンドのログにエラーが表示されていないか
   - ターミナル1（バックエンド）のログを確認

4. ブラウザのコンソールにエラーが表示されていないか
   - F12 → Console タブ

## 開発中のTIPS

### バックエンドのホットリロード

`--reload` オプションを使用しているため、`main.py` や `db.py` を編集すると自動的に再起動されます。

### フロントエンドのホットリロード

Vite の HMR (Hot Module Replacement) により、コードを編集すると即座にブラウザに反映されます。

### API ドキュメントの確認

FastAPI は自動的に API ドキュメントを生成します:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### データベースの初期化

テストデータを削除してやり直したい場合:

```sql
-- Snowflake UI で実行
DELETE FROM YOUR_DATABASE.QUIZ.QUIZ_ANSWERS;
DELETE FROM YOUR_DATABASE.QUIZ.QUIZ_SESSIONS;
```

## 次のステップ

アプリケーションが正常に動作することを確認したら、以下の機能追加を検討してください:

1. **問題の追加**
   - `src/data/quizData.ts` に新しい問題を追加

2. **統計機能の実装**
   - 問題別の正解率を表示
   - グラフで可視化

3. **ユーザー認証の追加**
   - ログイン機能
   - ユーザー別のスコア管理

詳細は [overview.md](./overview.md) の「開発ロードマップ」を参照してください。

## 参考資料

- [プロジェクト全体像](./overview.md)
- [ステップ1: FastAPI セットアップ](./step1-fastapi-setup.md)
- [ステップ2: Snowflake テーブル作成](./step2-snowflake-tables.md)
- [ステップ3: API 統合](./step3-api-integration.md)
