# SQL DFD プロジェクト

## プロジェクト概要

SQL（dbt on Snowflake）からDFD（データフロー図）を自動生成するWebアプリケーション。

左画面でdbt SQLを入力すると、右画面でDFDが自動的に生成される。

## アーキテクチャ

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React App     │────▶│  FastAPI        │────▶│    sqlglot      │
│   (Frontend)    │◀────│  (Backend)      │◀────│    (Parser)     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
       │                        │
       ▼                        ▼
   DFD表示              SQL解析・DFD生成
  (@xyflow/react)       - CTE抽出
                        - JOIN/WHERE/GROUP BY解析
                        - ref/source検出
```

## DFDの設計方針

### ノードの種類

| ノード種類 | 説明 | 色 |
|-----------|------|-----|
| source | ref/sourceで参照される源泉テーブル | 青 |
| cte | WITH句で定義されるCTE | 黒 |
| output | 最終SELECT結果 | 緑 |
| join | JOIN操作（種類をラベルに表示） | シアン |
| where | WHERE条件 | 赤 |
| groupby | GROUP BY | 紫 |
| union | UNION / UNION ALL | オレンジ |

### 表示モード

- **ロジックノード分離モード**: JOIN/WHERE/GROUP BYを別ノードとして表示
- **統合モード**: すべての情報を1つのノード内に表示

### エッジ（矢印）

- ソーステーブルからCTEへの直接接続
- JOINの右テーブルからもエッジを引く（ラベルにON条件を表示）

## 技術スタック

### フロントエンド
- **フレームワーク**: React 19
- **ビルドツール**: Vite 7
- **言語**: TypeScript
- **グラフ描画**: @xyflow/react

### バックエンド
- **フレームワーク**: FastAPI
- **SQLパーサー**: sqlglot（Snowflake方言対応）
- **言語**: Python 3.11+

## ディレクトリ構成

```
5_sql_dfd/
├── CLAUDE.md          # プロジェクトドキュメント（Claude Code用）
├── README.md          # プロジェクト説明
├── .gitignore         # Git除外設定
├── backend/           # Pythonバックエンド
│   ├── main.py              # FastAPIエントリーポイント
│   ├── requirements.txt     # Python依存関係
│   └── parser/
│       ├── __init__.py
│       ├── sql_parser.py    # sqlglotを使用したSQLパーサー
│       └── dfd_generator.py # DFDデータ生成
├── app/               # Reactアプリケーション
│   ├── src/
│   │   ├── components/
│   │   │   ├── DFDViewer.tsx    # DFD表示コンポーネント
│   │   │   ├── DFDViewer.css
│   │   │   ├── SQLEditor.tsx    # SQLエディタコンポーネント
│   │   │   ├── TableNode.tsx    # テーブルノード
│   │   │   ├── TableNode.css
│   │   │   ├── LogicNode.tsx    # ロジックノード
│   │   │   └── LogicNode.css
│   │   ├── utils/
│   │   │   └── sqlParser.ts     # API呼び出しクライアント
│   │   ├── types/
│   │   │   └── sql.ts           # 型定義
│   │   ├── App.tsx              # メインコンポーネント
│   │   ├── App.css
│   │   └── main.tsx             # エントリーポイント
│   ├── package.json
│   └── vite.config.ts
├── sample/            # サンプルSQLファイル
│   ├── モバイル_契約マスタ_sample.sql
│   └── モバイル_契約マスタ_sample.drawio
├── src/               # （予備）
├── tests/             # テストコード
└── docs/              # ドキュメント
```

## 主要コンポーネント

### バックエンド

#### sql_parser.py

- `SQLParser.parse(sql)`: SQLを解析してCTE構造を抽出
- Jinja2テンプレート（ref/source）をプレースホルダーに置換してsqlglotでパース

対応パターン:
- `{{ ref('TABLE_NAME') }}`: dbtのref関数
- `{{ source('schema', 'TABLE_NAME') }}`: dbtのsource関数
- WITH句（CTE）
- SELECT, FROM, WHERE, JOIN, GROUP BY
- UNION / UNION ALL

#### dfd_generator.py

- `generate_dfd(parsed, separate_logic_nodes)`: パース結果をDFDノード・エッジに変換
- `separate_logic_nodes=True`: JOIN/WHERE/GROUP BYを別ノードに
- `separate_logic_nodes=False`: 統合モード

### フロントエンド

#### DFDViewer.tsx

- `calculateLayout()`: ノードの自動配置（スイムレーン方式）
- React Flowを使用したインタラクティブな表示

**レイアウトアルゴリズム（スイムレーン方式）**:

1. **レベル計算**: 各ノードのX位置（レベル）を依存関係から計算
2. **レーン割り当て**: 各ソースノードに固有のY位置（レーン）を割り当て
3. **プライマリ親追跡**: 単一の親を持つノードは親と同じY位置を維持（水平線）
4. **合流点配置**: 複数の親を持つノード（JOIN/UNION）は親のY位置の中央に配置
5. **衝突回避**: 同じレベルのノードが重ならないよう調整

**設計原則**:
- 線の交差を最小化
- 独立したデータフローは独立したレーンに配置
- 単一の親子関係では水平線を維持
- 合流点では親の中央に配置して線の長さを最小化

#### TableNode.tsx

- 3種類のスタイル: source-node（青）, cte-node（黒）, output-node（緑）
- カラム、WHERE、JOIN情報を表示

#### LogicNode.tsx

- 4種類のスタイル: where（赤）, join（シアン）, groupby（紫）, union（オレンジ）
- ロジック操作を視覚的に表示

## 開発ルール

### コーディング規約

1. **命名規則**
   - 変数名・関数名: camelCase（TypeScript）/ snake_case（Python）
   - コンポーネント/クラス: PascalCase
   - 定数: UPPER_SNAKE_CASE

2. **型安全性**
   - TypeScriptの型定義を必ず使用
   - `import type` を使用して型インポート
   - Pythonではdataclassと型ヒントを使用

### Git運用

#### ブランチ戦略

- **main**: 本番環境（常にデプロイ可能な状態）
- **claude/***: Claude Codeによる開発ブランチ
- **feature/***: 機能開発ブランチ

#### コミットメッセージ

日本語で簡潔に記述。プレフィックスを使用：

- `追加:` 新機能の追加
- `修正:` バグ修正
- `更新:` 既存機能の改善
- `削除:` 機能・ファイルの削除
- `リファクタ:` コード整理

例:
```
追加: SQLパーサー機能を実装
修正: DFD生成時のエラーハンドリングを改善
```

## よく使うコマンド

### バックエンド

```bash
# 依存関係インストール
cd backend && pip install -r requirements.txt

