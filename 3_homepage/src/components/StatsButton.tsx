import { Link, useLocation } from 'react-router-dom'
import './StatsButton.css'

function StatsButton() {
  const location = useLocation()
  const isActive = location.pathname === '/stats'

  return (
    <Link
      to="/stats"
      className={`stats-button ${isActive ? 'active' : ''}`}
      aria-label="統計ページへ"
      title="統計"
    >
      📊
    </Link>
  )
}

export default StatsButton
