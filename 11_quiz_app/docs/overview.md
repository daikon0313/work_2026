# クイズアプリケーション - プロジェクト全体像

## プロジェクト概要

React（フロントエンド）+ FastAPI（バックエンド）+ Snowflake（データベース）で構築するクイズアプリケーション。
ユーザーがクイズに回答し、その結果をSnowflakeに保存・分析できるシステムです。

## アーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│                      ユーザー (ブラウザ)                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              フロントエンド (React + TypeScript)              │
│                                                               │
│  • Quiz コンポーネント                                        │
│  • クイズデータ管理 (quizData.ts)                            │
│  • ユーザーインタラクション                                   │
│  • ローカル状態管理 (useState)                               │
│                                                               │
│  起動: npm run dev → http://localhost:5173                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP REST API
                              │ (CORS有効)
                              ↓
┌─────────────────────────────────────────────────────────────┐
│               バックエンド (FastAPI + Python)                 │
│                                                               │
│  • REST API エンドポイント                                    │
│  • Snowflake 接続管理                                        │
│  • データバリデーション                                       │
│  • セッション管理                                             │
│                                                               │
│  起動: uvicorn main:app → http://localhost:8000              │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Snowflake Connector
                              │ (秘密鍵認証)
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                 データベース (Snowflake)                      │
│                                                               │
│  YOUR_DATABASE.QUIZ                                           │
│  ├── QUIZ_SESSIONS (セッション情報)                          │
│  │   - session_id (UUID)                                    │
│  │   - score, total_questions, correct_rate                 │
│  │   - completed_at                                         │
│  │                                                           │
│  └── QUIZ_ANSWERS (回答詳細)                                 │
│      - answer_id (自動採番)                                  │
│      - session_id (外部キー)                                 │
│      - question_id, selected_answer, is_correct              │
│      - answered_at                                           │
└─────────────────────────────────────────────────────────────┘
```

## ディレクトリ構造

```
11_quiz_app/
├── backend/                    # FastAPI バックエンド
│   ├── main.py                # FastAPI アプリケーション本体
│   ├── requirements.txt       # Python 依存パッケージ
│   ├── schema.sql             # Snowflake テーブル定義
│   └── setup_db.py            # テーブル作成スクリプト
│
├── src/                       # React フロントエンド
│   ├── main.tsx               # エントリーポイント
│   ├── App.tsx                # ルートコンポーネント
│   ├── data/
│   │   └── quizData.ts        # クイズデータ定義
│   ├── quiz_components/
│   │   └── Quiz.tsx           # クイズコンポーネント
│   └── dev_components/        # 学習用コンポーネント
│
├── docs/                      # ドキュメント
│   ├── overview.md            # プロジェクト全体像（このファイル）
│   ├── step1-fastapi-setup.md # FastAPI セットアップ手順
│   ├── step2-snowflake-tables.md # Snowflake テーブル作成手順
│   └── tutorial/              # React学習チュートリアル
│
├── connection.toml            # Snowflake 認証情報
├── package.json               # Node.js 依存パッケージ
├── tsconfig.json              # TypeScript 設定
└── vite.config.ts             # Vite ビルド設定
```

## 技術スタック

### フロントエンド
- **React 19.2.0**: UI コンポーネントライブラリ
- **TypeScript 5.9.3**: 型安全な JavaScript
- **Vite 7.2.4**: 高速ビルドツール
- **ESLint**: コード品質チェック

### バックエンド
- **FastAPI 0.109.0**: Python Web フレームワーク
- **uvicorn 0.27.0**: ASGI サーバー
- **snowflake-connector-python 3.6.0**: Snowflake 接続ドライバ
- **tomli 2.0.1**: TOML ファイルパーサー
- **cryptography 41.0.7**: 秘密鍵認証ライブラリ

### データベース
- **Snowflake**: クラウドデータウェアハウス
- **Database**: YOUR_DATABASE
- **Schema**: QUIZ

## データモデル

### QUIZ_SESSIONS（クイズセッション情報）

クイズ全体の結果を記録するテーブル。

| カラム名 | 型 | 説明 |
|---------|-----|------|
| session_id | VARCHAR(36) | セッションID（UUID、主キー） |
| user_id | VARCHAR(100) | ユーザーID（将来の拡張用） |
| score | INTEGER | 正解数 |
| total_questions | INTEGER | 総問題数 |
| correct_rate | FLOAT | 正解率（%） |
| completed_at | TIMESTAMP_NTZ | クイズ完了日時 |
| created_at | TIMESTAMP_NTZ | レコード作成日時 |

### QUIZ_ANSWERS（クイズ回答詳細）

各問題の回答履歴を記録するテーブル。分析・レポート用。

| カラム名 | 型 | 説明 |
|---------|-----|------|
| answer_id | INTEGER | 回答ID（自動採番、主キー） |
| session_id | VARCHAR(36) | セッションID（外部キー） |
| question_id | INTEGER | 問題ID |
| question_text | VARCHAR(1000) | 問題文 |
| selected_answer | INTEGER | 選択した回答のインデックス |
| correct_answer | INTEGER | 正解のインデックス |
| is_correct | BOOLEAN | 正解かどうか |
| answered_at | TIMESTAMP_NTZ | 回答日時 |

**リレーション:**
```sql
QUIZ_ANSWERS.session_id → QUIZ_SESSIONS.session_id (FOREIGN KEY)
```

## データフロー

### 1. クイズプレイフロー
```
1. ユーザーがブラウザでクイズアプリを開く
   ↓
