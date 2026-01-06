import { useState, useEffect } from 'react'
import { ADMIN_PASSWORD } from '../config/auth'

const AUTH_STORAGE_KEY = 'reading-list-auth'

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // localStorageから認証状態を復元
  useEffect(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY)
    if (stored === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  // パスワードを検証
  const authenticate = (password: string): boolean => {
    const isValid = password === ADMIN_PASSWORD
    if (isValid) {
      setIsAuthenticated(true)
      localStorage.setItem(AUTH_STORAGE_KEY, 'true')
    }
    return isValid
  }

  // ログアウト
  const logout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }

  return {
    isAuthenticated,
    authenticate,
    logout,
  }
}
