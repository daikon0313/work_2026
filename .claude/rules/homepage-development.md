# Tech Blog (3_homepage) 開発ルール

## プロジェクト概要

このプロジェクトは、技術記事を公開するためのReactベースのブログサイトです。

## コーディング規約

### TypeScript

- 型インポートは `import type` を使用すること
- `verbatimModuleSyntax` が有効なため、型と値のインポートを分離する

```typescript
// ✅ 正しい
import type { Article } from '../types/article'
import { articles } from '../data/articles'

// ❌ 間違い
import { Article, articles } from '../data/articles'
```

### ファイル構成

- コンポーネントは `src/components/` に配置
- 各コンポーネントには対応するCSSファイルを作成
- 共通の型定義は `src/types/` に配置
- データは `src/data/` に配置

### コンポーネント設計

- 関数コンポーネントを使用
- propsの型定義を必ず行う
- デフォルトエクスポートを使用

```typescript
interface ComponentProps {
  title: string
  onClick: () => void
}

function Component({ title, onClick }: ComponentProps) {
  // ...
}

export default Component
```

## 記事管理

### 記事の追加

1. `src/data/articles.ts` に記事データを追加
2. IDは一意の連番（例: '001', '002'）
3. 作成日はYYYY-MM-DD形式
4. ラベルは既存のものから選択（新規作成も可）

### Markdown記法

- GitHub Flavored Markdown (GFM) をサポート
- コードブロックには言語を指定
- 見出しは階層的に使用（h1 → h2 → h3）

## Git運用

### ブランチ戦略

- **mainブランチ**: 本番環境（常にデプロイ可能な状態を保つ）
- **開発ブランチ**: `claude/*` または `feature/*`

#### ブランチ管理のルール

1. **新機能追加時は必ず新しいブランチを作成**
   ```bash
   # mainから最新の状態を取得
   git fetch origin main

   # 新しいブランチを作成
   git checkout -b claude/feature-name-sessionid origin/main
   ```

2. **ブランチ命名規則**
   - `claude/[機能名]-[セッションID]`
   - 例: `claude/add-search-feature-pt1sl`

3. **マージ後は必ずブランチを削除**
   ```bash
   # リモートブランチを削除
   git push origin --delete ブランチ名

   # ローカルブランチを削除
   git branch -d ブランチ名
   ```

4. **PR作成前のチェックリスト**
   - [ ] ビルドが成功すること
   - [ ] 型エラーがないこと
   - [ ] コミットメッセージが適切か
   - [ ] 不要なファイルが含まれていないか

5. **マージ後の手順**
   - PRをマージ
   - ブランチを削除
   - ローカルのmainブランチを更新: `git pull origin main`

### コミットメッセージ

- 日本語で簡潔に記述
- プレフィックスを使用（追加、修正、更新など）

例:
```
記事追加: Snowflakeのベストプラクティス
修正: 検索機能のバグを修正
更新: ラベルフィルターのデザインを改善
```

## デプロイ

### GitHub Pages

- mainブランチへのマージで自動デプロイ
- ベースパス: `/work_2026/`
- ワークフロー: `.github/workflows/deploy-homepage.yml`

### 確認事項

デプロイ前に以下を確認：
- [ ] ビルドが成功すること
- [ ] TypeScriptの型エラーがないこと
- [ ] 記事が正しく表示されること
- [ ] 検索とフィルタリングが動作すること

## トラブルシューティング

### よくあるエラー

1. **型インポートエラー**
   - `import type` を使用しているか確認

2. **ビルドエラー**
   - `npm run homepage:build` でエラー内容を確認
   - TypeScriptの型定義を確認

3. **記事が表示されない**
   - `src/data/articles.ts` の構文エラーを確認
   - IDの重複がないか確認

## 参考リンク

- [CLAUDE.md](../../3_homepage/CLAUDE.md) - 詳細ドキュメント
- [CONTRIBUTING.md](../../3_homepage/CONTRIBUTING.md) - 記事追加ガイド
