import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getBreedThumbnail, getPetImage } from '../utils/breedImages'

export default function PetDetail() {
  const { id } = useParams()
  const { user, authFetch } = useAuth()
  const navigate = useNavigate()
  const [pet, setPet] = useState(null)
  const [breed, setBreed] = useState(null)
  const [diets, setDiets] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [galleryImages, setGalleryImages] = useState([])
  const [selectedImage, setSelectedImage] = useState(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [ordering, setOrdering] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    setLoading(true)
    fetch(`/api/pets/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        setPet(data)
        // Set gallery images from API response
        if (data.gallery_images && data.gallery_images.length > 0) {
          setGalleryImages(data.gallery_images)
        }
        if (data.breed_id) {
          fetch(`/api/breeds/${data.breed_id}`).then(r => r.json()).then(setBreed)
          fetch(`/api/diets?breed_id=${data.breed_id}`).then(r => r.json()).then(setDiets)
          fetch(`/api/search/recommendations/${data.breed_id}`).then(r => r.json()).then(setRecommendations)
        }
        setLoading(false)
      })
      .catch(() => { setLoading(false) })
  }, [id])

  // Determine main image: selected gallery image > pet's own image > breed thumbnail
  const mainImage = selectedImage || getPetImage(pet)
  const breedThumb = pet ? getBreedThumbnail(pet.breed_name) : null

  const handleOrder = async () => {
    if (!user) { navigate('/login'); return }
    setOrdering(true)
    try {
      const res = await authFetch('/api/orders', {
        method: 'POST',
        body: JSON.stringify({ pet_id: parseInt(id) }),
      })
      if (res.ok) {
        setMessage('✅ Order placed successfully! Check your profile for details.')
        setPet(prev => ({ ...prev, availability: false }))
      } else {
        const err = await res.json()
        setMessage(`❌ ${err.detail}`)
      }
    } catch {
      setMessage('❌ Something went wrong. Please try again.')
    }
    setOrdering(false)
  }

  if (loading) return <div className="page container"><div className="spinner" /><p className="loading-text">Loading pet details...</p></div>
  if (!pet) return <div className="page container text-center"><h2>Pet not found</h2><Link to="/marketplace" className="btn btn-primary mt-lg">Back to Marketplace</Link></div>

  return (
    <div className="page container fade-in">
      <div className="pet-detail slide-up">
        {/* Image Section */}
        <div>
          {/* Main Image */}
          <div 
            style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', marginBottom: '16px', cursor: mainImage ? 'zoom-in' : 'default', position: 'relative' }}
            onClick={() => mainImage && setLightboxOpen(true)}
          >
            {mainImage ? (
              <img key={mainImage} src={mainImage} alt={pet.name} className="pet-detail-image fade-in" style={{ width: '100%', height: '450px', objectFit: 'cover', borderRadius: 'var(--radius-xl)', transition: 'transform var(--transition-slow)' }} />
            ) : (
              <div className="pet-detail-image pet-placeholder" style={{ fontSize: '5rem' }}>🐾</div>
            )}
          </div>

          {/* Gallery Thumbnails */}
          {(galleryImages.length > 0 || breedThumb) && (
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
              {/* Breed thumbnail as first option */}
              {breedThumb && (
                <button
                  onClick={() => setSelectedImage(breedThumb)}
                  style={{
                    width: '80px', height: '80px', borderRadius: 'var(--radius-md)', overflow: 'hidden',
                    border: selectedImage === breedThumb || (!selectedImage && !pet.image_url) ? '3px solid var(--accent)' : '2px solid var(--border)',
                    cursor: 'pointer', flexShrink: 0, padding: 0, background: 'var(--bg-tertiary)',
                    transition: 'border-color 0.2s ease'
                  }}
                >
                  <img src={breedThumb} alt="Breed" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              )}
              {/* Admin-uploaded gallery images */}
              {galleryImages.map(img => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.image_url)}
                  style={{
                    width: '80px', height: '80px', borderRadius: 'var(--radius-md)', overflow: 'hidden',
                    border: selectedImage === img.image_url ? '3px solid var(--accent)' : '2px solid var(--border)',
                    cursor: 'pointer', flexShrink: 0, padding: 0, background: 'var(--bg-tertiary)',
                    transition: 'border-color 0.2s ease'
                  }}
                >
                  <img src={img.image_url} alt="Pet photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="pet-detail-info">
          <div className="flex-between mb-sm">
            <span className={`badge ${pet.availability ? 'badge-available' : 'badge-unavailable'}`}>
              {pet.availability ? 'Available' : 'Sold'}
            </span>
            {breed && <Link to={`/breed/${breed.id}`} className="badge" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>View Breed →</Link>}
          </div>
          <h1>{pet.name}</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>{pet.description}</p>
          <div className="price">${pet.price?.toLocaleString()}</div>

          <div className="info-grid">
            <div className="info-item"><label>Breed</label><span>{pet.breed_name || 'Mixed'}</span></div>
            <div className="info-item"><label>Age</label><span>{pet.age || 'Unknown'}</span></div>
            <div className="info-item"><label>Gender</label><span>{pet.gender || 'N/A'}</span></div>
            <div className="info-item"><label>Lifespan</label><span>{breed?.lifespan || 'N/A'}</span></div>
          </div>

          {message && <div className={`alert ${message.startsWith('✅') ? 'alert-success' : 'alert-error'}`}>{message}</div>}

          {pet.availability && (
            <button className="btn btn-primary btn-lg" onClick={handleOrder} disabled={ordering} id="buy-now-btn" style={{ width: '100%' }}>
              {ordering ? 'Processing...' : '🛒 Buy Now'}
            </button>
          )}
        </div>
      </div>

      {/* Breed Characteristics */}
      {breed && (
        <section className="section">
          <h2 className="section-title">About {breed.name}</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>{breed.description}</p>
          <div className="breed-traits">
            {[
              { label: 'Origin', value: breed.origin },
              { label: 'Size', value: breed.size },
              { label: 'Weight', value: breed.weight },
              { label: 'Temperament', value: breed.temperament },
              { label: 'Activity Level', value: breed.activity_level },
              { label: 'Breed Group', value: breed.breed_group },
            ].map((t, i) => (
              <div key={i} className="breed-trait">
                <label>{t.label}</label>
                <span>{t.value || 'N/A'}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Diet Information */}
      {diets.length > 0 && (
        <section className="section">
          <h2 className="section-title">🍖 Diet & Nutrition</h2>
          <p className="section-subtitle">Recommended feeding guide for {breed?.name || 'this breed'}</p>
          <div className="grid grid-3">
            {diets.map((diet, i) => (
              <div key={i} className="card">
                <div className="card-body">
                  <div className="card-title">{diet.age_group}</div>
                  <div style={{ marginTop: '12px' }}>
                    <div className="info-item mb-sm"><label>Food Type</label><span style={{ fontSize: '0.85rem' }}>{diet.food_type}</span></div>
                    <div className="info-item mb-sm"><label>Frequency</label><span style={{ fontSize: '0.85rem' }}>{diet.feeding_frequency}</span></div>
                    {diet.water_requirement && <div className="info-item"><label>Water</label><span style={{ fontSize: '0.85rem' }}>{diet.water_requirement}</span></div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <section className="section">
          <h2 className="section-title">Similar Breeds You Might Like</h2>
          <div className="grid grid-3">
            {recommendations.map(rec => (
              <Link to={`/breed/${rec.id}`} key={rec.id} className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="card-body">
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🐕</div>
                  <div className="card-title">{rec.name}</div>
                  <div className="card-subtitle">{rec.size} · {rec.activity_level} activity</div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>{rec.temperament}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
      
      {/* Lightbox Modal */}
      {lightboxOpen && mainImage && (
        <div className="lightbox-overlay" onClick={() => setLightboxOpen(false)}>
          <img src={mainImage} alt={pet?.name} className="lightbox-image" />
        </div>
      )}
    </div>
  )
}
