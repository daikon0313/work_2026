export type ReadingStatus = 'to-read' | 'read'

export interface ReadingItem {
  id: string
  title: string
  url: string
  status: ReadingStatus
  reason?: string // 読みたい理由（未読時）
  impression?: string // 読んだ感想（既読時）
  createdAt: string
  readAt?: string // 読了日時
}