2. React が quizData.ts からクイズデータを読み込み
   ↓
3. Quiz コンポーネントが質問を1問ずつ表示
   ↓
4. ユーザーが回答を選択（useState で状態管理）
   ↓
5. 正解/不正解をリアルタイム表示
   ↓
6. 全問終了後、スコア画面を表示
```

### 2. データ保存フロー（今後実装予定）
```
1. クイズ完了時、フロントエンドがバックエンドにPOST
   ↓
   POST /api/quiz/submit
   Body: {
     sessionId: "uuid",
     score: 2,
     totalQuestions: 3,
     answers: [
       { questionId: 1, selectedAnswer: 2, isCorrect: true, ... },
       ...
     ]
   }
   ↓
2. FastAPI がリクエストを受信・バリデーション
   ↓
3. Snowflake Connector で QUIZ_SESSIONS に挿入
   ↓
4. QUIZ_ANSWERS に各回答を挿入（バルクインサート）
   ↓
5. 成功レスポンスを返す
   ↓
6. フロントエンドに「保存完了」メッセージを表示
```

## 実装ステータス

### ✅ 完了
- [x] React フロントエンド基本実装
  - Quiz コンポーネント
  - クイズデータ定義
  - 状態管理（useState）
  - UI/UX（質問表示、回答選択、結果表示）
- [x] FastAPI バックエンド初期設定
  - FastAPI アプリケーション作成
  - CORS 設定
  - ヘルスチェックエンドポイント
- [x] Snowflake テーブル作成
  - QUIZ_SESSIONS テーブル
  - QUIZ_ANSWERS テーブル
  - 外部キー制約
  - タイムスタンプ自動設定
- [x] バックエンド API エンドポイント
  - `POST /api/quiz/submit`: クイズ結果の保存
  - `GET /api/quiz/sessions`: セッション一覧取得
  - Pydantic モデルによる自動バリデーション
- [x] フロントエンド API 連携
  - クイズ完了時のデータ送信
  - エラーハンドリング
  - ローディング状態管理
  - 保存成功/失敗メッセージ表示
- [x] セッション管理
  - UUID 自動生成
  - 回答履歴の追跡
- [x] Snowflake 接続モジュール
  - 再利用可能な接続ヘルパー関数
  - コンテキストマネージャーによる接続管理
  - バルクインサート機能

### 🚧 未実装（今後の開発予定）
- [ ] バックエンド API エンドポイント（追加機能）
  - `GET /api/quiz/sessions/{session_id}`: セッション詳細取得
  - `GET /api/quiz/stats`: 統計情報取得
  - `GET /api/quiz/questions/stats`: 問題別統計
- [ ] ユーザー認証（将来的な拡張）
  - ログイン機能
  - ユーザーIDの管理
  - ユーザー専用ダッシュボード
- [ ] データ分析・可視化機能
  - 正解率のグラフ表示
  - 問題別の難易度分析
  - ユーザー別の成績推移
  - Chart.js などのグラフライブラリ導入

## 開発環境のセットアップ

### 前提条件
- Node.js 18+ インストール済み
- Python 3.9+ インストール済み
- Snowflake アカウント作成済み
- `connection.toml` に Snowflake 認証情報を設定済み

### フロントエンドの起動
```bash
cd /Users/d.harato/personal/2026/11_quiz_app

