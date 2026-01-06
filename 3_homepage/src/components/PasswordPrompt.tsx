import { useState } from 'react'
import './PasswordPrompt.css'

interface PasswordPromptProps {
  onSubmit: (password: string) => boolean
  onCancel: () => void
}

function PasswordPrompt({ onSubmit, onCancel }: PasswordPromptProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const isValid = onSubmit(password)
    if (!isValid) {
      setError(true)
      setPassword('')
    }
  }

  return (
    <div className="password-overlay">
      <div className="password-modal">
        <h3 className="password-title">管理者認証</h3>
        <p className="password-description">
          記事を追加するにはパスワードが必要です
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            className={`password-input ${error ? 'error' : ''}`}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setError(false)
            }}
            placeholder="パスワードを入力"
            autoFocus
          />
          {error && (
            <p className="error-message">パスワードが正しくありません</p>
          )}
          <div className="password-actions">
            <button type="submit" className="submit-btn">
              確認
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={onCancel}
            >
              キャンセル
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PasswordPrompt
