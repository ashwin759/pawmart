import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { user, loading: authLoading, authFetch } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) { navigate('/login'); return }
    if (user) {
      authFetch('/api/orders/')
        .then(r => r.json())
        .then(setOrders)
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [user, authLoading])

  if (authLoading) return <div className="page container"><div className="spinner" /></div>
  if (!user) return null

  return (
    <div className="page container">
      <div className="slide-up">
        <h1 className="section-title">My Profile</h1>
        <p className="section-subtitle">Manage your account and view order history</p>
      </div>

      {/* User Info */}
      <div className="card mb-lg" style={{ maxWidth: '600px' }}>
        <div className="card-body">
          <div className="flex gap-md" style={{ alignItems: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-full)', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>
              👤
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '700' }}>{user.name}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{user.email}</p>
              {user.phone && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>📞 {user.phone}</p>}
              {user.address && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>📍 {user.address}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Orders */}
      <h2 className="section-title" style={{ fontSize: '1.5rem' }}>Order History</h2>
      {loading ? (
        <div className="spinner" />
      ) : orders.length > 0 ? (
        <div className="table-wrapper mt-md">
          <table>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Pet</th>
                <th>Price</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.pet_name || `Pet #${order.pet_id}`}</td>
                  <td style={{ fontWeight: '700', color: 'var(--accent)' }}>${order.total_price.toLocaleString()}</td>
                  <td>
                    <span className={`badge badge-${order.status === 'confirmed' || order.status === 'completed' ? 'confirmed' : order.status === 'pending' ? 'pending' : 'unavailable'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {new Date(order.order_date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center mt-lg" style={{ color: 'var(--text-muted)', padding: '40px 0' }}>
          No orders yet. <a href="/marketplace">Browse pets</a> to place your first order!
        </p>
      )}
    </div>
  )
}
