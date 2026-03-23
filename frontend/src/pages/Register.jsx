import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      navigate('/')
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  return (
    <div className="auth-page fade-in" style={{ backgroundColor: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div className="auth-card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', boxShadow: 'var(--shadow-xl)', maxWidth: '480px' }}>
        
        {/* Pet Themed Illustration */}
        <div style={{ backgroundColor: 'var(--accent-light)', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
           <img 
             src="https://images.unsplash.com/photo-1510771463146-e89e6e86560e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
             alt="Happy Dog" 
             style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} 
           />
           <div style={{ position: 'absolute', background: 'linear-gradient(to top, var(--bg-card), transparent)', bottom: 0, left: 0, right: 0, height: '40px' }} />
        </div>
        
        <div style={{ padding: '40px' }}>
          <div style={{ textAlign: 'center', fontSize: '3rem', marginTop: '-60px', position: 'relative', zIndex: 10 }}>🐾</div>
          <h1 style={{ fontWeight: 800, fontSize: '1.8rem', textAlign: 'center', marginBottom: '8px', color: 'var(--text-primary)' }}>Join PawMart</h1>
          <p className="subtitle" style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '32px' }}>Create your account to find your new best friend</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="reg-name">Full Name</label>
              <input
                className="input"
                id="reg-name"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="John Doe"
                required
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="reg-email">Email</label>
              <input
                className="input"
                type="email"
                id="reg-email"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="your@email.com"
                required
              />
            </div>
            
            <div className="input-group mb-sm">
              <label htmlFor="reg-password">Password</label>
              <input
                className="input"
                type="password"
                id="reg-password"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="••••••••"
                required
              />
            </div>

            <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: '24px' }} id="register-submit">
              {loading ? 'Signing up...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center mt-lg" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Already have an account? <Link to="/login" style={{ fontWeight: 600 }}>Log in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
