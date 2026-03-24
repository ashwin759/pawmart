import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import HeroSection from '../components/HeroSection'
import PetListingCard from '../components/PetListingCard'
import { getBreedThumbnail } from '../utils/breedImages'
import { useScrollAnimation } from '../utils/useScrollAnimation'

// Helper to derive breed tags from data
const getBreedTags = (breed) => {
  const tags = []
  if (breed.temperament) {
    const temps = breed.temperament.split(',').map(t => t.trim())
    temps.slice(0, 3).forEach((t, i) => {
      const colors = ['green', 'blue', 'coral', 'orange', 'purple', 'teal']
      tags.push({ label: t, color: colors[i % colors.length] })
    })
  }
  if (breed.activity_level) tags.push({ label: breed.activity_level, color: 'orange' })
  return tags
}

export default function Home() {
  const [pets, setPets] = useState([])
  const [breeds, setBreeds] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const statsRef = useScrollAnimation()
  const featuredRef = useScrollAnimation()
  const categoriesRef = useScrollAnimation()
  const breedsRef = useScrollAnimation()
  const recsRef = useScrollAnimation()
  const aiRef = useScrollAnimation()

  useEffect(() => {
    fetch('/api/pets?limit=8&available=true').then(r => r.json()).then(setPets).catch(() => {})
    fetch('/api/breeds').then(r => r.json()).then(data => {
      setBreeds(data)
      // Fetch recommendations from first breed
      if (data.length > 0) {
        fetch(`/api/search/recommendations/${data[0].id}`)
          .then(r => r.json())
          .then(setRecommendations)
          .catch(() => {})
      }
    }).catch(() => {})
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  // Category data
  const categories = [
    { icon: '🐕', title: 'Dogs', count: 'Popular breeds', color: 'green', link: '/marketplace?category=dogs' },
    { icon: '🐈', title: 'Cats', count: 'Indoor & outdoor', color: 'blue', link: '/marketplace?category=cats' },
    { icon: '🐦', title: 'Birds', count: 'Exotic & domestic', color: 'coral', link: '/marketplace?category=birds' },
    { icon: '🐹', title: 'Small Pets', count: 'Rabbits, hamsters', color: 'orange', link: '/marketplace' },
  ]

  return (
    <div className="page" style={{ paddingTop: '0' }}>
      {/* Hero */}
      <HeroSection 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        handleSearch={handleSearch} 
      />

      {/* Stats — Icon-based */}
      <section className="container scroll-animate" ref={statsRef} style={{ marginTop: '-48px', position: 'relative', zIndex: 10 }}>
        <div className="stats-grid">
          {[
            { icon: '🏡', label: 'Pets Adopted', value: '500+', color: 'var(--accent)' },
            { icon: '👨‍👩‍👧‍👦', label: 'Happy Families', value: '300+', color: 'var(--blue)' },
            { icon: '⭐', label: 'Average Rating', value: '4.9', color: 'var(--yellow)' },
            { icon: '🐾', label: 'Breeds Available', value: '50+', color: 'var(--coral)' },
          ].map((s, i) => (
            <div className="stat-card" key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.2rem', marginBottom: '8px' }}>{s.icon}</div>
              <div className="value" style={{ fontSize: '1.8rem' }}>{s.value}</div>
              <div className="label" style={{ color: s.color, marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Breed Categories */}
      <section className="container section scroll-animate" ref={categoriesRef}>
        <div style={{ textAlign: 'center', marginBottom: '12px' }}>
          <span style={{ display: 'inline-block', padding: '5px 16px', background: 'var(--accent-light)', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '16px' }}>
            Explore
          </span>
        </div>
        <h2 className="section-title text-center">Browse by Category</h2>
        <p className="section-subtitle text-center">Find the perfect pet by exploring our categories</p>
        <div className="category-grid">
          {categories.map((cat, i) => (
            <Link to={cat.link} key={i} className="category-card" data-color={cat.color}>
              <span className="category-icon">{cat.icon}</span>
              <div className="category-title">{cat.title}</div>
              <div className="category-count">{cat.count}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Pets Available */}
      <section className="container section scroll-animate" ref={featuredRef}>
        <div style={{ textAlign: 'center', marginBottom: '12px' }}>
          <span style={{ display: 'inline-block', padding: '5px 16px', background: 'var(--accent-light)', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '16px' }}>
            Marketplace
          </span>
        </div>
        <h2 className="section-title text-center">Popular Pets Available</h2>
        <p className="section-subtitle text-center">Hand-picked companions looking for their forever homes</p>
        <div className="grid grid-4">
          {pets.slice(0, 8).map(pet => (
             <PetListingCard key={pet.id} pet={pet} />
          ))}
        </div>
        {pets.length === 0 && (
          <p className="text-center" style={{ color: 'var(--text-muted)', padding: '80px 0' }}>
            No pets available yet. Seed the database to see pets here! 🐾
          </p>
        )}
        <div className="text-center" style={{ marginTop: '48px' }}>
          <Link to="/marketplace" className="btn btn-primary btn-lg">View All Pets →</Link>
        </div>
      </section>

      {/* Learn About Breeds */}
      <section className="section-wave scroll-animate" ref={breedsRef} style={{ backgroundColor: 'var(--bg-tertiary)', padding: '100px 0' }}>
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ textAlign: 'center', marginBottom: '12px' }}>
            <span style={{ display: 'inline-block', padding: '5px 16px', background: 'var(--accent-light)', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '16px' }}>
              Breed Encyclopedia
            </span>
          </div>
          <h2 className="section-title text-center">Learn About Breeds</h2>
          <p className="section-subtitle text-center">Detailed breed information to help you make the right choice</p>
          <div className="grid grid-3">
            {breeds.slice(0, 6).map(breed => (
              <Link to={`/breed/${breed.id}`} key={breed.id} className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="card-image" style={{ height: '200px' }}>
                  {(() => {
                    const thumb = getBreedThumbnail(breed.name)
                    return thumb ? (
                      <img src={thumb} alt={breed.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                    ) : (
                      <div className="pet-placeholder">🐕</div>
                    )
                  })()}
                </div>
                <div className="card-body" style={{ padding: '20px' }}>
                  <div className="card-title" style={{ fontSize: '1.15rem', marginBottom: '4px' }}>{breed.name}</div>
                  <div className="card-subtitle" style={{ marginBottom: '10px' }}>
                    {breed.origin && <span>📍 {breed.origin}</span>}
                  </div>
                  {breed.temperament && (
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '12px' }}>
                      {breed.temperament}
                    </p>
                  )}
                  {/* Breed Tags */}
                  <div className="breed-tags">
                    {getBreedTags(breed).slice(0, 4).map((tag, ti) => (
                      <span key={ti} className={`breed-tag breed-tag-${tag.color}`}>{tag.label}</span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recommended Pets For You */}
      {recommendations.length > 0 && (
        <section className="container section scroll-animate" ref={recsRef}>
          <div style={{ textAlign: 'center', marginBottom: '12px' }}>
            <span style={{ display: 'inline-block', padding: '5px 16px', background: 'rgba(139, 92, 246, 0.10)', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 700, color: 'var(--purple)', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '16px' }}>
              Personalized
            </span>
          </div>
          <h2 className="section-title text-center">Recommended Pets For You</h2>
          <p className="section-subtitle text-center">Based on breed similarities and temperament matching</p>
          <div className="grid grid-3">
            {recommendations.slice(0, 6).map(rec => (
              <Link to={`/breed/${rec.id}`} key={rec.id} className="card recommendation-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="card-body" style={{ padding: '24px' }}>
                  {(() => {
                    const thumb = getBreedThumbnail(rec.name)
                    return thumb ? (
                      <div style={{ width: '72px', height: '72px', borderRadius: '50%', overflow: 'hidden', marginBottom: '14px', boxShadow: 'var(--shadow-md)', border: '3px solid var(--bg-secondary)' }}>
                        <img src={thumb} alt={rec.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                      </div>
                    ) : (
                      <div style={{ fontSize: '2.5rem', marginBottom: '14px' }}>🐕</div>
                    )
                  })()}
                  <div className="card-title" style={{ fontSize: '1.1rem' }}>{rec.name}</div>
                  <div className="card-subtitle" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ background: 'var(--bg-tertiary)', padding: '2px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem' }}>{rec.size}</span>
                    <span style={{ background: 'var(--bg-tertiary)', padding: '2px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem' }}>{rec.activity_level}</span>
                  </div>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '10px', lineHeight: 1.5 }}>{rec.temperament}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* AI Feature */}
      <section className="container section text-center scroll-animate" ref={aiRef}>
        <div className="card ai-banner" style={{ padding: '88px 48px', maxWidth: '820px', margin: '0 auto', background: 'var(--hero-gradient)', color: 'white', border: 'none', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '300px', height: '300px', background: 'rgba(255,255,255,0.06)', borderRadius: '50%', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-15%', left: '-5%', width: '200px', height: '200px', background: 'rgba(255,255,255,0.04)', borderRadius: '50%', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '20px' }}>🤖</div>
            <h2 className="section-title" style={{ color: 'white', fontSize: '2rem' }}>AI Pet Advisor</h2>
            <p style={{ marginBottom: '36px', fontSize: '1.05rem', opacity: 0.92, maxWidth: '500px', margin: '0 auto 36px', lineHeight: 1.7 }}>
              Not sure which breed is right for you? Our AI advisor can recommend the perfect pet based on your lifestyle, living space, and preferences.
            </p>
            <button className="btn btn-lg" onClick={() => document.getElementById('ai-chat-toggle')?.click()} style={{ background: 'white', color: '#22C55E', fontWeight: 700, boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
              Chat with AI Advisor →
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
