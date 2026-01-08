import type { Article } from '../types/article'
import { useBlogStatistics } from '../hooks/useStatistics'
import './BlogStats.css'

interface BlogStatsProps {
  articles: Article[]
}

// ラベルごとの色を定義
const LABEL_COLORS: Record<string, string> = {
  Snowflake: '#29B5E8',
  Databricks: '#FF3621',
  モデリング: '#10B981',
  dbt: '#FF694B',
  Terraform: '#7B42BC',
  その他: '#6B7280',
}

// conic-gradientの文字列を生成
function generateConicGradient(
  distribution: Array<{ label: string; percentage: number }>
): string {
  let angle = 0
  const gradients = distribution.map((item) => {
    const startAngle = angle
    angle += (item.percentage / 100) * 360
    const color = LABEL_COLORS[item.label] || '#6B7280'
    return `${color} ${startAngle}deg ${angle}deg`
  })
  return `conic-gradient(${gradients.join(', ')})`
}

function BlogStats({ articles }: BlogStatsProps) {
  const stats = useBlogStatistics(articles)

  if (articles.length === 0) {
    return (
      <div className="stats-empty">
        <p>📝 まだ記事がありません</p>
        <p>記事を追加すると、ここに統計が表示されます</p>
      </div>
    )
  }

  const maxCount = Math.max(...stats.monthlyPosts.map((d) => d.count), 1)

  return (
    <div className="blog-stats">
      {/* 記事総数カード */}
      <div className="stats-card total-card">
        <div className="stats-card-label">記事総数</div>
        <div className="stats-card-value">{stats.totalArticles}</div>
        <div className="stats-card-unit">記事</div>
      </div>

      {/* ラベル別分布（円グラフ） */}
      <div className="stats-section">
        <h2>ラベル別分布</h2>
        <div className="pie-chart-container">
          <div
            className="pie-chart"
            style={{
              background: generateConicGradient(stats.labelDistribution),
            }}
          ></div>
          <div className="pie-legend">
            {stats.labelDistribution.map((item) => (
              <div key={item.label} className="legend-item">
                <span
                  className="legend-color"
                  style={{ background: LABEL_COLORS[item.label] || '#6B7280' }}
                ></span>
                <span className="legend-label">{item.label}</span>
                <span className="legend-value">
                  {item.count}記事 ({item.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 月別投稿数（棒グラフ） */}
      <div className="stats-section">
        <h2>月別投稿数（最近12ヶ月）</h2>
        <div className="bar-chart">
          {stats.monthlyPosts.map((item) => (
            <div key={item.month} className="bar-item">
              <div className="bar-value">{item.count > 0 ? item.count : ''}</div>
              <div
                className="bar-fill"
                style={{
                  height: `${(item.count / maxCount) * 100}%`,
                }}
              ></div>
              <div className="bar-label">{item.month.substring(5)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default BlogStats
