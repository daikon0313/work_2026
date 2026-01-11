import type { Article, ArticleLabel } from '../types/article'

export interface TagStatistics {
  label: ArticleLabel
  count: number
  percentage: number
}

/**
 * 記事の配列からタグの統計情報を計算する
 */
export function calculateTagStatistics(articles: Article[]): TagStatistics[] {
  const tagCounts = new Map<ArticleLabel, number>()

  // 各記事のラベルをカウント
  articles.forEach((article) => {
    article.labels.forEach((label) => {
      tagCounts.set(label, (tagCounts.get(label) || 0) + 1)
    })
  })

  const totalTags = Array.from(tagCounts.values()).reduce((sum, count) => sum + count, 0)

  // 統計情報を作成
  const statistics: TagStatistics[] = Array.from(tagCounts.entries()).map(([label, count]) => ({
    label,
    count,
    percentage: totalTags > 0 ? (count / totalTags) * 100 : 0,
  }))

  // カウント順にソート（降順）
  return statistics.sort((a, b) => b.count - a.count)
}

/**
 * タグの使用頻度に基づいてフォントサイズを計算する
 */
export function calculateTagFontSize(count: number, minCount: number, maxCount: number): number {
  const minSize = 0.875 // 0.875rem
  const maxSize = 2 // 2rem

  if (maxCount === minCount) {
    return (minSize + maxSize) / 2
  }

  const ratio = (count - minCount) / (maxCount - minCount)
  return minSize + ratio * (maxSize - minSize)
}
