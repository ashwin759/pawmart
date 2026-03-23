import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', remember: false })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const formRef = useRef(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      navigate(user.role === 'admin' ? '/admin' : '/')
    } catch (err) {
      setError(err.message)
      // Trigger shake animation
      if (formRef.current) {
        formRef.current.classList.remove('shake')
        void formRef.current.offsetWidth // force reflow
        formRef.current.classList.add('shake')
      }
    }
    setLoading(false)
  }

  return (
    <div className="auth-page fade-in" style={{ backgroundColor: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div className="auth-card" ref={formRef} style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', boxShadow: 'var(--shadow-xl)', maxWidth: '480px' }}>
        {/* Pet Themed Illustration */}
        <div style={{ backgroundColor: 'var(--accent-light)', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
           <img 
             src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
             alt="Happy Dogs" 
             style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} 
           />
           <div style={{ position: 'absolute', background: 'linear-gradient(to top, var(--bg-card), transparent)', bottom: 0, left: 0, right: 0, height: '40px' }} />
        </div>
        
        <div style={{ padding: '40px' }}>
          <div style={{ textAlign: 'center', fontSize: '3rem', marginTop: '-60px', position: 'relative', zIndex: 10 }}>🐾</div>
          <h1 style={{ fontWeight: 800, fontSize: '1.8rem', textAlign: 'center', marginBottom: '8px', color: 'var(--text-primary)' }}>Welcome Back</h1>
          <p className="subtitle" style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '32px' }}>Log in to your PawMart account</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="login-email">Email</label>
              <input
                className="input"
                type="email"
                id="login-email"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="your@email.com"
                required
                disabled={loading}
              />
            </div>
            
            <div className="input-group mb-sm">
              <label htmlFor="login-password">Password</label>
              <input
                className="input"
                type="password"
                id="login-password"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <input 
                  type="checkbox" 
                  checked={form.remember}
                  onChange={e => setForm(p => ({ ...p, remember: e.target.checked }))}
                  style={{ accentColor: 'var(--accent)', cursor: 'pointer' }}
                />
                Remember Me
              </label>
              <a href="#" style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 500 }}>Forgot Password?</a>
            </div>

            <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }} id="login-submit">
              {loading ? (
                <><span className="btn-spinner" /> Logging in...</>
              ) : (
                'Log In'
              )}
            </button>
          </form>

          <p className="text-center mt-lg" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Don't have an account? <Link to="/register" style={{ fontWeight: 600 }}>Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