# 開発サーバー起動
cd backend && uvicorn main:app --reload --port 8000

# APIドキュメント確認
# http://localhost:8000/docs
```

### フロントエンド

```bash
# 依存関係インストール
cd app && npm install

# 開発サーバー起動
cd app && npm run dev

# ビルド
cd app && npm run build

# Lintチェック
cd app && npm run lint

# TypeScriptチェック
cd app && npx tsc --noEmit
```

## API仕様

### POST /api/parse

SQLを解析してDFDデータを返す。

**リクエスト**:
```json
{
  "sql": "WITH cte AS (...) SELECT * FROM cte",
  "separate_logic_nodes": true
}
```

**レスポンス**:
```json
{
  "nodes": [
    { "id": "source-TABLE_A", "type": "table", "label": "TABLE_A", "columns": ["(source)"] },
    { "id": "cte-name-where", "type": "logic", "label": "condition", "logicType": "where" },
    { "id": "cte-name", "type": "table", "label": "name", "columns": ["col1", "col2"] }
  ],
  "edges": [
    { "id": "edge-1", "source": "source-TABLE_A", "target": "cte-name-where" },
    { "id": "edge-2", "source": "cte-name-where", "target": "cte-name" }
  ]
}
```

## 参考リンク

- [@xyflow/react ドキュメント](https://reactflow.dev/)
- [FastAPI ドキュメント](https://fastapi.tiangolo.com/)
- [sqlglot ドキュメント](https://sqlglot.com/)
