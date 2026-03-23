import { Link } from 'react-router-dom'
import { getPetImage } from '../utils/breedImages'

export default function PetListingCard({ pet }) {
  const imgSrc = getPetImage(pet)

  return (
    <Link to={`/pet/${pet.id}`} className="card pet-card" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="card-image" style={{ overflow: 'hidden', position: 'relative', height: '240px' }}>
        {imgSrc ? (
          <img 
            src={imgSrc} 
            alt={pet.name} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            className="pet-img img-loading" 
            loading="lazy"
            onLoad={e => e.target.classList.replace('img-loading', 'img-loaded')}
          />
        ) : (
          <div className="pet-placeholder">🐾</div>
        )}
        <span 
          className={`badge ${pet.availability ? 'badge-available' : 'badge-unavailable'}`} 
          style={{ 
            position: 'absolute', 
            top: '14px', 
            right: '14px', 
            zIndex: 1, 
            backdropFilter: 'blur(8px)',
            background: pet.availability ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: '1px solid ' + (pet.availability ? 'rgba(34, 197, 94, 0.25)' : 'rgba(239, 68, 68, 0.25)'),
          }}
        >
          {pet.availability ? '● Available' : '● Sold'}
        </span>
      </div>
      <div className="card-body" style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '22px' }}>
        <div className="card-title" style={{ fontSize: '1.15rem', marginBottom: '6px' }}>{pet.name}</div>
        <div className="card-subtitle" style={{ fontSize: '0.82rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>{pet.breed_name || 'Mixed Breed'}</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>{pet.age || 'Unknown Age'}</span>
        </div>
        <div className="flex-between" style={{ marginTop: 'auto', marginBottom: '16px' }}>
          <span className="card-price" style={{ fontSize: '1.4rem' }}>${pet.price?.toLocaleString() || '0'}</span>
          {pet.gender && (
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', background: 'var(--bg-tertiary)', padding: '3px 10px', borderRadius: 'var(--radius-full)' }}>
              {pet.gender === 'Male' ? '♂' : '♀'} {pet.gender}
            </span>
          )}
        </div>
        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
          View Details →
        </button>
      </div>
    </Link>
  )
}
