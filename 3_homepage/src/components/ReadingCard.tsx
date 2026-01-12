import { useState } from 'react'
import type { ReadingIssue, MarkAsReadInput, DeleteReadingIssueInput, AddCommentInput, UpdateCategoryInput, ReadingCategory } from '../types/reading'
import { READING_CATEGORIES } from '../types/reading'
import './ReadingCard.css'

interface ReadingCardProps {
  issue: ReadingIssue
  onMarkAsRead?: (input: MarkAsReadInput) => Promise<void>
  onMarkAsUnread?: (issueNumber: number) => Promise<void>
  onDelete?: (input: DeleteReadingIssueInput) => Promise<void>
  onAddComment?: (input: AddCommentInput) => Promise<void>
  onUpdateCategory?: (input: UpdateCategoryInput) => Promise<void>
}

function ReadingCard({ issue, onMarkAsRead, onMarkAsUnread, onDelete, onAddComment, onUpdateCategory }: ReadingCardProps) {
  const [showImpressionForm, setShowImpressionForm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showCommentForm, setShowCommentForm] = useState(false)
  const [showCategoryEdit, setShowCategoryEdit] = useState(false)
  const [impression, setImpression] = useState('')
  const [password, setPassword] = useState('')
  const [comment, setComment] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<ReadingCategory>(issue.category || 'その他')
  const [categoryPassword, setCategoryPassword] = useState('')
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

  const handleAddComment = async () => {
    if (!onAddComment || !comment.trim()) return

    setIsSubmitting(true)
    try {
      await onAddComment({
        issueNumber: issue.number,
        comment: comment
      })
      setShowCommentForm(false)
      setComment('')
      alert('コメントを追加しました！')
    } catch (error) {
      console.error('Failed to add comment:', error)
      alert('コメントの追加に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateCategory = async () => {
    if (!onUpdateCategory || !categoryPassword.trim()) return

    setIsSubmitting(true)
    try {
      await onUpdateCategory({
        issueNumber: issue.number,
        category: selectedCategory,
        password: categoryPassword
      })
      setShowCategoryEdit(false)
      setCategoryPassword('')
      alert('カテゴリを更新しました！')
    } catch (error) {
      console.error('Failed to update category:', error)
      alert('カテゴリの更新に失敗しました。パスワードを確認してください。')
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
        {issue.category && onUpdateCategory && (
          <span
            className="reading-card-category editable"
            onClick={() => setShowCategoryEdit(!showCategoryEdit)}
            title="クリックしてカテゴリを変更"
          >
            {issue.category} ✏️
          </span>
        )}
        {issue.category && !onUpdateCategory && (
          <span className="reading-card-category">{issue.category}</span>
        )}
        {issue.state === 'closed' && issue.closedAt && (
          <span>✅ {formatDate(issue.closedAt)}</span>
        )}
      </div>

      {/* カテゴリ編集フォーム */}
      {showCategoryEdit && onUpdateCategory && (
        <div className="reading-card-category-edit">
          <div style={{ marginBottom: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>
              カテゴリを選択
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as ReadingCategory)}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '0.375rem',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--background)',
                color: 'var(--text-color)',
                fontSize: '0.875rem'
              }}
            >
              {READING_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <input
              type="password"
              placeholder="管理者パスワードを入力"
              value={categoryPassword}
              onChange={(e) => setCategoryPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '0.375rem',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--background)',
                color: 'var(--text-color)',
                fontSize: '0.875rem'
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="reading-card-btn primary"
              onClick={handleUpdateCategory}
              disabled={!categoryPassword.trim() || isSubmitting}
            >
              {isSubmitting ? '更新中...' : '更新'}
            </button>
            <button
              className="reading-card-btn secondary"
              onClick={() => {
                setShowCategoryEdit(false)
                setCategoryPassword('')
                setSelectedCategory(issue.category || 'その他')
              }}
              disabled={isSubmitting}
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      {issue.state === 'closed' && issue.impression && (
        <div className="reading-card-impression">
          <h4>📝 読了感想</h4>
          <p>{issue.impression}</p>
        </div>
      )}

      {issue.state === 'open' && (
        <div className="reading-card-actions">
          {!showImpressionForm && !showDeleteConfirm && !showCommentForm ? (
            <>
              <button
                className="reading-card-btn secondary"
                onClick={() => setShowCommentForm(true)}
                style={{ flex: 1 }}
              >
                💬 コメント
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
          ) : showCommentForm ? (
            <>
              <div style={{ width: '100%' }}>
                <p style={{ marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                  この記事にコメントする
                </p>
                <textarea
                  placeholder="コメントを入力してください..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
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
                    onClick={handleAddComment}
                    disabled={!comment.trim() || isSubmitting}
                  >
                    {isSubmitting ? '送信中...' : 'コメント追加'}
                  </button>
                  <button
                    className="reading-card-btn secondary"
                    onClick={() => {
                      setShowCommentForm(false)
                      setComment('')
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
