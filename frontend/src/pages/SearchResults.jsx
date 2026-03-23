import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) {
      setQuery(q)
      performSearch(q)
    }
  }, [searchParams])

  const performSearch = async (q) => {
    if (!q.trim()) return
    setLoading(true)
    setSearched(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResults(data)
    } catch {
      setResults([])
    }
    setLoading(false)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      setSearchParams({ q: query })
    }
  }

  return (
    <div className="page container">
      <div className="slide-up">
        <h1 className="section-title">Search Pets & Breeds</h1>
        <p className="section-subtitle">Search by name, breed, size, or temperament</p>
      </div>

      <form onSubmit={handleSearch} className="search-bar mb-lg" style={{ maxWidth: '100%' }}>
        <span className="search-icon">🔍</span>
        <input
          className="input"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Try 'Golden Retriever', 'friendly', 'small apartment dog'..."
          id="search-input"
        />
      </form>

      {loading ? (
        <div><div className="spinner" /><p className="loading-text">Searching...</p></div>
      ) : searched ? (
        <>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
            {results.length} result{results.length !== 1 ? 's' : ''} for "<strong>{searchParams.get('q')}</strong>"
          </p>
          <div className="grid grid-4">
            {results.map(pet => (
              <Link to={`/pet/${pet.id}`} key={pet.id} className="card slide-up" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="card-image">
                  {pet.image_url ? (
                    <img src={pet.image_url} alt={pet.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div className="pet-placeholder">🐾</div>
                  )}
                </div>
                <div className="card-body">
                  <div className="card-title">{pet.name}</div>
                  <div className="card-subtitle">{pet.breed_name || 'Mixed'} · {pet.age} · {pet.gender}</div>
                </div>
                <div className="card-footer">
                  <span className="card-price">${pet.price?.toLocaleString()}</span>
                  <span className={`badge ${pet.availability ? 'badge-available' : 'badge-unavailable'}`}>
                    {pet.availability ? 'Available' : 'Sold'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
          {results.length === 0 && (
            <div className="text-center" style={{ padding: '60px 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</div>
              <h3>No results found</h3>
              <p style={{ color: 'var(--text-muted)' }}>Try different keywords or ask our AI advisor for help</p>
            </div>
          )}
        </>
      ) : (
        <div className="text-center" style={{ padding: '60px 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🐾</div>
          <p>Enter a search term to find pets and breeds</p>
        </div>
      )}
    </div>
  )
}
