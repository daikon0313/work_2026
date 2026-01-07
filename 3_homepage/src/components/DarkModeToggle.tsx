import { useDarkMode } from '../hooks/useDarkMode'
import './DarkModeToggle.css'

function DarkModeToggle() {
  const { isDark, toggle } = useDarkMode()

  return (
    <button
      className="dark-mode-toggle"
      onClick={toggle}
      aria-label={isDark ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
      title={isDark ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  )
}

export default DarkModeToggle
