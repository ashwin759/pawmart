import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import PetListingCard from '../components/PetListingCard'

export default function BreedDetail() {
  const { id } = useParams()
  const [breed, setBreed] = useState(null)
  const [diets, setDiets] = useState([])
  const [pets, setPets] = useState([])
  const [allBreeds, setAllBreeds] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch(`/api/breeds/${id}`).then(r => r.ok ? r.json() : null),
      fetch(`/api/diets?breed_id=${id}`).then(r => r.json()),
      fetch(`/api/pets?breed_id=${id}`).then(r => r.json()),
      fetch('/api/breeds').then(r => r.json())
    ]).then(([breedData, dietData, petData, allBreedsData]) => {
      setBreed(breedData)
      setDiets(dietData)
      setPets(petData)
      // Recommend breeds of same group or random
      const similar = allBreedsData.filter(b => b.id !== parseInt(id))
      setAllBreeds(similar)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [id])

  if (loading) return <div className="page container"><div className="spinner" /></div>
  if (!breed) return <div className="page container text-center"><h2>Breed not found</h2></div>

  return (
    <div className="page container fade-in">
      <div className="mb-md">
        <Link to="/marketplace" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'inline-block', marginBottom: '16px' }}>← Back to Marketplace</Link>
      </div>
      
      {/* Top Section: Gallery & Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '60px' }}>
        {/* Gallery */}
        <div className="card" style={{ overflow: 'hidden', padding: 0, border: 'none', boxShadow: 'var(--shadow-lg)' }}>
           <img 
             src={breed.image_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} 
             alt={breed.name} 
             style={{ width: '100%', height: '400px', objectFit: 'cover' }} 
           />
        </div>

        {/* Info */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h1 className="section-title" style={{ fontSize: '2.5rem', marginBottom: '16px' }}>{breed.name}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '32px', lineHeight: '1.6' }}>{breed.description}</p>
          
          <div className="grid grid-2" style={{ gap: '16px' }}>
            {[
              { icon: '🌍', label: 'Origin', value: breed.origin },
              { icon: '📏', label: 'Size', value: breed.size },
              { icon: '⏳', label: 'Life Span', value: breed.lifespan },
              { icon: '🧠', label: 'Temperament', value: breed.temperament },
              { icon: '⚡', label: 'Energy Level', value: breed.activity_level },
            ].map((stat, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-tertiary)', padding: '12px 16px', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '1.5rem' }}>{stat.icon}</span>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{stat.label}</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{stat.value || 'Unknown'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Diet Information Highlight Cards */}
      {diets.length > 0 ? (
        <section className="section mb-lg">
          <h2 className="section-title">Diet Information</h2>
          <p className="section-subtitle">Recommended nutrition and feeding schedule</p>
          <div className="grid grid-2">
            {diets.map((d, i) => (
              <div key={i} className="card" style={{ borderLeft: '4px solid var(--accent)', display: 'flex', flexDirection: 'column' }}>
                <div className="card-body">
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🥩 {d.age_group} Diet
                  </h3>
                  <div className="grid grid-2" style={{ gap: '16px' }}>
                    <div className="info-item" style={{ background: 'var(--bg-primary)' }}>
                      <label>Food Type</label>
                      <span>{d.food_type}</span>
                    </div>
                    <div className="info-item" style={{ background: 'var(--bg-primary)' }}>
                      <label>Frequency</label>
                      <span>{d.feeding_frequency}</span>
                    </div>
                    {d.water_requirement && 
                      <div className="info-item" style={{ gridColumn: 'span 2', background: 'var(--bg-primary)' }}>
                        <label>💧 Water Intake</label>
                        <span>{d.water_requirement}</span>
                      </div>
                    }
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="section mb-lg">
            <h2 className="section-title">Diet Information</h2>
            <div className="card text-center" style={{ padding: '40px', color: 'var(--text-muted)' }}>
                No diet information currently available for this breed.
            </div>
        </section>
      )}

      {/* Available Pets */}
      {pets.length > 0 && (
        <section className="section mb-lg">
          <h2 className="section-title">Available {breed.name}s</h2>
          <div className="grid grid-4">
            {pets.map(pet => (
              <div key={pet.id}><PetListingCard pet={pet} /></div>
            ))}
          </div>
        </section>
      )}

      {/* Recommended Breeds Carousel */}
      {allBreeds.length > 0 && (
        <section className="section mb-lg">
          <h2 className="section-title">Similar Breeds You May Like</h2>
          <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', padding: '10px 0', scrollSnapType: 'x mandatory' }}>
            {allBreeds.slice(0, 5).map(b => (
              <Link to={`/breed/${b.id}`} key={b.id} className="card" style={{ minWidth: '300px', flexShrink: 0, textDecoration: 'none', color: 'inherit', scrollSnapAlign: 'start', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '180px', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
                  🐕
                </div>
                <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div className="card-title">{b.name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    <strong>Size:</strong> {b.size || 'Unknown'}<br/>
                    <strong>Temperament:</strong> {b.temperament || 'Friendly'}
                  </div>
                  <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
                    <button className="btn btn-outline btn-sm" style={{ width: '100%' }}>View Details</button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
