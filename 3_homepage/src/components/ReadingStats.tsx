import type { ReadingIssue } from '../types/reading'
import { useReadingStatistics } from '../hooks/useStatistics'
import './ReadingStats.css'

interface ReadingStatsProps {
  issues: ReadingIssue[]
}

function ReadingStats({ issues }: ReadingStatsProps) {
  const stats = useReadingStatistics(issues)

  const maxCount = Math.max(...stats.monthlyAdded.map((d) => d.count), 1)
  const hasMonthlyData = stats.monthlyAdded.some((d) => d.count > 0)

  // デバッグログ
  console.log('ReadingStats - maxCount:', maxCount)
  console.log('ReadingStats - monthlyAdded:', stats.monthlyAdded)

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

      {/* 月別追加数 */}
      {hasMonthlyData && (
        <div className="stats-section">
          <h2>月別追加数（最近12ヶ月）</h2>
          <div className="bar-chart">
            {stats.monthlyAdded.map((item) => {
              const percentage = (item.count / maxCount) * 100
              console.log(`ReadingStats - ${item.month}: count=${item.count}, percentage=${percentage.toFixed(2)}%`)

              return (
                <div key={item.month} className="bar-item">
                  <div className="bar-value">{item.count > 0 ? item.count : ''}</div>
                  <div
                    className="bar-fill"
                    style={{
                      height: `${percentage}%`,
                    }}
                  ></div>
                  <div className="bar-label">{item.month.substring(5)}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default ReadingStats
