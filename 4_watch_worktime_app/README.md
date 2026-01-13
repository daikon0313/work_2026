# Worktime Tracker

Mac のメニューバーに常駐する作業計測アプリです。作業終了時に Google カレンダーへ自動登録できます。

## 機能

- メニューバーから作業時間を計測（Start / Pause / Stop）
- 計測中は経過時間（hh:mm:ss）をメニューバーに表示
- 作業終了時に Google カレンダーへイベントを自動登録

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

## Google Calendar API のセットアップ

### 1. Google Cloud Console でプロジェクトを作成

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成

### 2. Google Calendar API を有効化

1. 「APIとサービス」→「ライブラリ」を選択
2. 「Google Calendar API」を検索して有効化

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

1. メニューバーの「Work」をクリック
2. 「Start」で計測開始
3. メニューバーに経過時間が表示される
4. 必要に応じて「Pause」で一時停止
5. 「Stop」で計測終了
6. 作業タイトルと説明を入力
7. Google カレンダーにイベントが登録される

## ディレクトリ構成

```
4_watch_worktime_app/
├── CLAUDE.md           # プロジェクト仕様
├── README.md           # このファイル
├── pyproject.toml      # プロジェクト設定
├── requirements.txt    # 依存パッケージ
└── src/
    └── worktime_tracker/
        ├── __init__.py     # パッケージ初期化
        ├── app.py          # メインアプリケーション
        ├── calendar_api.py # Google Calendar API 連携
        └── dialog.py       # 入力ダイアログ
```

## トラブルシューティング

### 認証エラーが発生する場合

```bash
# token.json を削除して再認証
rm ~/.worktime_tracker/token.json
```

### アプリが起動しない場合

rumps は macOS 専用です。Linux や Windows では動作しません。

## ライセンス

MIT
