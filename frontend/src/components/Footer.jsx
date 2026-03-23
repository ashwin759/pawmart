import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <h3>🐾 PawMart</h3>
          <p>Your trusted AI-powered pet marketplace. Find your perfect companion with breed information, expert care advice, and personalized recommendations.</p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            {['🐕', '🐈', '🐦'].map((emoji, i) => (
              <span key={i} style={{ 
                width: '36px', height: '36px', borderRadius: 'var(--radius-full)', 
                background: 'var(--accent-light)', display: 'flex', alignItems: 'center', 
                justifyContent: 'center', fontSize: '1rem', cursor: 'pointer',
                transition: 'transform 0.2s ease',
              }}>
                {emoji}
              </span>
            ))}
          </div>
        </div>
        <div className="footer-links">
          <h4>Explore</h4>
          <Link to="/marketplace">Browse Pets</Link>
          <Link to="/marketplace?category=dogs">Dogs</Link>
          <Link to="/marketplace?category=cats">Cats</Link>
          <Link to="/search">Search</Link>
        </div>
        <div className="footer-links">
          <h4>Company</h4>
          <a href="#help">Help Center</a>
          <a href="#contact">Contact Us</a>
          <a href="#privacy">Privacy Policy</a>
          <Link to="/register">Create Account</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2026 PawMart — AI-Powered Pet Marketplace. Built with ❤️ for pet lovers.</p>
      </div>
    </footer>
  )
}
