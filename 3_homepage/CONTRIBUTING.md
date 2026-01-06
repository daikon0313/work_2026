# 記事の追加ガイド

このドキュメントでは、ブログに新しい記事を追加する方法を説明します。

## ステップ1: 記事データの準備

記事は `src/data/articles.ts` ファイルで管理されています。

### 記事の構造

```typescript
{
  id: string          // 一意のID（例: '001', '002'）
  title: string       // 記事のタイトル
  labels: string[]    // ラベル（カテゴリ）
  createdAt: string   // 作成日（YYYY-MM-DD形式）
  excerpt?: string    // 記事の概要（省略可）
  content: string     // Markdown形式の本文
}
```

## ステップ2: 記事の追加

### 1. ファイルを開く

`src/data/articles.ts` を開きます。

### 2. 新しい記事を追加

`articles` 配列の末尾に新しい記事を追加：

```typescript
export const articles: Article[] = [
  // 既存の記事...
  {
    id: '005',
    title: 'dbtでデータ品質を担保する',
    labels: ['dbt', 'モデリング'],
    createdAt: '2026-01-08',
    excerpt: 'dbtのテスト機能を使ってデータ品質を確保する方法を紹介します。',
    content: `# dbtでデータ品質を担保する

## はじめに
データパイプラインでは、データ品質の確保が重要です。

## dbtのテスト機能
dbtには以下のテスト機能があります：

### 1. スキーマテスト
\`\`\`yaml
models:
  - name: orders
    columns:
      - name: order_id
        tests:
          - unique
          - not_null
\`\`\`

### 2. データテスト
カスタムSQLでデータの整合性をチェックできます。

## まとめ
dbtのテスト機能を活用して、信頼性の高いデータパイプラインを構築しましょう。
`
  }
]
```

## ステップ3: Markdownの記法

### 基本的な記法

```markdown
# 見出し1
## 見出し2
### 見出し3

**太字**
*斜体*

- リスト項目1
- リスト項目2

1. 番号付きリスト
2. 2番目の項目

[リンク](https://example.com)
```

### コードブロック

````markdown
```python
def calculate_total(items):
    return sum(item.price for item in items)
```
````

### テーブル

```markdown
| カラム1 | カラム2 | カラム3 |
|---------|---------|---------|
| データ1 | データ2 | データ3 |
```

### 引用

```markdown
> これは引用文です。
> 複数行にわたって記述できます。
```

## ステップ4: 動作確認

### 開発サーバーで確認

```bash
npm run homepage:dev
```

ブラウザで以下を確認：
1. 記事が一覧に表示されるか
2. 検索で見つかるか
3. ラベルフィルタリングが動作するか
4. 記事詳細が正しく表示されるか

### ビルドテスト

```bash
npm run homepage:build
```

エラーがないことを確認します。

## ステップ5: 新しいラベルの追加（必要な場合）

新しいラベルを追加する場合は2つのファイルを更新します。

### 1. 型定義を更新

`src/types/article.ts`:

```typescript
export type ArticleLabel =
  | 'Snowflake'
  | 'モデリング'
  | 'dbt'
  | 'Terraform'
  | '日記'
  | 'Python'  // ← 新しいラベル
  | 'その他'
```

### 2. フィルターに追加

`src/components/LabelFilter.tsx`:

```typescript
const labels: ArticleLabel[] = [
  'Snowflake',
  'モデリング',
  'dbt',
  'Terraform',
  '日記',
  'Python',  // ← 新しいラベル
  'その他'
]
```

## ベストプラクティス

### IDの命名

- ゼロ埋め3桁の連番を推奨: `'001'`, `'002'`, `'003'`
- 一意であることが重要

### タイトル

- 簡潔で分かりやすく
- 30文字以内を推奨

### ラベル

- 記事あたり1〜3個を推奨
- 関連性の高いラベルを選択

### 作成日

- YYYY-MM-DD形式で記述
- 実際の作成日または公開日を使用

### 抜粋（excerpt）

- 100〜150文字程度
- 記事の内容を簡潔に説明
- 省略可能だが、設定を推奨

### 本文（content）

- 見出しは階層的に使用（h1 → h2 → h3）
- コードブロックには言語を指定
- 適度に段落を分ける
- 画像を使う場合はURLを指定

## トラブルシューティング

### 記事が表示されない

1. `articles` 配列にカンマ区切りで正しく追加されているか確認
2. IDが既存の記事と重複していないか確認
3. ブラウザのコンソールでエラーを確認

### ビルドエラー

1. TypeScriptの型エラーを確認
2. Markdownの文字列がバックティック（\`）で囲まれているか確認
3. 特殊文字（バックスラッシュなど）がエスケープされているか確認

### スタイルが崩れる

1. Markdown記法が正しいか確認
2. コードブロックの閉じ忘れがないか確認

## サンプルテンプレート

新しい記事を作成する際は、以下のテンプレートを使用してください：

```typescript
{
  id: 'XXX',
  title: '',
  labels: [],
  createdAt: 'YYYY-MM-DD',
  excerpt: '',
  content: `# タイトル

## はじめに


## セクション1


## まとめ

`
}
```

## 質問・サポート

記事の追加で困ったことがあれば、GitHubのIssueで質問してください。
