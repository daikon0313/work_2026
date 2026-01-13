# GitHub Actions で日次サマリーメールを送信する

GitHub Actions を使用して、毎日朝6時（JST）に前日の作業サマリーを自動送信する設定手順です。

## 概要

- **実行タイミング**: 毎日 06:00 JST (21:00 UTC 前日)
- **実行環境**: GitHub Actions (Ubuntu)
- **必要なもの**: Google API 認証情報、メール送信先アドレス

## セットアップ手順

### 1. Google API 認証情報の準備

#### 1.1 credentials.json の取得

1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクトを作成
2. Google Calendar API と Gmail API を有効化
3. OAuth 2.0 クライアント ID（デスクトップアプリ）を作成
4. `credentials.json` をダウンロード

#### 1.2 token.json の生成

初回のみ、ローカルで認証を行い `token.json` を生成します。

```bash
# 依存関係のインストール
pip install -e .

# .env ファイルを作成
cp .env.example .env
# .env ファイルを編集してメールアドレスを設定

# credentials.json を配置
mkdir -p ~/.worktime_tracker
cp /path/to/credentials.json ~/.worktime_tracker/

# テストメール送信（これで認証が行われます）
export EMAIL_RECIPIENT=your.email@example.com
python test_email.py
```

認証後、`~/.worktime_tracker/token.json` が作成されます。

### 2. GitHub Secrets の設定

リポジトリの Settings → Secrets and variables → Actions から以下の Secrets を追加します。

#### 2.1 EMAIL_RECIPIENT

メール送信先のアドレスを設定します。

```
Name: EMAIL_RECIPIENT
Value: your.email@example.com
```

#### 2.2 GOOGLE_CREDENTIALS_JSON

`credentials.json` の内容を Base64 エンコードして設定します。

```bash
# Base64 エンコード
cat ~/.worktime_tracker/credentials.json | base64
```

出力された文字列をコピーして、GitHub Secrets に追加:

```
Name: GOOGLE_CREDENTIALS_JSON
Value: (Base64エンコードした文字列)
```

#### 2.3 GOOGLE_TOKEN_JSON

`token.json` の内容を Base64 エンコードして設定します。

```bash
# Base64 エンコード
cat ~/.worktime_tracker/token.json | base64
```

出力された文字列をコピーして、GitHub Secrets に追加:

```
Name: GOOGLE_TOKEN_JSON
Value: (Base64エンコードした文字列)
```

### 3. ワークフローの有効化

`.github/workflows/daily-summary.yml` がリポジトリにコミットされていることを確認してください。

```bash
git add .github/workflows/daily-summary.yml
git commit -m "Add daily summary email workflow"
git push
```

### 4. 動作確認

#### 手動実行でテスト

GitHub のリポジトリページから:

1. Actions タブを開く
2. "Daily Work Summary Email" ワークフローを選択
3. "Run workflow" ボタンをクリック
4. 実行結果を確認

#### 定期実行の確認

- 毎日 06:00 JST に自動実行されます
- Actions タブで実行履歴を確認できます
- 失敗した場合はメール通知を受け取れます（GitHub の通知設定による）

## トラブルシューティング

### 認証エラーが発生する

- `GOOGLE_TOKEN_JSON` が正しく設定されているか確認
- token.json が期限切れの場合、ローカルで再度認証して新しい token.json を取得

### メールが送信されない

- `EMAIL_RECIPIENT` が正しく設定されているか確認
- Gmail API が有効化されているか確認
- Actions のログを確認してエラーメッセージを確認

### スケジュールが実行されない

- GitHub Actions の schedule は約 5〜10 分の遅延が発生することがあります
- リポジトリが 60 日間更新されていない場合、scheduled workflows は無効化されます

## セキュリティに関する注意

- **絶対に** `credentials.json` や `token.json` をリポジトリにコミットしないでください
- `.gitignore` に以下が含まれていることを確認してください:
  ```
  credentials.json
  token.json
  .env
  .env.local
  ```
- GitHub Secrets は暗号化されて保存されます
- token.json には refresh token が含まれており、これがあれば継続的にアクセスできます

## ローカル実行との違い

| 項目 | ローカル実行 | GitHub Actions |
|------|-------------|----------------|
| 実行環境 | Mac デスクトップアプリ | Ubuntu (クラウド) |
| スケジューラー | Python schedule ライブラリ | GitHub Actions cron |
| 認証情報 | `~/.worktime_tracker/` | GitHub Secrets (環境変数) |
| 常駐の必要性 | アプリ起動中のみ | 不要 |

## 参考リンク

- [GitHub Actions - Scheduled events](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#schedule)
- [GitHub Actions - Encrypted secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
