import { ADMIN_PASSWORD } from '../config/auth'

export function useAuth() {
  // パスワードを検証（都度入力が必要）
  const authenticate = (password: string): boolean => {
    return password === ADMIN_PASSWORD
  }

  return {
    authenticate,
  }
}
