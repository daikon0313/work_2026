# ステップ1: FastAPIバックエンドの初期設定

## 目的

React クイズアプリから送信されたクイズ結果を受け取り、Snowflake に保存するための FastAPI バックエンドを構築する。

## 実施内容

### 1-1. ディレクトリ構造の作成

```bash
11_quiz_app/
  ├── backend/          # FastAPI バックエンド（新規作成）
  │   ├── requirements.txt
  │   └── main.py
  ├── src/              # React フロントエンド（既存）
  └── connection.toml   # Snowflake 認証情報（既存）
```

### 1-2. requirements.txt の作成

必要な Python ライブラリをリストアップ。

```txt
# FastAPI Web Framework
fastapi==0.109.0
uvicorn[standard]==0.27.0

# Snowflake Connector
snowflake-connector-python==3.6.0

# TOML Configuration File Parser
tomli==2.0.1

# CORS Middleware
python-multipart==0.0.6

# Cryptography for Private Key Authentication
cryptography==41.0.7
```

**各ライブラリの役割:**

- **fastapi**: Web API フレームワーク本体
- **uvicorn**: ASGI サーバー（FastAPI アプリを実行するサーバー）
- **snowflake-connector-python**: Snowflake データベース接続用ドライバ
- **tomli**: TOML 形式の設定ファイルを読み込むライブラリ
- **python-multipart**: フォームデータやファイルアップロードの処理用
- **cryptography**: 秘密鍵認証に必要な暗号化ライブラリ

### 1-3. main.py の作成

最小構成の FastAPI アプリケーションを作成。

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# FastAPI インスタンスの作成
app = FastAPI(
    title="Quiz API",
    description="クイズ結果をSnowflakeに保存するAPI",
    version="1.0.0"
)

# CORS 設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite のデフォルトポート
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ヘルスチェックエンドポイント
@app.get("/")
async def root():
    return {"message": "Quiz API is running!", "status": "ok"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "Quiz API"}
```

**コードの説明:**

#### FastAPI インスタンス作成
```python
app = FastAPI(title="Quiz API", ...)
```
- FastAPI アプリケーションのエントリーポイント
- `title`, `description`, `version` は自動生成ドキュメント用のメタデータ

#### CORS ミドルウェア
```python
app.add_middleware(CORSMiddleware, ...)
```
- **CORS (Cross-Origin Resource Sharing)**: 異なるオリジン（ポート）間の通信を許可する設定
- React アプリ（localhost:5173）から API（localhost:8000）へのリクエストを許可
- `allow_origins`: 許可する送信元 URL
- `allow_methods`: 許可する HTTP メソッド（GET, POST など）
- `allow_headers`: 許可するヘッダー

#### エンドポイント定義
```python
@app.get("/")
async def root():
    return {"message": "Quiz API is running!"}
```
- `@app.get("/")`: HTTP GET リクエストを `/` パスで受け付ける
- `async def`: 非同期関数（効率的な並行処理が可能）
- 戻り値は自動的に JSON に変換される

### 1-4. パッケージのインストール

```bash
cd /Users/d.harato/personal/2026/11_quiz_app/backend
python3 -m pip install -r requirements.txt
```

**pip コマンドの意味:**
- `python3 -m pip`: Python の pip モジュールを実行
- `install -r requirements.txt`: requirements.txt に記載されたパッケージを一括インストール

### 1-5. サーバーの起動

```bash
uvicorn main:app --reload --port 8000
```

**コマンドの意味:**
- `uvicorn`: ASGI サーバー実行コマンド
- `main:app`: `main.py` ファイルの `app` オブジェクトを実行
- `--reload`: ファイル変更時に自動再起動（開発時に便利）
- `--port 8000`: ポート 8000 で起動

### 1-6. 動作確認

#### cURL でテスト
```bash
curl http://localhost:8000/
# レスポンス: {"message":"Quiz API is running!","status":"ok"}
```

#### ブラウザで確認
- **API エンドポイント**: http://localhost:8000/
- **自動生成ドキュメント**: http://localhost:8000/docs
  - FastAPI は Swagger UI を自動生成
  - API の仕様を視覚的に確認・テスト可能

## 重要な概念

### FastAPI とは
- Python の高速 Web フレームワーク
- 自動ドキュメント生成（Swagger UI）
- 型ヒントによる自動バリデーション
- 非同期処理のサポート

### REST API とは
- **RE**presentational **S**tate **T**ransfer の略
- HTTP プロトコルを使った通信規約
- リソース（データ）に対して、HTTP メソッドで操作
  - GET: データ取得
  - POST: データ作成
  - PUT/PATCH: データ更新
  - DELETE: データ削除

### ASGI サーバー (uvicorn) とは
- **A**synchronous **S**erver **G**ateway **I**nterface
- Python の非同期 Web アプリを実行するサーバー
- Node.js でいう Express のような役割

### CORS の必要性
- ブラウザのセキュリティ機能で、異なるオリジン間の通信はデフォルトでブロックされる
- React (localhost:5173) と API (localhost:8000) は異なるポートなので CORS 設定が必要
- 本番環境では適切なオリジンのみを許可するべき

## ファイル構成

```
backend/
├── requirements.txt    # 依存パッケージリスト
└── main.py            # FastAPI アプリケーション本体
```

## 次のステップ

ステップ2: Snowflake テーブルの作成
- クイズ結果を保存するテーブル設計
- DDL (Data Definition Language) の実行
