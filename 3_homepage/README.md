# Tech Blog - 個人技術ブログ

Reactベースのシンプルな技術ブログサイトです。Markdownで記事を記述し、検索とラベルフィルタリング機能を備えています。

## 初回セットアップ

### 1. 認証設定

読書リスト機能の追加フォームにはパスワード保護がかかっています。

```bash
# auth.example.tsをauth.tsにコピー
cp src/config/auth.example.ts src/config/auth.ts
```

`src/config/auth.ts`を開いて、自分のパスワードに変更してください：

```typescript
export const ADMIN_PASSWORD = 'your-password-here'
```

⚠️ **重要**: `auth.ts`は`.gitignore`に含まれており、Gitで追跡されません。

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
