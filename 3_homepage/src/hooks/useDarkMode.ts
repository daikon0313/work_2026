import { useState, useEffect } from 'react'

const DARK_MODE_KEY = 'dark-mode'

export function useDarkMode() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    // localStorageから初期値を取得
    const stored = localStorage.getItem(DARK_MODE_KEY)
    if (stored !== null) {
      return stored === 'true'
    }
    // システムの設定を確認
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    // bodyのclass属性を更新
    if (isDark) {
      document.documentElement.classList.add('dark-mode')
    } else {
      document.documentElement.classList.remove('dark-mode')
    }

    // localStorageに保存
    localStorage.setItem(DARK_MODE_KEY, String(isDark))
  }, [isDark])

  const toggle = () => setIsDark((prev) => !prev)

  return { isDark, toggle }
}
