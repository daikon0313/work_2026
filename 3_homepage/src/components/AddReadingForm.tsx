import { useState } from 'react'
import type { CreateReadingIssueInput } from '../types/reading'
import './AddReadingForm.css'

interface AddReadingFormProps {
  onAdd: (input: CreateReadingIssueInput) => Promise<void>
}

function AddReadingForm({ onAdd }: AddReadingFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim() || !url.trim() || !password.trim()) {
      setError('すべてのフィールドを入力してください')
      return
    }

    setIsSubmitting(true)
    try {
      await onAdd({ title, url, password })
      // リセット
      setTitle('')
      setUrl('')
      setPassword('')
      setIsOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : '追加に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setTitle('')
    setUrl('')
    setPassword('')
    setError(null)
    setIsOpen(false)
  }

  if (!isOpen) {
    return (
      <div className="add-reading-form-toggle">
        <button onClick={() => setIsOpen(true)}>
          📚 新しい記事を追加
        </button>
      </div>
    )
  }

  return (
    <div className="add-reading-form">
      <h3>📚 新しい記事を追加</h3>

      {error && (
        <div className="add-reading-form-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="add-reading-form-group">
          <label htmlFor="title">記事タイトル</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="記事のタイトルを入力"
            disabled={isSubmitting}
          />
        </div>

        <div className="add-reading-form-group">
          <label htmlFor="url">記事URL</label>
          <input
            type="url"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/article"
            disabled={isSubmitting}
          />
        </div>

        <div className="add-reading-form-group">
          <label htmlFor="password">管理者パスワード</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="パスワードを入力"
            disabled={isSubmitting}
          />
        </div>

        <div className="add-reading-form-actions">
          <button
            type="button"
            className="add-reading-form-btn secondary"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            キャンセル
          </button>
          <button
            type="submit"
            className="add-reading-form-btn primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? '追加中...' : '追加する'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddReadingForm
