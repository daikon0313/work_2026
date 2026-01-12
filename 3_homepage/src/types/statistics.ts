export interface LabelDistribution {
  label: string
  count: number
  percentage: number
}

export interface CategoryDistribution {
  category: string
  count: number
  percentage: number
}

export interface MonthlyData {
  month: string // "2026-01"形式
  count: number
}

export interface BlogStatistics {
  totalArticles: number
  labelDistribution: LabelDistribution[]
  monthlyPosts: MonthlyData[]
}

export interface ReadingStatistics {
  totalCount: number
  readCount: number
  unreadCount: number
  readingRate: number // 0-100のパーセンテージ
  monthlyAdded: MonthlyData[]
  categoryDistribution?: CategoryDistribution[] // カテゴリ別分布
}
