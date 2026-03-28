import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isActive = (path) => location.pathname === path ? 'navbar-link active' : 'navbar-link'

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
      setMenuOpen(false)
    }
  }

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`} id="main-navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="navbar-logo-icon">🐾</span>
          PawMart
        </Link>

        {/* Categories / Navigation Links */}
        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className={isActive('/')} onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/marketplace?category=dogs" className={isActive('/marketplace')} onClick={() => setMenuOpen(false)}>Dogs</Link>
          <Link to="/marketplace?category=cats" className={isActive('/marketplace')} onClick={() => setMenuOpen(false)}>Cats</Link>
          <Link to="/marketplace?category=birds" className={isActive('/marketplace')} onClick={() => setMenuOpen(false)}>Birds</Link>
          {user?.role === 'admin' && (
            <Link to="/admin" className={isActive('/admin')} onClick={() => setMenuOpen(false)}>Dashboard</Link>
          )}

          {/* Search bar inside mobile menu — CSS shows this when .navbar-links.open */}
          <form className="search-bar navbar-mobile-search" onSubmit={handleSearch}>
             <span className="search-icon">🔍</span>
             <input type="text" className="input" placeholder="Search pets..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </form>

          {/* Mobile Auth Links — CSS shows this when .navbar-links.open */}
          <div className="mobile-auth-links">
            <Link to="/cart" className="btn btn-outline" onClick={() => setMenuOpen(false)}>🛒 View Cart</Link>
            {user ? (
              <>
                <Link to="/profile" className="btn btn-secondary" onClick={() => setMenuOpen(false)}>👤 Profile</Link>
                <button className="btn btn-outline" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary" onClick={() => setMenuOpen(false)}>Log In</Link>
                <Link to="/register" className="btn btn-primary" onClick={() => setMenuOpen(false)}>Sign Up</Link>
              </>
            )}
          </div>
        </div>

        {/* Desktop Search Bar — hidden on mobile via CSS */}
        <form className="search-bar desktop-only" style={{ maxWidth: '300px' }} onSubmit={handleSearch}>
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            className="input" 
            placeholder="Search pets..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        <div className="navbar-actions">
          <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme" id="theme-toggle-btn">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          <Link to="/cart" className="btn btn-outline btn-sm cart-btn" title="View Cart">
            🛒
          </Link>

          {user ? (
            <>
              <Link to="/profile" className="btn btn-secondary btn-sm profile-btn">
                👤 {user.name.split(' ')[0]}
              </Link>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">Log In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}

          <button className="mobile-menu-btn" onClick={() => setMenuOpen(v => !v)} id="mobile-menu-toggle">
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>
    </nav>
  )
}
