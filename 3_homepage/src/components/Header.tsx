import './Header.css'

function Header() {
  return (
    <header className="header">
      <div className="header-container">
        <h1 className="logo">Portfolio</h1>
        <nav className="nav">
          <a href="#hero">Home</a>
          <a href="#about">About</a>
          <a href="#skills">Skills</a>
          <a href="#contact">Contact</a>
        </nav>
      </div>
    </header>
  )
}

export default Header
