import { useState } from 'react'
import { useReadingList } from '../hooks/useReadingList'
import { useAuth } from '../hooks/useAuth'
import AddReadingForm from '../components/AddReadingForm'
import ReadingCard from '../components/ReadingCard'
import PasswordPrompt from '../components/PasswordPrompt'
import ReadingDetailModal from '../components/ReadingDetailModal'
import type { ReadingItem } from '../types/reading'
import './ReadingListPage.css'

function ReadingListPage() {
  const {
    toReadItems,
    readItems,
    addItem,
    markAsRead,
    markAsUnread,
    deleteItem,
  } = useReadingList()

  const { authenticate } = useAuth()
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ReadingItem | null>(null)

  const handleAuthSuccess = (password: string): boolean => {
    const success = authenticate(password)
    if (success) {
      setShowPasswordPrompt(false)
      setShowAddForm(true)
    }
    return success
  }

  const handleAddItem = (title: string, url: string, reason: string) => {
    addItem(title, url, reason)
    // 追加後はフォームを閉じる（再度パスワードが必要になる）
    setShowAddForm(false)
  }

  return (
    <div className="reading-list-page">
      <div className="reading-list-container">
        <h1 className="page-title">読書リスト</h1>

        {showAddForm ? (
          <AddReadingForm
            onAdd={handleAddItem}
            onCancel={() => setShowAddForm(false)}
          />
        ) : (
          <button
            className="add-reading-btn"
            onClick={() => setShowPasswordPrompt(true)}
          >
            + 新しい記事を追加
          </button>
        )}

        {showPasswordPrompt && (
          <PasswordPrompt
            onSubmit={handleAuthSuccess}
            onCancel={() => setShowPasswordPrompt(false)}
          />
        )}

        <section className="reading-section">
          <h2 className="section-title">
            後で読む <span className="count">({toReadItems.length})</span>
          </h2>
          {toReadItems.length === 0 ? (
            <p className="empty-message">まだ記事が追加されていません</p>
          ) : (
            <div className="reading-grid">
              {toReadItems.map((item) => (
                <ReadingCard
                  key={item.id}
                  item={item}
                  onMarkAsRead={markAsRead}
                  onDelete={deleteItem}
                />
              ))}
            </div>
          )}
        </section>

        <section className="reading-section">
          <h2 className="section-title">
            読了 <span className="count">({readItems.length})</span>
          </h2>
          {readItems.length === 0 ? (
            <p className="empty-message">まだ読了した記事がありません</p>
          ) : (
            <div className="reading-grid">
              {readItems.map((item) => (
                <ReadingCard
                  key={item.id}
                  item={item}
                  onMarkAsRead={markAsRead}
                  onDelete={deleteItem}
                  onClick={() => setSelectedItem(item)}
                />
              ))}
            </div>
          )}
        </section>

        {selectedItem && (
          <ReadingDetailModal
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            onMarkAsUnread={markAsUnread}
            onDelete={deleteItem}
          />
        )}
      </div>
    </div>
  )
}

export default ReadingListPage
