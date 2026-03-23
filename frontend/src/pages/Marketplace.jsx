import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getPetImage } from '../utils/breedImages'

export default function Marketplace() {
  const [searchParams] = useSearchParams()
  const category = searchParams.get('category')
  const [pets, setPets] = useState([])
  const [breeds, setBreeds] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [filters, setFilters] = useState({ breed_id: '', gender: '', available: '' })
  const limit = 12

  useEffect(() => {
    const url = category ? `/api/breeds?category=${category}` : '/api/breeds'
    fetch(url).then(r => r.json()).then(setBreeds).catch(() => {})
  }, [category])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ page, limit })
    if (category) params.set('category', category)
    if (filters.breed_id) params.set('breed_id', filters.breed_id)
    if (filters.gender) params.set('gender', filters.gender)
    if (filters.available !== '') params.set('available', filters.available)

    Promise.all([
      fetch(`/api/pets?${params}`).then(r => r.json()),
      fetch(`/api/pets/count?${params}`).then(r => r.json()),
    ]).then(([petsData, countData]) => {
      setPets(petsData)
      setTotal(countData.count)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [page, filters, category])

  const totalPages = Math.ceil(total / limit)

  const handleFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPage(1)
  }

  return (
    <div className="page container">
      <div className="slide-up">
        <h1 className="section-title" style={{ textTransform: 'capitalize' }}>
          {category ? `${category} Marketplace` : 'Pet Marketplace'}
        </h1>
        <p className="section-subtitle">Find your perfect companion from our curated selection</p>
      </div>

      {/* Filters */}
      <div className="filter-bar" id="marketplace-filters">
        <select className="input" value={filters.breed_id} onChange={e => handleFilter('breed_id', e.target.value)} id="filter-breed">
          <option value="">All Breeds</option>
          {breeds.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select className="input" value={filters.gender} onChange={e => handleFilter('gender', e.target.value)} id="filter-gender">
          <option value="">All Genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
        <select className="input" value={filters.available} onChange={e => handleFilter('available', e.target.value)} id="filter-availability">
          <option value="">All Status</option>
          <option value="true">Available</option>
          <option value="false">Sold</option>
        </select>
        <div style={{ flex: 1 }} />
        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{total} pets found</span>
      </div>

      {loading ? (
        <div className="grid grid-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card">
              <div className="skeleton" style={{ width: '100%', height: '220px' }}></div>
              <div className="card-body">
                <div className="skeleton" style={{ width: '60%', height: '24px', marginBottom: '8px' }}></div>
                <div className="skeleton" style={{ width: '80%', height: '16px', marginBottom: '16px' }}></div>
                <div className="skeleton" style={{ width: '100%', height: '12px', marginBottom: '6px' }}></div>
                <div className="skeleton" style={{ width: '90%', height: '12px' }}></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-4">
            {pets.map(pet => (
              <Link to={`/pet/${pet.id}`} key={pet.id} className="card slide-up" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="card-image">
                  {(() => {
                    const imgSrc = getPetImage(pet)
                    return imgSrc ? (
                      <img src={imgSrc} alt={pet.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} className="img-loading" loading="lazy" onLoad={e => e.target.classList.replace('img-loading', 'img-loaded')} />
                    ) : (
                      <div className="pet-placeholder">🐾</div>
                    )
                  })()}
                </div>
                <div className="card-body">
                  <div className="card-title">{pet.name}</div>
                  <div className="card-subtitle">{pet.breed_name || 'Mixed'} · {pet.age || 'Age N/A'} · {pet.gender}</div>
                  {pet.description && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {pet.description}
                    </p>
                  )}
                </div>
                <div className="card-footer">
                  <span className="card-price">${pet.price.toLocaleString()}</span>
                  <span className={`badge ${pet.availability ? 'badge-available' : 'badge-unavailable'}`}>
                    {pet.availability ? 'Available' : 'Sold'}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {pets.length === 0 && (
            <p className="text-center" style={{ color: 'var(--text-muted)', padding: '60px 0' }}>
              No pets match your filters. Try adjusting your criteria.
            </p>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                <button key={p} className={page === p ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
