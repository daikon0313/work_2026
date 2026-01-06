export type ArticleLabel = 'Snowflake' | 'モデリング' | 'dbt' | 'Terraform' | '日記' | 'その他'

export interface Article {
  id: string
  title: string
  labels: ArticleLabel[]
  content: string
  createdAt: string
  excerpt?: string
}
