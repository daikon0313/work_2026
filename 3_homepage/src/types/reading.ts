// GitHub Issue based reading list types

export interface ReadingIssue {
  number: number
  title: string
  url: string
  articleUrl: string // 記事のURL
  state: 'open' | 'closed'
  createdAt: string
  closedAt?: string
  impression?: string // 読んだ感想（コメントから取得）
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
