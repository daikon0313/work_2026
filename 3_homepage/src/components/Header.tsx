import { Link, useLocation } from 'react-router-dom'
import DarkModeToggle from './DarkModeToggle'
import StatsButton from './StatsButton'
import './Header.css'

function Header() {
  const location = useLocation()

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo-link">
          <h1 className="logo">Benjamin Blog</h1>
        </Link>
        <div className="header-right">
          <nav className="nav">
            <Link
              to="/"
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            >
              ブログ
            </Link>
            <Link
              to="/reading-list"
              className={`nav-link ${location.pathname === '/reading-list' ? 'active' : ''}`}
            >
              読書リスト
            </Link>
          </nav>
          <StatsButton />
          <DarkModeToggle />
        </div>
      </div>
    </header>
  )
}

export default Header
