// GitHub Issue based reading list types

// カテゴリ定義
export const READING_CATEGORIES = [
  'IT',
  '日常',
  '文化',
  'その他',
  '科学',
  '経済',
  '仕事'
] as const

export type ReadingCategory = typeof READING_CATEGORIES[number]

export interface ReadingIssue {
  number: number
  title: string
  url: string
  articleUrl: string // 記事のURL
  state: 'open' | 'closed'
  createdAt: string
  closedAt?: string
  impression?: string // 読んだ感想（コメントから取得）
  category?: ReadingCategory // 自動判定されたカテゴリ
}

export interface CreateReadingIssueInput {
  title: string
  url: string
  password: string
}

export interface DeleteReadingIssueInput {
  issueNumber: number
  password: string
}

export interface MarkAsReadInput {
  issueNumber: number
  impression: string
}

export interface AddCommentInput {
  issueNumber: number
  comment: string
}

export interface UpdateCategoryInput {
  issueNumber: number
  category: ReadingCategory
  password: string
}
