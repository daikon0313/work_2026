import type { ReadingItem } from '../types/reading'
import './ReadingDetailModal.css'

interface ReadingDetailModalProps {
  item: ReadingItem
  onClose: () => void
  onMarkAsUnread: (id: string) => void
  onDelete: (id: string) => void
}

function ReadingDetailModal({ item, onClose, onMarkAsUnread, onDelete }: ReadingDetailModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{item.title}</h2>
          <button className="close-btn" onClick={onClose} aria-label="閉じる">
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="detail-field">
            <label>URL</label>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="detail-url"
            >
              {item.url}
            </a>
          </div>

          <div className="detail-field">
            <label>感想</label>
            <p className="detail-impression">{item.impression}</p>
          </div>

          {item.readAt && (
            <div className="detail-field">
              <label>読了日</label>
              <p className="detail-date">
                {new Date(item.readAt).toLocaleDateString('ja-JP')}
              </p>
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button
            className="unread-btn"
            onClick={() => {
              onMarkAsUnread(item.id)
              onClose()
            }}
          >
            未読に戻す
          </button>
          <button
            className="delete-btn-modal"
            onClick={() => {
              onDelete(item.id)
              onClose()
            }}
          >
            削除
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReadingDetailModal
