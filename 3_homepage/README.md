# Tech Blog - 個人技術ブログ

Reactベースのシンプルな技術ブログサイトです。Markdownで記事を記述し、検索とラベルフィルタリング機能を備えています。

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
