import { useMemo } from 'react'
import type { Article } from '../types/article'
import type { ReadingIssue } from '../types/reading'
import type {
  BlogStatistics,
  ReadingStatistics,
  LabelDistribution,
  MonthlyData,
  CategoryDistribution,
} from '../types/statistics'

// 過去12ヶ月の月リストを生成
function getLast12Months(): string[] {
  const months: string[] = []
  const now = new Date()
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    months.push(month)
  }
  return months
}

// ブログ統計を計算
export function useBlogStatistics(articles: Article[]): BlogStatistics {
  return useMemo(() => {
    const totalArticles = articles.length

    // ラベル別の分布を計算
    const labelCount = new Map<string, number>()
    articles.forEach((article) => {
      article.labels.forEach((label) => {
        labelCount.set(label, (labelCount.get(label) || 0) + 1)
      })
    })

    // ラベル別分布を配列に変換し、パーセンテージを計算
    const totalLabelCount = Array.from(labelCount.values()).reduce((a, b) => a + b, 0)
    const labelDistribution: LabelDistribution[] = Array.from(labelCount.entries())
      .map(([label, count]) => ({
        label,
        count,
        percentage: totalLabelCount > 0 ? Math.round((count / totalLabelCount) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count) // 記事数の多い順にソート

    // 月別投稿数を計算（最近12ヶ月）
    const last12Months = getLast12Months()
    const monthlyCount = new Map<string, number>()

    articles.forEach((article) => {
      const month = article.createdAt.substring(0, 7) // "2026-01"形式
      monthlyCount.set(month, (monthlyCount.get(month) || 0) + 1)
    })

    const monthlyPosts: MonthlyData[] = last12Months.map((month) => ({
      month,
      count: monthlyCount.get(month) || 0,
    }))

    return {
      totalArticles,
      labelDistribution,
      monthlyPosts,
    }
  }, [articles])
}

// 読書リスト統計を計算
export function useReadingStatistics(issues: ReadingIssue[]): ReadingStatistics {
  return useMemo(() => {
    const totalCount = issues.length
    const readCount = issues.filter((i) => i.state === 'closed').length
    const unreadCount = issues.filter((i) => i.state === 'open').length
    const readingRate = totalCount > 0 ? (readCount / totalCount) * 100 : 0

    // カテゴリ別分布を計算
    const categoryCount = new Map<string, number>()
    issues.forEach(issue => {
      const category = issue.category || 'その他'
      categoryCount.set(category, (categoryCount.get(category) || 0) + 1)
    })

    const categoryDistribution: CategoryDistribution[] = Array.from(categoryCount.entries())
      .map(([category, count]) => ({
        category,
        count,
        percentage: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)

    // 月別追加数を計算（最近12ヶ月）
    const last12Months = getLast12Months()
    const monthlyCount = new Map<string, number>()

    issues.forEach((issue) => {
      const date = new Date(issue.createdAt)
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      monthlyCount.set(month, (monthlyCount.get(month) || 0) + 1)
    })

    const monthlyAdded: MonthlyData[] = last12Months.map((month) => ({
      month,
      count: monthlyCount.get(month) || 0,
    }))

    return {
      totalCount,
      readCount,
      unreadCount,
      readingRate,
      monthlyAdded,
      categoryDistribution,
    }
  }, [issues])
}
