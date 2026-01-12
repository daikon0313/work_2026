import { useState, useMemo } from 'react'
import { useReadingIssues } from '../hooks/useReadingIssues'
import AddReadingForm from '../components/AddReadingForm'
import ReadingCard from '../components/ReadingCard'
import ReadingCategoryFilter from '../components/ReadingCategoryFilter'
import type { ReadingCategory } from '../types/reading'
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
    deleteIssue,
    addComment,
    updateCategory,
    reload
  } = useReadingIssues()

  const [activeTab, setActiveTab] = useState<Tab>('to-read')
  const [selectedCategory, setSelectedCategory] = useState<ReadingCategory | null>(null)

  // タブとカテゴリの両方でフィルタリング
  const currentIssues = useMemo(() => {
    const tabFiltered = activeTab === 'to-read' ? toReadIssues : readIssues

    if (selectedCategory === null) {
      return tabFiltered
    }

    return tabFiltered.filter(issue => issue.category === selectedCategory)
  }, [activeTab, selectedCategory, toReadIssues, readIssues])

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

      {/* カテゴリフィルター */}
      <ReadingCategoryFilter
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        issues={activeTab === 'to-read' ? toReadIssues : readIssues}
      />

      <div className="reading-list-content">
        {currentIssues.length === 0 ? (
          <div className="reading-list-empty">
            <p>
              {selectedCategory
                ? `📖 「${selectedCategory}」カテゴリの記事がありません`
                : (activeTab === 'to-read'
                  ? '📖 まだ読みたい記事がありません'
                  : '✅ まだ読了した記事がありません')
              }
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
              onDelete={activeTab === 'to-read' ? deleteIssue : undefined}
              onAddComment={activeTab === 'to-read' ? addComment : undefined}
              onUpdateCategory={updateCategory}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default ReadingListPage
