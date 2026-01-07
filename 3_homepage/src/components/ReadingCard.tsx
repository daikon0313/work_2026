import { useState } from 'react'
import type { ReadingItem } from '../types/reading'
import './ReadingCard.css'

interface ReadingCardProps {
  item: ReadingItem
  onMarkAsRead: (id: string, impression: string) => void
  onDelete: (id: string) => void
  onClick?: () => void
}

function ReadingCard({ item, onMarkAsRead, onDelete, onClick }: ReadingCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [impression, setImpression] = useState(item.impression || '')

  const handleMarkAsRead = () => {
    if (impression.trim()) {
      onMarkAsRead(item.id, impression)
      setIsEditing(false)
    }
  }

  // 既読カードの場合はタイトルのみ表示
  if (item.status === 'read') {
    return (
      <div
        className="reading-card read compact"
        onClick={onClick}
        role="button"
        tabIndex={0}
      >
        <h3 className="reading-card-title">{item.title}</h3>
      </div>
    )
  }

  // 未読カードは詳細を表示
  return (
    <div className="reading-card to-read">
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

      <div className="reading-card-content">
        <p className="reading-url">
          <strong>URL:</strong>{' '}
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="url-link"
          >
            {item.url}
          </a>
        </p>
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
    </div>
  )
}

export default ReadingCard
