import type { Article } from '../types/article'

export const articles: Article[] = [
  {
    id: '001',
    title: 'Snowflakeでデータウェアハウスを構築する',
    labels: ['Snowflake', 'モデリング'],
    createdAt: '2026-01-06',
    excerpt: 'Snowflakeを使ったモダンなデータウェアハウスの構築方法について解説します。',
    content: `# Snowflakeでデータウェアハウスを構築する

## はじめに
Snowflakeは、クラウドネイティブなデータウェアハウスとして、多くの企業で採用されています。

## Snowflakeの特徴
- **分離されたストレージとコンピューティング**: 柔軟なスケーリングが可能
- **マルチクラウド対応**: AWS、Azure、GCPで利用可能
- **ゼロコピークローン**: データを複製せずに環境を作成

## データモデリングのベストプラクティス
1. スタースキーマまたはスノーフレークスキーマの採用
2. クラスタリングキーの適切な設定
3. マテリアライズドビューの活用

## まとめ
Snowflakeを使うことで、効率的かつスケーラブルなデータウェアハウスを構築できます。
`
  },
  {
    id: '002',
    title: 'dbtで実現するデータ変換の自動化',
    labels: ['dbt', 'モデリング'],
    createdAt: '2026-01-05',
    excerpt: 'dbtを使ったデータ変換パイプラインの構築とベストプラクティスを紹介します。',
    content: `# dbtで実現するデータ変換の自動化

## dbtとは
dbt (data build tool) は、SQLベースのデータ変換ツールです。

## 主な機能
- **モジュール化されたSQL**: 再利用可能なSQLモデルの作成
- **テスト機能**: データ品質の自動チェック
- **ドキュメント生成**: 自動的にデータカタログを作成

## サンプルコード
\`\`\`sql
-- models/staging/stg_orders.sql
with source as (
    select * from {{ source('raw', 'orders') }}
)

select
    order_id,
    customer_id,
    order_date,
    total_amount
from source
\`\`\`

## まとめ
dbtを活用することで、保守性の高いデータパイプラインを構築できます。
`
  },
  {
    id: '003',
    title: 'Terraformでインフラをコード化する',
    labels: ['Terraform'],
    createdAt: '2026-01-04',
    excerpt: 'Infrastructure as Codeの実践。Terraformを使ったインフラ管理の基礎を学びます。',
    content: `# Terraformでインフラをコード化する

## Infrastructure as Code (IaC)
インフラをコードで管理することで、再現性と保守性が向上します。

## Terraformの基本
\`\`\`hcl
# main.tf
resource "aws_s3_bucket" "data_lake" {
  bucket = "my-data-lake-bucket"

  tags = {
    Environment = "Production"
    ManagedBy   = "Terraform"
  }
}
\`\`\`

## ベストプラクティス
1. 状態ファイル（tfstate）はリモートで管理
2. モジュールを活用して再利用性を高める
3. 変数を使って環境ごとの設定を分離

## まとめ
Terraformでインフラをコード化することで、チーム開発が容易になります。
`
  },
  {
    id: '004',
    title: '今日の学びと気づき',
    labels: ['日記'],
    createdAt: '2026-01-03',
    excerpt: '日々の学習記録と気づきを残しておく場所。',
    content: `# 今日の学びと気づき

## 今日学んだこと
- Reactの新しいフック機能について
- TypeScriptの型推論の仕組み

## 気づき
小さな改善を積み重ねることの重要性を改めて実感しました。

## 明日やること
- [ ] データモデリングの復習
- [ ] 新しいプロジェクトの設計
`
  }
]
