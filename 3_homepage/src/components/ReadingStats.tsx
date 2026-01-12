import type { ReadingIssue } from '../types/reading'
import { useReadingStatistics } from '../hooks/useStatistics'
import { DEFAULT_GOALS } from '../types/goals'
import './ReadingStats.css'

interface ReadingStatsProps {
  issues: ReadingIssue[]
}

function ReadingStats({ issues }: ReadingStatsProps) {
  const stats = useReadingStatistics(issues)

  const maxCount = Math.max(...stats.monthlyAdded.map((d) => d.count), 1)
  const hasMonthlyData = stats.monthlyAdded.some((d) => d.count > 0)

  // 現在の月と年を取得
  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const currentYear = now.getFullYear()

  // 今月の既読記事数を計算
  const thisMonthRead = issues.filter((issue) => {
    if (issue.state !== 'closed' || !issue.closedAt) return false
    const closedDate = new Date(issue.closedAt)
    const closedMonth = `${closedDate.getFullYear()}-${String(closedDate.getMonth() + 1).padStart(2, '0')}`
    return closedMonth === currentMonth
  }).length

  // 今年の既読記事数を計算
  const thisYearRead = issues.filter((issue) => {
    if (issue.state !== 'closed' || !issue.closedAt) return false
    const closedDate = new Date(issue.closedAt)
    return closedDate.getFullYear() === currentYear
  }).length

  // 目標達成率を計算
  const monthlyProgress = (thisMonthRead / DEFAULT_GOALS.monthly) * 100
  const yearlyProgress = (thisYearRead / DEFAULT_GOALS.yearly) * 100

  // デバッグログ
  console.log('ReadingStats - maxCount:', maxCount)
  console.log('ReadingStats - monthlyAdded:', stats.monthlyAdded)
  console.log('ReadingStats - thisMonthRead:', thisMonthRead, 'monthlyProgress:', monthlyProgress.toFixed(1))
  console.log('ReadingStats - thisYearRead:', thisYearRead, 'yearlyProgress:', yearlyProgress.toFixed(1))

  return (
    <div className="reading-stats">
      {/* 統計カード（3つ横並び） */}
      <div className="stats-cards">
        <div className="stats-card">
          <div className="stats-card-label">総記事数</div>
          <div className="stats-card-value">{stats.totalCount}</div>
          <div className="stats-card-unit">記事</div>
        </div>

        <div className="stats-card read-card">
          <div className="stats-card-label">既読</div>
          <div className="stats-card-value">{stats.readCount}</div>
          <div className="stats-card-unit">記事</div>
        </div>

        <div className="stats-card unread-card">
          <div className="stats-card-label">未読</div>
          <div className="stats-card-value">{stats.unreadCount}</div>
          <div className="stats-card-unit">記事</div>
        </div>
      </div>

      {/* 読書率 */}
      <div className="stats-section">
        <h2>読書率</h2>
        <div className="progress-bar-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${Math.min(stats.readingRate, 100)}%` }}
            >
              {stats.readingRate > 10 && (
                <span className="progress-text">{stats.readingRate.toFixed(1)}%</span>
              )}
            </div>
            {stats.readingRate <= 10 && (
              <span className="progress-text-outside">{stats.readingRate.toFixed(1)}%</span>
            )}
          </div>
        </div>
      </div>

      {/* 学習目標達成率 */}
      <div className="stats-section">
        <h2>🎯 学習目標達成率</h2>

        {/* 月間目標 */}
        <div className="goal-item">
          <div className="goal-header">
            <span className="goal-label">今月の目標</span>
            <span className="goal-value">
              {thisMonthRead} / {DEFAULT_GOALS.monthly} 記事
              <span className={`goal-percentage ${monthlyProgress >= 100 ? 'achieved' : ''}`}>
                ({monthlyProgress.toFixed(0)}%)
              </span>
            </span>
          </div>
          <div className="goal-progress-bar">
            <div
              className={`goal-progress-fill ${monthlyProgress >= 100 ? 'achieved' : ''}`}
              style={{ width: `${Math.min(monthlyProgress, 100)}%` }}
            />
          </div>
        </div>

        {/* 年間目標 */}
        <div className="goal-item">
          <div className="goal-header">
            <span className="goal-label">{currentYear}年の目標</span>
            <span className="goal-value">
              {thisYearRead} / {DEFAULT_GOALS.yearly} 記事
              <span className={`goal-percentage ${yearlyProgress >= 100 ? 'achieved' : ''}`}>
                ({yearlyProgress.toFixed(0)}%)
              </span>
            </span>
          </div>
          <div className="goal-progress-bar">
            <div
              className={`goal-progress-fill ${yearlyProgress >= 100 ? 'achieved' : ''}`}
              style={{ width: `${Math.min(yearlyProgress, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* カテゴリ別統計 */}
      {stats.categoryDistribution && stats.categoryDistribution.length > 0 && (
        <div className="stats-section">
          <h2>📊 カテゴリ別統計</h2>
          <div className="category-stats-grid">
            {stats.categoryDistribution.map(({ category, count, percentage }) => (
              <div key={category} className="category-stat-item">
                <div className="category-stat-label">{category}</div>
                <div className="category-stat-value">{count}記事</div>
                <div className="category-stat-bar">
                  <div
                    className="category-stat-fill"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="category-stat-percentage">{percentage}%</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 月別追加数 */}
      {hasMonthlyData && (
        <div className="stats-section">
          <h2>月別追加数（最近12ヶ月）</h2>
          <div className="chart-container">
            {/* 目標ライン */}
            <div className="goal-line-container">
              <div
                className="goal-line"
                style={{
                  bottom: `${(DEFAULT_GOALS.monthly / maxCount) * 200}px`
                }}
              >
                <span className="goal-line-label">目標: {DEFAULT_GOALS.monthly}記事</span>
              </div>
            </div>

            <div className="bar-chart">
              {stats.monthlyAdded.map((item) => {
                // 最大高さ200pxに対する高さを計算
                const maxHeight = 200
                const height = maxCount > 0 ? (item.count / maxCount) * maxHeight : 0
                console.log(`ReadingStats - ${item.month}: count=${item.count}, height=${height.toFixed(2)}px`)

                return (
                  <div key={item.month} className="bar-item">
                    <div className="bar-value">{item.count > 0 ? item.count : ''}</div>
                    <div
                      className="bar-fill"
                      style={{
                        height: item.count > 0 ? `${height}px` : '0px',
                      }}
                    ></div>
                    <div className="bar-label">{item.month.substring(5)}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReadingStats
