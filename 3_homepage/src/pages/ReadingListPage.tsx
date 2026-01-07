import { useState } from 'react'
import { useReadingIssues } from '../hooks/useReadingIssues'
import AddReadingForm from '../components/AddReadingForm'
import ReadingCard from '../components/ReadingCard'
import './ReadingListPage.css'

type Tab = 'to-read' | 'read'

function ReadingListPage() {
  const {
    toReadIssues,
    readIssues,
    loading,
    error,
    addIssue,
    markAsRead,
    markAsUnread,
    reload
  } = useReadingIssues()

  const [activeTab, setActiveTab] = useState<Tab>('to-read')

  const currentIssues = activeTab === 'to-read' ? toReadIssues : readIssues

  if (loading) {
    return (
      <div className="reading-list-page">
        <div className="reading-list-loading">
          <div className="reading-list-spinner"></div>
          <p>読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="reading-list-page">
      <div className="reading-list-header">
        <h1>📚 読書リスト</h1>
        <p>GitHub Issuesで管理する読みたい記事リスト</p>
      </div>

      {error && (
        <div className="reading-list-error">
          <p>エラー: {error}</p>
          <button onClick={reload}>再読み込み</button>
        </div>
      )}

      <AddReadingForm onAdd={addIssue} />

      <div className="reading-list-tabs">
        <button
          className={`reading-list-tab ${activeTab === 'to-read' ? 'active' : ''}`}
          onClick={() => setActiveTab('to-read')}
        >
          未読
          <span className="reading-list-tab-count">{toReadIssues.length}</span>
        </button>
        <button
          className={`reading-list-tab ${activeTab === 'read' ? 'active' : ''}`}
          onClick={() => setActiveTab('read')}
        >
          読了
          <span className="reading-list-tab-count">{readIssues.length}</span>
        </button>
      </div>

      <div className="reading-list-content">
        {currentIssues.length === 0 ? (
          <div className="reading-list-empty">
            <p>
              {activeTab === 'to-read'
                ? '📖 まだ読みたい記事がありません'
                : '✅ まだ読了した記事がありません'}
            </p>
            <p>
              {activeTab === 'to-read'
                ? '上のフォームから記事を追加してみましょう'
                : '記事を読了すると、ここに表示されます'}
            </p>
          </div>
        ) : (
          currentIssues.map((issue) => (
            <ReadingCard
              key={issue.number}
              issue={issue}
              onMarkAsRead={activeTab === 'to-read' ? markAsRead : undefined}
              onMarkAsUnread={activeTab === 'read' ? markAsUnread : undefined}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default ReadingListPage
