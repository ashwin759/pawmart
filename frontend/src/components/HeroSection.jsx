import { Link } from 'react-router-dom'

export default function HeroSection({ searchQuery, setSearchQuery, handleSearch }) {
  return (
    <section className="hero" id="hero-section" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left', padding: '100px 5% 80px', gap: '48px', position: 'relative' }}>
      
      {/* Gradient blobs */}
      <div className="hero-blob hero-blob-1" />
      <div className="hero-blob hero-blob-2" />
      
      <div className="hero-content fade-in" style={{ flex: '1 1 420px', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: 'var(--accent-light)', borderRadius: 'var(--radius-full)', marginBottom: '20px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--accent)' }}>
          <span>✨</span> AI-Powered Pet Marketplace
        </div>
        <h1 style={{ fontSize: '3.6rem', lineHeight: 1.1 }}>Bring Home Your<br />Perfect Pet Companion</h1>
        <p style={{ fontSize: '1.12rem', margin: '24px 0 32px', maxWidth: '480px', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          Discover pets, learn about breeds, and find the perfect companion for your family with AI-powered recommendations.
        </p>
        
        <form onSubmit={handleSearch} className="search-bar" style={{ margin: '0 0 32px 0', maxWidth: '480px' }}>
          <span className="search-icon">🔍</span>
          <input
            className="input"
            placeholder="Search small friendly dog, persian cat..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            id="hero-search-input"
          />
        </form>

        <div className="flex gap-md">
          <Link to="/marketplace" className="btn btn-primary btn-lg" style={{ background: 'var(--cta-gradient)' }}>
            Browse Pets
          </Link>
          <button className="btn btn-outline btn-lg" onClick={() => document.getElementById('ai-chat-toggle')?.click()}>
            🤖 Find Your Match
          </button>
        </div>

        {/* Trust indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px', marginTop: '44px' }}>
          {[
            { number: '500+', label: 'Happy Families' },
            { number: '50+', label: 'Breeds Available' },
            { number: '4.9★', label: 'User Rating' },
          ].map((item, i) => (
            <div key={i} style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--accent)' }}>{item.number}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Multiple layered pet images */}
      <div className="hero-images-grid slide-up" style={{ flex: '1 1 420px', position: 'relative' }}>
        {/* Paw decorations */}
        <span className="hero-paw">🐾</span>
        <span className="hero-paw">🐾</span>
        <span className="hero-paw">🐾</span>
        
        <img 
          src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
          alt="Golden Retriever"
          className="hero-img hero-img-main"
        />
        <img 
          src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" 
          alt="Cute Cat"
          className="hero-img hero-img-left"
        />
        <img 
          src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" 
          alt="French Bulldog"
          className="hero-img hero-img-right"
        />
      </div>
    </section>
  )
}
