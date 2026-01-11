import { useState } from 'react'
import type { ReadingIssue, MarkAsReadInput, DeleteReadingIssueInput, UpdateProgressInput } from '../types/reading'
import './ReadingCard.css'

interface ReadingCardProps {
  issue: ReadingIssue
  onMarkAsRead?: (input: MarkAsReadInput) => Promise<void>
  onMarkAsUnread?: (issueNumber: number) => Promise<void>
  onDelete?: (input: DeleteReadingIssueInput) => Promise<void>
  onUpdateProgress?: (input: UpdateProgressInput) => Promise<void>
}

function ReadingCard({ issue, onMarkAsRead, onMarkAsUnread, onDelete, onUpdateProgress }: ReadingCardProps) {
  const [showImpressionForm, setShowImpressionForm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showProgressForm, setShowProgressForm] = useState(false)
  const [impression, setImpression] = useState('')
  const [password, setPassword] = useState('')
  const [progress, setProgress] = useState(issue.progress?.toString() || '0')
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

  const handleDelete = async () => {
    if (!onDelete || !password.trim()) return

    setIsSubmitting(true)
    try {
      await onDelete({
        issueNumber: issue.number,
        password
      })
      setShowDeleteConfirm(false)
      setPassword('')
    } catch (error) {
      console.error('Failed to delete:', error)
      alert('削除に失敗しました。パスワードを確認してください。')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateProgress = async () => {
    if (!onUpdateProgress) return

    const progressNum = parseInt(progress)
    if (isNaN(progressNum) || progressNum < 0 || progressNum > 100) {
      alert('進捗率は0-100の範囲で入力してください')
      return
    }

    setIsSubmitting(true)
    try {
      await onUpdateProgress({
        issueNumber: issue.number,
        progress: progressNum
      })
      setShowProgressForm(false)
    } catch (error) {
      console.error('Failed to update progress:', error)
      alert('進捗の更新に失敗しました')
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

      {issue.state === 'closed' && issue.impression && (
        <div className="reading-card-impression">
          <h4>📝 読了感想</h4>
          <p>{issue.impression}</p>
        </div>
      )}

      {issue.state === 'open' && issue.progress !== undefined && issue.progress > 0 && (
        <div className="reading-card-progress" style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-color)' }}>
              📖 読書進捗
            </span>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary-color)' }}>
              {issue.progress}%
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            backgroundColor: 'var(--background)',
            borderRadius: '4px',
            overflow: 'hidden',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{
              width: `${issue.progress}%`,
              height: '100%',
              backgroundColor: 'var(--primary-color)',
              transition: 'width 0.3s ease',
              borderRadius: '4px'
            }}></div>
          </div>
          {issue.startedAt && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
              開始: {formatDate(issue.startedAt)}
            </div>
          )}
        </div>
      )}

      {issue.state === 'open' && (
        <div className="reading-card-actions">
          {!showImpressionForm && !showDeleteConfirm && !showProgressForm ? (
            <>
              <button
                className="reading-card-btn secondary"
                onClick={() => setShowProgressForm(true)}
                style={{ flex: 1 }}
              >
                進捗を更新
              </button>
              <button
                className="reading-card-btn primary"
                onClick={() => setShowImpressionForm(true)}
                style={{ flex: 1 }}
              >
                読了にする
              </button>
              <button
                className="reading-card-btn delete"
                onClick={() => setShowDeleteConfirm(true)}
                title="削除"
              >
                ×
              </button>
            </>
          ) : showProgressForm ? (
            <>
              <div style={{ width: '100%' }}>
                <p style={{ marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                  読書進捗を更新 (0-100%)
                </p>
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="進捗率を入力 (0-100)"
                  value={progress}
                  onChange={(e) => setProgress(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '0.375rem',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--background)',
                    color: 'var(--text-color)',
                    fontSize: '0.875rem',
                    marginBottom: '0.5rem'
                  }}
                />
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="reading-card-btn primary"
                    onClick={handleUpdateProgress}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? '更新中...' : '更新する'}
                  </button>
                  <button
                    className="reading-card-btn secondary"
                    onClick={() => {
                      setShowProgressForm(false)
                      setProgress(issue.progress?.toString() || '0')
                    }}
                    disabled={isSubmitting}
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            </>
          ) : showImpressionForm ? (
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
          ) : (
            <>
              <div style={{ width: '100%' }}>
                <p style={{ marginBottom: '0.5rem', fontSize: '0.875rem' }}>本当に削除しますか？</p>
                <input
                  type="password"
                  placeholder="管理者パスワードを入力"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '0.375rem',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--background)',
                    color: 'var(--text-color)',
                    fontSize: '0.875rem',
                    marginBottom: '0.5rem'
                  }}
                />
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="reading-card-btn danger"
                    onClick={handleDelete}
                    disabled={!password.trim() || isSubmitting}
                  >
                    {isSubmitting ? '削除中...' : '削除する'}
                  </button>
                  <button
                    className="reading-card-btn secondary"
                    onClick={() => {
                      setShowDeleteConfirm(false)
                      setPassword('')
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
