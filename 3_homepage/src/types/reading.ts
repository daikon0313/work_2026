// GitHub Issue based reading list types

export interface ReadingIssue {
  number: number
  title: string
  url: string
  articleUrl: string // 記事のURL
  reason: string // 読みたい理由
  state: 'open' | 'closed'
  createdAt: string
  closedAt?: string
  impression?: string // 読んだ感想（コメントから取得）
}

export interface CreateReadingIssueInput {
  title: string
  url: string
  reason: string
}

export interface MarkAsReadInput {
  issueNumber: number
  impression: string
}
