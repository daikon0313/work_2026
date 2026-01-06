import { Link, useLocation } from 'react-router-dom'
import './Header.css'

function Header() {
  const location = useLocation()

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo-link">
          <h1 className="logo">Benjamin Blog</h1>
        </Link>
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
      </div>
    </header>
  )
}

export default Header
