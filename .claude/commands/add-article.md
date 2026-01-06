# 新しい記事を追加

`3_homepage/src/data/articles.ts` に以下のテンプレートで記事を追加してください：

```typescript
{
  id: 'XXX',  // 次の連番（例: '005'）
  title: '記事のタイトル',
  labels: ['適切なラベル'],
  createdAt: '2026-01-XX',  // 今日の日付
  excerpt: '記事の概要（100-150文字）',
  content: `# 記事のタイトル

## はじめに
導入文を書きます。

## セクション1
本文を書きます。

## まとめ
まとめを書きます。
`
}
```

追加後、以下を実行して動作確認：

```bash
npm run homepage:dev
```
