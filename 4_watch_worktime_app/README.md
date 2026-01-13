# Worktime Tracker

Mac のデスクトップアプリとして動作する作業計測アプリです。作業終了時に Google カレンダーへ自動登録でき、毎日朝6時に前日の作業サマリーをメールで自動送信します。

## 機能

- デスクトップウィンドウで作業時間を計測（Start / Pause / Stop）
- 計測中は経過時間（hh:mm:ss）をリアルタイム表示
- 作業終了時に Google カレンダーへイベントを自動登録
- 日次サマリーイベントを自動更新
- **NEW** 毎日朝6:00に前日の作業サマリーをメールで自動送信

## 必要環境

- macOS
- Python 3.9+
- Google アカウント

## インストール

```bash
cd 4_watch_worktime_app

# 仮想環境を作成（推奨）
python -m venv venv
source venv/bin/activate

# 依存パッケージをインストール
pip install -r requirements.txt

# パッケージをインストール
pip install -e .
```

## Google API のセットアップ

### 1. Google Cloud Console でプロジェクトを作成

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成

### 2. 必要なAPIを有効化

1. 「APIとサービス」→「ライブラリ」を選択
2. 以下のAPIを検索して有効化:
   - **Google Calendar API**
   - **Gmail API**

### 3. OAuth 2.0 クライアントを作成

1. 「APIとサービス」→「認証情報」を選択
2. 「認証情報を作成」→「OAuth クライアント ID」を選択
3. アプリケーションの種類：「デスクトップ アプリ」を選択
4. 名前を入力して作成
5. JSON をダウンロード

### 4. 認証情報を配置

```bash
# 設定ディレクトリを作成
mkdir -p ~/.worktime_tracker

# ダウンロードした JSON を配置
mv ~/Downloads/client_secret_*.json ~/.worktime_tracker/credentials.json
```

## 使い方

### アプリを起動

```bash
# コマンドラインから起動
worktime-tracker

# または直接実行
python -m worktime_tracker.app
```

### 操作方法

| メニュー | 説明 |
|---------|------|
| Start | 作業計測を開始 / 再開 |
| Pause | 作業を一時中断（経過時間は保持） |
| Stop | 作業を終了し、カレンダーに登録 |
| Quit | アプリを終了 |

### 作業の流れ

1. アプリウィンドウの「Start」ボタンをクリックして計測開始
2. ウィンドウに経過時間が表示される
3. 必要に応じて「Pause」で一時停止
4. 「Stop」で計測終了
5. 作業タイトルと説明を入力
6. Google カレンダーにイベントが登録される

### 日次サマリーメール

**方法1: ローカル実行（アプリ起動中）**

アプリ起動中は、毎日朝6:00に前日の作業サマリーがメールで自動送信されます。

```bash
# .env ファイルを作成してメールアドレスを設定
cp .env.example .env
# .env を編集: EMAIL_RECIPIENT=your.email@example.com

# アプリを起動（スケジューラーが自動起動）
source venv/bin/activate
python src/worktime_tracker/app.py
```

**方法2: GitHub Actions（推奨）**

GitHub Actions を使用すると、ローカルでアプリを起動していなくても、毎日朝6:00に自動送信できます。

詳細は [GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md) を参照してください。

**メール内容:**
- 前日の作業一覧
- 各作業の開始時刻と作業時間
- 合計作業時間

### テストメール送信

すぐにメールをテストしたい場合:

```bash
source venv/bin/activate

# 環境変数を設定
export EMAIL_RECIPIENT=your.email@example.com

# テスト実行
python test_email.py
```

## ディレクトリ構成

```
4_watch_worktime_app/
├── .github/
│   └── workflows/
│       └── daily-summary.yml  # GitHub Actions ワークフロー
├── src/
│   └── worktime_tracker/
│       ├── __init__.py         # パッケージ初期化
│       ├── app.py              # メインアプリケーション
│       ├── calendar_api.py     # Google Calendar API 連携
│       ├── gmail_api.py        # Gmail API 連携
│       ├── email_summary.py    # メール本文生成
│       ├── scheduler.py        # 日次メール送信スケジューラー
│       └── dialog.py           # 入力ダイアログ
├── CLAUDE.md                   # プロジェクト仕様
├── GITHUB_ACTIONS_SETUP.md     # GitHub Actions セットアップ手順
├── README.md                   # このファイル
├── .env.example                # 環境変数のサンプル
├── pyproject.toml              # プロジェクト設定
├── test_email.py               # メール送信テスト（ローカル）
└── send_daily_summary.py       # メール送信（GitHub Actions用）
```

## トラブルシューティング

### 認証エラーが発生する場合

新しいスコープ（Gmail API）を追加したため、既存の認証トークンは無効になります。
以下のコマンドで再認証してください:

```bash
# token.json を削除して再認証
rm ~/.worktime_tracker/token.json
```

### 環境変数が設定されていないエラー

```bash
# ローカル実行の場合
export EMAIL_RECIPIENT=your.email@example.com

# または .env ファイルを作成
cp .env.example .env
# .env を編集してメールアドレスを設定
```

### メールが送信されない場合

1. Gmail API が有効化されているか確認
2. OAuth クライアントのスコープに `gmail.send` が含まれているか確認
3. `test_email.py` で個別にテストしてみる
4. アプリのログで「Daily summary scheduler started」が表示されているか確認

### ローカルスケジューラーが動作しない場合

- アプリが起動している必要があります
- アプリを Quit するとスケジューラーも停止します
- 朝6時にアプリが起動していることを確認してください

### GitHub Actions でのトラブルシューティング

詳細は [GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md) のトラブルシューティングセクションを参照してください。

## ライセンス

MIT
