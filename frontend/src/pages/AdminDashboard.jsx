import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const MENU_ITEMS = ['Dashboard', 'Pets', 'Breeds', 'Diet Data', 'Orders', 'Customers', 'AI Assistant', 'Settings']

export default function AdminDashboard() {
  const { user, loading: authLoading, authFetch } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('Dashboard')
  const [pets, setPets] = useState([])
  const [breeds, setBreeds] = useState([])
  const [diets, setDiets] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})
  const [galleryImages, setGalleryImages] = useState([])
  const [newFiles, setNewFiles] = useState([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) { navigate('/login'); return }
    if (user) loadData()
  }, [user, authLoading])

  const loadData = async () => {
    setLoading(true)
    try {
      const [p, b, d, o] = await Promise.all([
        fetch('/api/pets?limit=50').then(r => r.json()),
        fetch('/api/breeds').then(r => r.json()),
        fetch('/api/diets').then(r => r.json()),
        authFetch('/api/orders/').then(r => r.json()),
      ])
      setPets(p); setBreeds(b); setDiets(d); setOrders(o)
    } catch {}
    setLoading(false)
  }

  const openModal = async (type, data = null) => {
    setForm(data || {})
    setNewFiles([])
    setModal({ type, data })
    // Load gallery images for existing pets
    if (type === 'pet' && data?.id) {
      try {
        const res = await fetch(`/api/pets/${data.id}/images`)
        if (res.ok) setGalleryImages(await res.json())
        else setGalleryImages([])
      } catch { setGalleryImages([]) }
    } else {
      setGalleryImages([])
    }
  }

  const closeModal = () => { setModal(null); setForm({}); setGalleryImages([]); setNewFiles([]) }
  const updateForm = (key, value) => setForm(p => ({ ...p, [key]: value }))

  // Photo management
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files).filter(f => {
      const ext = f.name.split('.').pop().toLowerCase()
      return ['jpg', 'jpeg', 'png', 'webp'].includes(ext) && f.size <= 5 * 1024 * 1024
    })
    setNewFiles(prev => [...prev, ...files])
    e.target.value = ''
  }

  const removeNewFile = (index) => setNewFiles(prev => prev.filter((_, i) => i !== index))

  const uploadPhotos = async (petId) => {
    if (newFiles.length === 0) return
    setUploading(true)
    const fd = new FormData()
    newFiles.forEach(f => fd.append('files', f))
    try {
      const res = await authFetch(`/api/pets/${petId}/images`, { method: 'POST', body: fd })
      if (res.ok) {
        const uploaded = await res.json()
        setGalleryImages(prev => [...prev, ...uploaded])
        setNewFiles([])
      }
    } catch {}
    setUploading(false)
  }

  const deletePhoto = async (petId, imageId) => {
    try {
      const res = await authFetch(`/api/pets/${petId}/images/${imageId}`, { method: 'DELETE' })
      if (res.ok) setGalleryImages(prev => prev.filter(img => img.id !== imageId))
    } catch {}
  }

  // CRUD actions
  const savePet = async () => {
    const method = modal.data?.id ? 'PUT' : 'POST'
    const url = modal.data?.id ? `/api/pets/${modal.data.id}` : '/api/pets'
    const body = {
      name: form.name || '', breed_id: form.breed_id ? parseInt(form.breed_id) : null,
      age: form.age || '', price: parseFloat(form.price) || 0, gender: form.gender || '',
      availability: form.availability !== false, image_url: form.image_url || '',
      description: form.description || '',
    }
    await authFetch(url, { method, body: JSON.stringify(body) })
    closeModal(); loadData()
  }

  const deletePet = async (id) => {
    if (!confirm('Delete this pet?')) return
    await authFetch(`/api/pets/${id}`, { method: 'DELETE' })
    loadData()
  }

  const saveBreed = async () => {
    const method = modal.data?.id ? 'PUT' : 'POST'
    const url = modal.data?.id ? `/api/breeds/${modal.data.id}` : '/api/breeds'
    await authFetch(url, { method, body: JSON.stringify(form) })
    closeModal(); loadData()
  }

  const saveDiet = async () => {
    const method = modal.data?.id ? 'PUT' : 'POST'
    const url = modal.data?.id ? `/api/diets/${modal.data.id}` : '/api/diets'
    const body = { ...form, breed_id: parseInt(form.breed_id) }
    await authFetch(url, { method, body: JSON.stringify(body) })
    closeModal(); loadData()
  }

  const updateOrderStatus = async (orderId, status) => {
    await authFetch(`/api/orders/${orderId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
    loadData()
  }

  if (authLoading) return <div className="page container"><div className="spinner" /></div>
  if (!user || user.role !== 'admin') return null

  return (
    <div className="page container" style={{ maxWidth: '1440px' }}>
      <div className="admin-layout fade-in">
        {/* Sidebar */}
        <div className="admin-sidebar card" style={{ padding: '24px 12px', height: 'calc(100vh - 120px)', position: 'sticky', top: '90px' }}>
          <div style={{ padding: '0 12px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Admin Panel</h3>
          </div>
          {MENU_ITEMS.map(item => (
            <a 
              key={item} 
              className={activeTab === item ? 'active' : ''} 
              onClick={() => setActiveTab(item)} 
              style={{ cursor: 'pointer', display: 'block', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: '4px', fontWeight: activeTab === item ? 700 : 500 }}
            >
              {item === 'Dashboard' ? '📊 ' : item === 'Pets' ? '🐾 ' : item === 'Orders' ? '📦 ' : '⚙️ '}
              {item}
            </a>
          ))}
        </div>

        {/* Content */}
        <div className="admin-content">
          <div className="admin-header">
            <h2>{activeTab}</h2>
            {activeTab === 'Pets' && <button className="btn btn-primary" onClick={() => openModal('pet')}>+ Add Pet</button>}
            {activeTab === 'Breeds' && <button className="btn btn-primary" onClick={() => openModal('breed')}>+ Add Breed</button>}
            {activeTab === 'Diet Data' && <button className="btn btn-primary" onClick={() => openModal('diet')}>+ Add Diet</button>}
          </div>

          {loading ? <div className="spinner" /> : (
            <>
              {activeTab === 'Dashboard' && (
                <>
                  <div className="stats-grid mb-lg">
                    <div className="stat-card" style={{ borderLeft: '4px solid var(--accent)' }}><div className="label">Total Pets</div><div className="value">{pets.length}</div></div>
                    <div className="stat-card" style={{ borderLeft: '4px solid var(--blue)' }}><div className="label">Total Orders</div><div className="value">{orders.length}</div></div>
                    <div className="stat-card" style={{ borderLeft: '4px solid var(--coral)' }}><div className="label">Popular Breeds</div><div className="value">{breeds.length}</div></div>
                    <div className="stat-card" style={{ borderLeft: '4px solid var(--yellow)' }}><div className="label">Available Inventory</div><div className="value">{pets.filter(p => p.availability).length}</div></div>
                  </div>
                  
                  {/* Dashboard Layout Placeholders */}
                  <div className="grid grid-2">
                    <div className="card" style={{ padding: '24px' }}>
                      <h3 style={{ marginBottom: '16px', fontSize: '1.2rem' }}>Recent Orders overview</h3>
                      <div style={{ height: '200px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                        Chart Placeholder
                      </div>
                    </div>
                    <div className="card" style={{ padding: '24px' }}>
                      <h3 style={{ marginBottom: '16px', fontSize: '1.2rem' }}>Inventory Status</h3>
                      <div style={{ height: '200px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                         Pie Chart Placeholder
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'Pets' && (
                <div className="table-wrapper card">
                  <table>
                    <thead><tr><th>Name</th><th>Breed</th><th>Age</th><th>Price</th><th>Gender</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                      {pets.map(pet => (
                        <tr key={pet.id}>
                          <td style={{ fontWeight: '600' }}>{pet.name}</td>
                          <td>{pet.breed_name || 'N/A'}</td>
                          <td>{pet.age}</td>
                          <td style={{ color: 'var(--accent)', fontWeight: '700' }}>${pet.price.toLocaleString()}</td>
                          <td>{pet.gender}</td>
                          <td><span className={`badge ${pet.availability ? 'badge-available' : 'badge-unavailable'}`}>{pet.availability ? 'Available' : 'Sold'}</span></td>
                          <td>
                            <div className="flex gap-sm">
                              <button className="btn btn-secondary btn-sm" onClick={() => openModal('pet', pet)}>Edit</button>
                              <button className="btn btn-danger btn-sm" onClick={() => deletePet(pet.id)}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'Breeds' && (
                <div className="table-wrapper card">
                  <table>
                    <thead><tr><th>Name</th><th>Origin</th><th>Size</th><th>Group</th><th>Actions</th></tr></thead>
                    <tbody>
                      {breeds.map(breed => (
                        <tr key={breed.id}>
                          <td style={{ fontWeight: '600' }}>{breed.name}</td>
                          <td>{breed.origin}</td>
                          <td>{breed.size}</td>
                          <td>{breed.breed_group}</td>
                          <td><button className="btn btn-secondary btn-sm" onClick={() => openModal('breed', breed)}>Edit</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'Diet Data' && (
                <div className="table-wrapper card">
                  <table>
                    <thead><tr><th>Breed</th><th>Age Group</th><th>Food Type</th><th>Frequency</th><th>Actions</th></tr></thead>
                    <tbody>
                      {diets.map(diet => (
                        <tr key={diet.id}>
                          <td>{breeds.find(b => b.id === diet.breed_id)?.name || 'N/A'}</td>
                          <td>{diet.age_group}</td>
                          <td>{diet.food_type}</td>
                          <td>{diet.feeding_frequency}</td>
                          <td><button className="btn btn-secondary btn-sm" onClick={() => openModal('diet', diet)}>Edit</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'Orders' && (
                 <div className="table-wrapper card">
                 <table>
                   <thead><tr><th>#</th><th>Customer</th><th>Pet</th><th>Price</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
                   <tbody>
                     {orders.map(order => (
                       <tr key={order.id}>
                         <td>#{order.id}</td>
                         <td>{order.user_name || `User #${order.user_id}`}</td>
                         <td>{order.pet_name || `Pet #${order.pet_id}`}</td>
                         <td style={{ color: 'var(--accent)', fontWeight: '700' }}>${order.total_price.toLocaleString()}</td>
                         <td><span className={`badge badge-${order.status === 'confirmed' ? 'confirmed' : order.status === 'pending' ? 'pending' : 'unavailable'}`}>{order.status}</span></td>
                         <td style={{ fontSize: '0.85rem' }}>{new Date(order.order_date).toLocaleDateString()}</td>
                         <td>
                           {order.status === 'pending' && (
                             <div className="flex gap-sm">
                               <button className="btn btn-primary btn-sm" onClick={() => updateOrderStatus(order.id, 'confirmed')}>✓</button>
                               <button className="btn btn-danger btn-sm" onClick={() => updateOrderStatus(order.id, 'rejected')}>✕</button>
                             </div>
                           )}
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
              )}

              {/* Placeholders for others */}
              {['Customers', 'AI Assistant', 'Settings'].includes(activeTab) && (
                <div className="card text-center" style={{ padding: '60px', color: 'var(--text-muted)' }}>
                  This module is under development.
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Modal (Truncated for brevity, kept structure identical to requested) ── */}
      {modal && (
        <div className="modal-overlay" onClick={closeModal} style={{ zIndex: 3000 }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modal.data?.id ? 'Edit' : 'Add'} {modal.type.charAt(0).toUpperCase() + modal.type.slice(1)}</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              {modal.type === 'pet' && (
                <>
                  <div className="input-group"><label>Name</label><input className="input" value={form.name || ''} onChange={e => updateForm('name', e.target.value)} /></div>
                  <div className="input-group"><label>Breed</label>
                    <select className="input" value={form.breed_id || ''} onChange={e => updateForm('breed_id', e.target.value)}>
                      <option value="">Select breed</option>
                      {breeds.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="input-group"><label>Age</label><input className="input" value={form.age || ''} onChange={e => updateForm('age', e.target.value)} /></div>
                    <div className="input-group"><label>Price ($)</label><input className="input" type="number" value={form.price || ''} onChange={e => updateForm('price', e.target.value)} /></div>
                  </div>
                  <div className="input-group"><label>Gender</label>
                    <select className="input" value={form.gender || ''} onChange={e => updateForm('gender', e.target.value)}>
                      <option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option>
                    </select>
                  </div>
                  <div className="input-group"><label>Image URL</label><input className="input" value={form.image_url || ''} onChange={e => updateForm('image_url', e.target.value)} /></div>
                  <div className="input-group"><label>Description</label><textarea className="input" rows={3} value={form.description || ''} onChange={e => updateForm('description', e.target.value)} style={{ resize: 'vertical' }} /></div>

                  {/* Photo Management Section */}
                  {modal.data?.id && (
                    <div style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                      <label style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '12px', display: 'block' }}>📸 Pet Photos</label>

                      {/* Existing gallery */}
                      {galleryImages.length > 0 && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '8px', marginBottom: '16px' }}>
                          {galleryImages.map(img => (
                            <div key={img.id} style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', aspectRatio: '1', border: '2px solid var(--border)' }}>
                              <img src={img.image_url} alt="Pet" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              <button
                                onClick={() => deletePhoto(modal.data.id, img.id)}
                                style={{ position: 'absolute', top: '4px', right: '4px', width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(220,38,38,0.9)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
                              >✕</button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Upload area */}
                      <div
                        style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)', padding: '20px', textAlign: 'center', cursor: 'pointer', background: 'var(--bg-tertiary)', transition: 'border-color 0.2s' }}
                        onClick={() => document.getElementById('photo-upload-input')?.click()}
                      >
                        <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>📁</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Click to select photos (JPG, PNG, WEBP · max 5MB)</div>
                        <input id="photo-upload-input" type="file" multiple accept=".jpg,.jpeg,.png,.webp" onChange={handleFileSelect} style={{ display: 'none' }} />
                      </div>

                      {/* Selected file previews */}
                      {newFiles.length > 0 && (
                        <div style={{ marginTop: '12px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '8px', marginBottom: '12px' }}>
                            {newFiles.map((file, idx) => (
                              <div key={idx} style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', aspectRatio: '1', border: '2px solid var(--accent)' }}>
                                <img src={URL.createObjectURL(file)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <button
                                  onClick={() => removeNewFile(idx)}
                                  style={{ position: 'absolute', top: '4px', right: '4px', width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(100,100,100,0.8)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
                                >✕</button>
                              </div>
                            ))}
                          </div>
                          <button className="btn btn-primary btn-sm" onClick={() => uploadPhotos(modal.data.id)} disabled={uploading} style={{ width: '100%' }}>
                            {uploading ? 'Uploading...' : `Upload ${newFiles.length} Photo${newFiles.length > 1 ? 's' : ''}`}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
              {modal.type === 'breed' && (
                <>
                  <div className="input-group"><label>Name</label><input className="input" value={form.name || ''} onChange={e => updateForm('name', e.target.value)} /></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="input-group"><label>Origin</label><input className="input" value={form.origin || ''} onChange={e => updateForm('origin', e.target.value)} /></div>
                    <div className="input-group"><label>Size</label>
                      <select className="input" value={form.size || ''} onChange={e => updateForm('size', e.target.value)}>
                        <option value="">Select</option><option>Small</option><option>Medium</option><option>Large</option>
                      </select>
                    </div>
                  </div>
                </>
              )}
              {modal.type === 'diet' && (
                <>
                  <div className="input-group"><label>Breed</label>
                    <select className="input" value={form.breed_id || ''} onChange={e => updateForm('breed_id', e.target.value)}>
                      <option value="">Select breed</option>
                      {breeds.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div className="input-group"><label>Age Group</label>
                    <select className="input" value={form.age_group || ''} onChange={e => updateForm('age_group', e.target.value)}>
                      <option value="">Select</option><option>Puppy</option><option>Adult</option><option>Senior</option>
                    </select>
                  </div>
                  <div className="input-group"><label>Food Type</label><input className="input" value={form.food_type || ''} onChange={e => updateForm('food_type', e.target.value)} /></div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" onClick={modal.type === 'pet' ? savePet : modal.type === 'breed' ? saveBreed : saveDiet}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
