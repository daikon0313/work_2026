import { useState } from 'react'
import './AddReadingForm.css'

interface AddReadingFormProps {
  onAdd: (title: string, reason: string) => void
  onCancel?: () => void
}

function AddReadingForm({ onAdd, onCancel }: AddReadingFormProps) {
  const [title, setTitle] = useState('')
  const [reason, setReason] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim() && reason.trim()) {
      onAdd(title, reason)
      setTitle('')
      setReason('')
    }
  }

  const handleCancel = () => {
    setTitle('')
    setReason('')
    onCancel?.()
  }

  return (
    <form className="add-reading-form" onSubmit={handleSubmit}>
      <h3 className="form-title">後で読む記事を追加</h3>
      <div className="form-field">
        <label htmlFor="title">タイトル</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="記事やブログのタイトル"
          required
        />
      </div>
      <div className="form-field">
        <label htmlFor="reason">読みたい理由</label>
        <textarea
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="なぜこれを読みたいのか..."
          rows={3}
          required
        />
      </div>
      <div className="form-actions">
        <button type="submit" className="submit-btn">
          追加
        </button>
        <button type="button" className="cancel-btn" onClick={handleCancel}>
          キャンセル
        </button>
      </div>
    </form>
  )
}

export default AddReadingForm
