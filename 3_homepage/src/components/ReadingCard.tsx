import { useState } from 'react'
import type { ReadingItem } from '../types/reading'
import './ReadingCard.css'

interface ReadingCardProps {
  item: ReadingItem
  onMarkAsRead: (id: string, impression: string) => void
  onMarkAsUnread: (id: string) => void
  onDelete: (id: string) => void
}

function ReadingCard({ item, onMarkAsRead, onMarkAsUnread, onDelete }: ReadingCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [impression, setImpression] = useState(item.impression || '')

  const handleMarkAsRead = () => {
    if (impression.trim()) {
      onMarkAsRead(item.id, impression)
      setIsEditing(false)
    }
  }

  const handleMarkAsUnread = () => {
    onMarkAsUnread(item.id)
    setImpression('')
  }

  return (
    <div className={`reading-card ${item.status === 'read' ? 'read' : 'to-read'}`}>
      <div className="reading-card-header">
        <h3 className="reading-card-title">{item.title}</h3>
        <button
          className="delete-btn"
          onClick={() => onDelete(item.id)}
          aria-label="削除"
        >
          ×
        </button>
      </div>

      {item.status === 'to-read' ? (
        <>
          <div className="reading-card-content">
            <p className="reading-reason">
              <strong>読みたい理由:</strong> {item.reason}
            </p>
          </div>
          {!isEditing ? (
            <button
              className="mark-read-btn"
              onClick={() => setIsEditing(true)}
            >
              読了にする
            </button>
          ) : (
            <div className="impression-form">
              <textarea
                className="impression-input"
                value={impression}
                onChange={(e) => setImpression(e.target.value)}
                placeholder="読んだ感想を入力してください..."
                rows={3}
              />
              <div className="form-actions">
                <button
                  className="save-btn"
                  onClick={handleMarkAsRead}
                  disabled={!impression.trim()}
                >
                  保存
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => setIsEditing(false)}
                >
                  キャンセル
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="reading-card-content">
            <p className="reading-impression">
              <strong>感想:</strong> {item.impression}
            </p>
            {item.readAt && (
              <p className="read-date">
                読了日: {new Date(item.readAt).toLocaleDateString('ja-JP')}
              </p>
            )}
          </div>
          <button
            className="mark-unread-btn"
            onClick={handleMarkAsUnread}
          >
            未読に戻す
          </button>
        </>
      )}
    </div>
  )
}

export default ReadingCard
