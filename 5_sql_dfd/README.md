# SQL DFD

SQL（dbt on Snowflake）からDFD（データフロー図）を自動生成するWebアプリケーション

## 概要

左画面でdbt SQLを入力すると、右画面でDFD（データフロー図）が自動的に生成されます。

### DFDの表現

- **テーブル名**: 四角形で表現
- **カラム**: テーブルの四角形内にカラム名を表示
- **ロジック（WHERE, GROUP BY, JOINなど）**: 角丸四角形で表現

## 技術スタック

- **フレームワーク**: React 19
- **ビルドツール**: Vite 7
- **言語**: TypeScript
- **グラフ描画**: @xyflow/react

## ディレクトリ構成

```
5_sql_dfd/
├── CLAUDE.md          # プロジェクトドキュメント（Claude Code用）
├── README.md          # プロジェクト説明（本ファイル）
├── app/               # Reactアプリケーション
│   ├── src/
│   │   ├── components/   # UIコンポーネント
│   │   ├── utils/        # SQLパーサーなど
│   │   ├── types/        # 型定義
│   │   ├── App.tsx       # メインコンポーネント
│   │   └── main.tsx      # エントリーポイント
│   ├── package.json
│   └── vite.config.ts
├── src/               # （予備）
├── tests/             # テストコード
└── docs/              # ドキュメント
```

## セットアップ

```bash
# リポジトリをクローン
git clone <repository-url>
cd 5_sql_dfd

# 依存関係をインストール
cd app
npm install
```

## 使い方

```bash
# 開発サーバーを起動
cd app
npm run dev

# ビルド
npm run build

# Lintチェック
npm run lint

# プレビュー（ビルド後）
npm run preview
```

開発サーバー起動後、ブラウザで http://localhost:5173 にアクセスしてください。

## 開発

開発に関する詳細は [CLAUDE.md](./CLAUDE.md) を参照してください。

## ライセンス

MIT License
