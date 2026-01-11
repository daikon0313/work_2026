// ラベルの定義（1箇所で管理）
export const ARTICLE_LABELS = [
  'Snowflake',
  'Databricks',
  'モデリング',
  'dbt',
  'Terraform',
  'その他'
] as const

// 配列から型を導出
export type ArticleLabel = typeof ARTICLE_LABELS[number]

export interface Article {
  id: string
  title: string
  labels: ArticleLabel[]
  content: string
  createdAt: string
  excerpt?: string
  discussionUrl?: string
}