# 依存パッケージをインストール（初回のみ）
npm install

# 開発サーバーを起動
npm run dev

# ブラウザで http://localhost:5173 を開く
```

### バックエンドの起動
```bash
cd /Users/d.harato/personal/2026/11_quiz_app/backend

# Python 仮想環境を作成（推奨、初回のみ）
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
# または
venv\Scripts\activate  # Windows

# 依存パッケージをインストール（初回のみ）
pip install -r requirements.txt

# FastAPI サーバーを起動
uvicorn main:app --reload --port 8000

# ブラウザで http://localhost:8000/docs を開く（自動生成APIドキュメント）
```

### Snowflake テーブルの作成
```bash
cd /Users/d.harato/personal/2026/11_quiz_app/backend

# テーブル作成スクリプトを実行（初回のみ）
python3 setup_db.py
```

## API エンドポイント（現在）

### GET /
ヘルスチェック用エンドポイント。

**レスポンス例:**
```json
{
  "message": "Quiz API is running!",
  "status": "ok"
}
```

### GET /health
サーバー健全性チェック。

**レスポンス例:**
```json
{
  "status": "healthy",
  "service": "Quiz API"
}
```

### GET /docs
FastAPI 自動生成ドキュメント（Swagger UI）。
ブラウザで API の仕様を確認・テスト可能。

## 設定ファイル

### connection.toml（Snowflake 認証情報）
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

**セキュリティ注意:**
- このファイルは `.gitignore` に追加済み（Git にコミットされません）
- 秘密鍵ファイル（*.pem, *.key）も `.gitignore` に追加済み
- プロジェクトルート（`/Users/d.harato/personal/2026/11_quiz_app/connection.toml`）に配置してください

## 今後の開発ロードマップ

### フェーズ1: データ保存機能の実装
1. バックエンドに `POST /api/quiz/submit` エンドポイントを実装
2. Snowflake へのデータ挿入ロジックを実装
3. フロントエンドからバックエンドへのデータ送信機能を実装
4. エラーハンドリングの追加

### フェーズ2: データ取得機能の実装
1. セッション一覧取得 API の実装
2. セッション詳細取得 API の実装
3. フロントエンドに過去の結果表示画面を追加

### フェーズ3: 統計・分析機能の実装
1. 統計情報取得 API の実装
2. フロントエンドに統計グラフを追加
3. 問題別の正解率分析

### フェーズ4: ユーザー認証機能の追加
1. ユーザー登録・ログイン機能
2. セッションとユーザーの紐付け
3. ユーザー専用ダッシュボード

## トラブルシューティング

### フロントエンドが起動しない
```bash
# node_modules を削除して再インストール
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### バックエンドが起動しない
```bash
# 依存パッケージを再インストール
pip install --upgrade -r requirements.txt

# ポート8000が使用中の場合、別のポートを指定
uvicorn main:app --reload --port 8001
```

### Snowflake 接続エラー
1. `connection.toml` の設定を確認
2. 秘密鍵ファイルのパスが正しいか確認
3. Snowflake アカウントが有効か確認
4. ネットワーク接続を確認

### CORS エラー
- フロントエンドのポートが 5173 でない場合、`main.py` の CORS 設定を更新
```python
allow_origins=["http://localhost:YOUR_PORT"]
```

## 参考ドキュメント

### プロジェクト内ドキュメント
- [ステップ1: FastAPI セットアップ](./step1-fastapi-setup.md)
- [ステップ2: Snowflake テーブル作成](./step2-snowflake-tables.md)
- [React チュートリアル](./tutorial/README.md)

### 公式ドキュメント
- [React 公式ドキュメント](https://react.dev/)
- [FastAPI 公式ドキュメント](https://fastapi.tiangolo.com/)
- [Snowflake Python Connector](https://docs.snowflake.com/en/developer-guide/python-connector/python-connector)
- [Vite 公式ドキュメント](https://vite.dev/)

## ライセンス

このプロジェクトは教育・学習目的で作成されています。
