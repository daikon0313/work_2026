import { useState } from 'react'
import type { ReadingIssue, MarkAsReadInput } from '../types/reading'
import './ReadingCard.css'

interface ReadingCardProps {
  issue: ReadingIssue
  onMarkAsRead?: (input: MarkAsReadInput) => Promise<void>
  onMarkAsUnread?: (issueNumber: number) => Promise<void>
}

function ReadingCard({ issue, onMarkAsRead, onMarkAsUnread }: ReadingCardProps) {
  const [showImpressionForm, setShowImpressionForm] = useState(false)
  const [impression, setImpression] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleMarkAsRead = async () => {
    if (!onMarkAsRead || !impression.trim()) return

    setIsSubmitting(true)
    try {
      await onMarkAsRead({
        issueNumber: issue.number,
        impression: impression
      })
      setShowImpressionForm(false)
      setImpression('')
    } catch (error) {
      console.error('Failed to mark as read:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleMarkAsUnread = async () => {
    if (!onMarkAsUnread) return

    setIsSubmitting(true)
    try {
      await onMarkAsUnread(issue.number)
    } catch (error) {
      console.error('Failed to mark as unread:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className={`reading-card ${issue.state === 'closed' ? 'read' : ''}`}>
      <div className="reading-card-header">
        <div className="reading-card-title">
          <h3>
            <a href={issue.articleUrl} target="_blank" rel="noopener noreferrer">
              {issue.title}
            </a>
          </h3>
        </div>
      </div>

      <div className="reading-card-meta">
        <span>📅 {formatDate(issue.createdAt)}</span>
        <span>#{issue.number}</span>
        {issue.state === 'closed' && issue.closedAt && (
          <span>✅ {formatDate(issue.closedAt)}</span>
        )}
      </div>

      <div className="reading-card-reason">
        <p><strong>読みたい理由:</strong> {issue.reason}</p>
      </div>

      {issue.state === 'closed' && issue.impression && (
        <div className="reading-card-impression">
          <h4>📝 読了感想</h4>
          <p>{issue.impression}</p>
        </div>
      )}

      {issue.state === 'open' && (
        <div className="reading-card-actions">
          {!showImpressionForm ? (
            <button
              className="reading-card-btn primary"
              onClick={() => setShowImpressionForm(true)}
            >
              読了にする
            </button>
          ) : (
            <>
              <div style={{ width: '100%' }}>
                <textarea
                  placeholder="読んだ感想を入力してください..."
                  value={impression}
                  onChange={(e) => setImpression(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '0.375rem',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--background)',
                    color: 'var(--text-color)',
                    fontSize: '0.875rem',
                    marginBottom: '0.5rem',
                    resize: 'vertical'
                  }}
                />
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="reading-card-btn primary"
                    onClick={handleMarkAsRead}
                    disabled={!impression.trim() || isSubmitting}
                  >
                    {isSubmitting ? '送信中...' : '読了にする'}
                  </button>
                  <button
                    className="reading-card-btn secondary"
                    onClick={() => {
                      setShowImpressionForm(false)
                      setImpression('')
                    }}
                    disabled={isSubmitting}
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {issue.state === 'closed' && (
        <div className="reading-card-actions">
          <button
            className="reading-card-btn secondary"
            onClick={handleMarkAsUnread}
            disabled={isSubmitting}
          >
            {isSubmitting ? '処理中...' : '未読に戻す'}
          </button>
        </div>
      )}
    </div>
  )
}

export default ReadingCard
