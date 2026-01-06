# 11_quiz_app - Quiz Application

Reactベースのクイズアプリケーションです。

## プロジェクト概要

インタラクティブなクイズアプリケーションを提供します。学習用のクイズや試験対策に活用できます。

## 技術スタック

- **フロントエンド**: React 19.2.0, TypeScript
- **ビルドツール**: Vite 7.x
- **バックエンド**: backend/ (詳細は backend/README.md 参照)
- **インフラ**: Terraform, Docker, Nginx
- **デプロイ**: コンテナベース

## ディレクトリ構成

```
11_quiz_app/
├── src/                 # Reactアプリケーション
├── backend/             # バックエンド（API等）
├── terraform/           # インフラコード
├── scripts/             # ユーティリティスクリプト
├── docs/                # ドキュメント
├── Dockerfile           # コンテナイメージ
├── nginx.conf           # Nginx設定
└── package.json         # 依存関係
```

## セットアップ

### 依存関係のインストール

```bash
# プロジェクトルートから
npm install

# または直接
cd 11_quiz_app
npm install
```

### 開発サーバーの起動

```bash
# プロジェクトルートから
npm run quiz:dev

# または直接
cd 11_quiz_app
npm run dev
```

ブラウザで http://localhost:5173 を開きます。

### ビルド

```bash
npm run quiz:build
```

### プレビュー

```bash
npm run quiz:preview
```

## コーディング規約

### TypeScript

- 型定義を必ず行う
- `any` の使用は避ける
- インターフェースで型を定義

```typescript
interface Quiz {
  id: string
  question: string
  options: string[]
  correctAnswer: number
}
```

### コンポーネント設計

- 関数コンポーネントを使用
- propsの型定義
- デフォルトエクスポート

```typescript
interface QuizCardProps {
  quiz: Quiz
  onAnswer: (answer: number) => void
}

function QuizCard({ quiz, onAnswer }: QuizCardProps) {
  // ...
}

export default QuizCard
```

## Docker

### イメージのビルド

```bash
docker build -t quiz-app .
```

### コンテナの実行

```bash
docker run -p 80:80 quiz-app
```

## Terraform

インフラをコード化して管理します。

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

詳細は `terraform/README.md` を参照してください。

## 開発ワークフロー

1. **機能開発**
   - ブランチを作成
   - コードを書く
   - テストを実行

2. **ビルド確認**
   ```bash
   npm run build
   ```

3. **Linting**
   ```bash
   npm run lint
   ```

4. **コミット**
   - わかりやすいコミットメッセージ
   - 小さな単位でコミット

## ディレクトリ別詳細

### src/

Reactアプリケーションのソースコード

- `components/`: 再利用可能なコンポーネント
- `pages/`: ページコンポーネント
- `hooks/`: カスタムフック
- `utils/`: ユーティリティ関数

### backend/

バックエンドAPI

詳細は `backend/README.md` を参照

### terraform/

インフラストラクチャコード

詳細は `terraform/README.md` を参照

### docs/

プロジェクトドキュメント

## 環境変数

`.env` ファイルで環境変数を設定：

```env
VITE_API_URL=http://localhost:3000
```

## トラブルシューティング

### ビルドエラー

1. `node_modules` を削除して再インストール
   ```bash
   rm -rf node_modules
   npm install
   ```

2. TypeScriptの型エラーを確認
   ```bash
   npm run build
   ```

### 開発サーバーが起動しない

1. ポートが使用されていないか確認
2. 依存関係がインストールされているか確認

## コマンド一覧

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | ビルド |
| `npm run preview` | プレビュー |
| `npm run lint` | Linting |

## 参考

- [README.md](./README.md) - プロジェクト概要
- [docs/](./docs/) - 追加ドキュメント
