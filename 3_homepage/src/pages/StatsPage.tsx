import { useState } from 'react'
import { articles } from '../data/articles'
import { useReadingIssues } from '../hooks/useReadingIssues'
import BlogStats from '../components/BlogStats'
import ReadingStats from '../components/ReadingStats'
import './StatsPage.css'

type Tab = 'blog' | 'reading'

function StatsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('blog')
  const { issues, loading } = useReadingIssues()

  if (loading) {
    return (
      <div className="stats-page">
        <div className="stats-loading">
          <div className="stats-spinner"></div>
          <p>統計を計算中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="stats-page">
      <div className="stats-header">
        <h1>📊 統計情報</h1>
      </div>

      <div className="stats-tabs">
        <button
          className={`stats-tab ${activeTab === 'blog' ? 'active' : ''}`}
          onClick={() => setActiveTab('blog')}
        >
          ブログ統計
        </button>
        <button
          className={`stats-tab ${activeTab === 'reading' ? 'active' : ''}`}
          onClick={() => setActiveTab('reading')}
        >
          読書リスト統計
        </button>
      </div>

      <div className="stats-content">
        {activeTab === 'blog' ? (
          <BlogStats articles={articles} />
        ) : (
          <ReadingStats issues={issues} />
        )}
      </div>
    </div>
  )
}

export default StatsPage
