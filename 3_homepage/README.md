# Tech Blog - 個人技術ブログ

Reactベースのシンプルな技術ブログサイトです。Markdownで記事を記述し、検索とラベルフィルタリング機能を備えています。

## 初回セットアップ

### 1. GitHub Personal Access Token の設定

読書リスト機能はGitHub Issues APIを使用するため、Personal Access Tokenが必要です。

#### ステップ1: GitHub トークンの作成

1. GitHubにログイン → 右上のプロフィールアイコン → **Settings**
2. 左サイドバー下部 → **Developer settings**
3. **Personal access tokens** → **Tokens (classic)** → **Generate new token (classic)**
4. トークンの設定：
   - **Note**: `work_2026 読書リスト用` など、わかりやすい名前
   - **Expiration**: 有効期限を選択（推奨: 90 days）
   - **Select scopes**: ✅ **repo** にチェック（Issues の作成・更新に必要）
5. **Generate token** をクリック
6. ⚠️ **重要**: 表示されたトークンをコピー（一度しか表示されません）
   - 形式: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

#### ステップ2: ローカル環境にトークンを設定

```bash
# .env.local ファイルを作成
cd 3_homepage
cp .env.local.example .env.local
```

`.env.local` を開いて、トークンを設定：

```bash
VITE_GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

⚠️ **重要**: `.env.local`は`.gitignore`に含まれており、Gitで追跡されません。

## クイックスタート

```bash
# 開発サーバー起動
npm run homepage:dev

# ビルド
npm run homepage:build

# プレビュー
npm run homepage:preview
```

## 新しい記事の追加

`src/data/articles.ts` に記事を追加：

```typescript
{
  id: '005',
  title: '記事のタイトル',
  labels: ['Snowflake', 'dbt'],
  createdAt: '2026-01-07',
  excerpt: '記事の概要',
  content: `# 記事のタイトル

Markdown形式で記事を書きます。

## セクション

- リスト項目
- コードブロック対応
`
}
```

## サポートラベル

- Snowflake
- Databricks
- モデリング
- dbt
- Terraform
- 日記
- その他

## 詳細ドキュメント

詳しい使い方は [CLAUDE.md](./CLAUDE.md) を参照してください。

## GitHub Pages

このサイトはGitHub Pagesで公開されます：
https://[ユーザー名].github.io/work_2026/

### GitHub Secretsの設定

GitHub Pagesにデプロイする際、GitHub Personal Access TokenをGitHub Secretsで管理します。

1. GitHubリポジトリの **Settings** → **Secrets and variables** → **Actions** に移動
2. **New repository secret** をクリック
3. 以下のシークレットを追加：

   **読書リスト用のGitHub Token:**
   - Name: `VITE_GITHUB_TOKEN`
   - Secret: 上記で作成したPersonal Access Token（`ghp_xxx...`）を貼り付け
   - **Add secret** をクリック

これにより、GitHub Actionsのビルド時に自動的にトークンが環境変数として設定され、読書リスト機能が動作します。

⚠️ **セキュリティ注意**:
- トークンは絶対にコードにハードコードしないでください
- `.env.local`ファイルは絶対にGitにコミットしないでください（`.gitignore`で除外済み）
- トークンが漏洩した場合は、すぐにGitHubで無効化し、新しいトークンを生成してください
