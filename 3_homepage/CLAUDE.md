# 3_homepage - Tech Blog

Reactベースのシンプルなブログ型ホームページです。Markdownで記事を記述し、検索とラベルフィルタリング機能を備えています。

## プロジェクト概要

このプロジェクトは、データエンジニアリングやクラウド技術に関する技術記事を公開するための個人ブログサイトです。

### 技術スタック

- **フレームワーク**: React 19.2.0
- **ビルドツール**: Vite 7.x
- **言語**: TypeScript 5.9.3
- **Markdownパーサー**: react-markdown
- **スタイリング**: CSS Modules
- **デプロイ**: GitHub Pages

### 主な機能

1. **検索機能**
   - 記事のタイトル、本文、抜粋から全文検索
   - リアルタイムフィルタリング

2. **ラベルフィルタリング**
   - 技術カテゴリ別に記事を絞り込み
   - サポートラベル: Snowflake, モデリング, dbt, Terraform, 日記, その他

3. **Markdownサポート**
   - GitHub Flavored Markdown (GFM) 対応
   - コードブロック、リスト、リンク、画像などをサポート

4. **レスポンシブデザイン**
   - モバイル、タブレット、デスクトップに対応
   - グリッドレイアウトで記事を美しく表示

5. **記事詳細モーダル**
   - 記事カードをクリックすると全文をモーダル表示
   - Markdownの完全なレンダリング

## ディレクトリ構成

```
3_homepage/
├── src/
│   ├── components/          # Reactコンポーネント
│   │   ├── Header.tsx       # ヘッダー
│   │   ├── SearchBar.tsx    # 検索バー
│   │   ├── LabelFilter.tsx  # ラベルフィルター
│   │   ├── ArticleList.tsx  # 記事一覧
│   │   ├── ArticleCard.tsx  # 記事カード
│   │   └── ArticleDetail.tsx # 記事詳細モーダル
│   ├── data/
│   │   └── articles.ts      # 記事データ
│   ├── types/
│   │   └── article.ts       # 型定義
│   ├── styles/              # CSSファイル
│   ├── App.tsx              # メインアプリケーション
│   └── main.tsx             # エントリーポイント
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## セットアップ

### 依存関係のインストール

プロジェクトルートで：

```bash
npm install
```

### 開発サーバーの起動

```bash
npm run homepage:dev
```

ブラウザで http://localhost:5173 を開きます。

### ビルド

```bash
npm run homepage:build
```

ビルド成果物は `3_homepage/dist/` に出力されます。

### プレビュー

```bash
npm run homepage:preview
```

## 記事の追加方法

記事は `src/data/articles.ts` ファイルで管理されています。

### 1. 記事データの追加

`articles` 配列に新しいオブジェクトを追加します：

```typescript
{
  id: '005',  // 一意のID（通常は連番）
  title: 'Snowflakeのベストプラクティス',
  labels: ['Snowflake', 'モデリング'],
  createdAt: '2026-01-07',
  excerpt: 'Snowflakeを使う際のベストプラクティスをまとめました。',
  content: `# Snowflakeのベストプラクティス

## はじめに
Snowflakeを使う際に押さえておきたいポイントを紹介します。

## ポイント1: ウェアハウスサイズの選択
適切なサイズを選ぶことでコストを最適化できます。

## ポイント2: クラスタリングキー
大規模なテーブルにはクラスタリングキーを設定しましょう。

## まとめ
これらのベストプラクティスを実践することで、効率的にSnowflakeを活用できます。
`
}
```

### 2. 記事の構造

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `id` | string | ✓ | 記事の一意識別子 |
| `title` | string | ✓ | 記事のタイトル |
| `labels` | ArticleLabel[] | ✓ | 記事のラベル（カテゴリ） |
| `createdAt` | string | ✓ | 作成日（YYYY-MM-DD形式） |
| `excerpt` | string | - | 記事の概要（省略可） |
| `content` | string | ✓ | Markdown形式の本文 |

### 3. ラベルの追加

新しいラベルを追加する場合：

1. `src/types/article.ts` の `ArticleLabel` 型に追加
2. `src/components/LabelFilter.tsx` の `labels` 配列に追加

```typescript
// src/types/article.ts
export type ArticleLabel = 'Snowflake' | 'モデリング' | 'dbt' | 'Terraform' | '日記' | 'Python' | 'その他'

// src/components/LabelFilter.tsx
const labels: ArticleLabel[] = ['Snowflake', 'モデリング', 'dbt', 'Terraform', '日記', 'Python', 'その他']
```

## Markdownの記法

### 見出し

```markdown
# 見出し1
## 見出し2
### 見出し3
```

### リスト

```markdown
- 項目1
- 項目2
  - サブ項目
```

### コードブロック

````markdown
```python
def hello():
    print("Hello, World!")
```
````

### リンク

```markdown
[リンクテキスト](https://example.com)
```

### 強調

```markdown
**太字**
*斜体*
```

## GitHub Pagesへのデプロイ

このプロジェクトはGitHub Pagesに自動デプロイされるように設定されています。

### デプロイフロー

1. PRを作成し、mainブランチにマージ
2. GitHub Actionsが自動的にビルドとデプロイを実行
3. `https://[ユーザー名].github.io/work_2026/` でアクセス可能

### 設定ファイル

- **ワークフロー**: `.github/workflows/deploy-homepage.yml`
- **ベースパス**: `vite.config.ts` の `base: '/work_2026/'`

## 開発のヒント

### ホットリロード

開発サーバー起動中は、ファイルを保存すると自動的にブラウザがリロードされます。

### 型チェック

TypeScriptの型チェックは自動的に実行されます。エディタでリアルタイムにエラーを確認できます。

### Linting

```bash
npm run lint --workspace=3_homepage
```

## トラブルシューティング

### ビルドエラー: 型インポート

TypeScriptの `verbatimModuleSyntax` が有効なため、型のインポートは `import type` を使用してください：

```typescript
// ❌ 間違い
import { Article } from '../types/article'

// ✅ 正しい
import type { Article } from '../types/article'
```

### 記事が表示されない

1. `src/data/articles.ts` に正しく記事を追加したか確認
2. 記事のIDが一意か確認
3. ブラウザのコンソールでエラーを確認

## 今後の拡張案

- [ ] 記事の日付順ソート機能
- [ ] ページネーション
- [ ] ダークモード対応
- [ ] OGP画像の設定
- [ ] RSS/Atomフィードの生成
- [ ] 記事のMarkdownファイル分割管理

## ライセンス

MIT
