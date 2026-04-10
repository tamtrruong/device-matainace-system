import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, getErrorMessage } = useAuth()
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(form)
      const nextPath = location.state?.from?.pathname || '/dashboard'
      navigate(nextPath, { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-shell">
      <div className="login-card glass-card">
        <div className="login-hero">
          <span className="login-kicker">device maintenance system</span>
          <h1>Đăng nhập hệ thống</h1>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Username</span>
            <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          </label>
          <label className="form-field">
            <span>Password</span>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </label>
          {error ? <div className="error-box">{error}</div> : null}
          <button className="primary-btn" disabled={loading}>{loading ? 'Đang đăng nhập...' : 'Đăng nhập'}</button>
        </form>

      </div>
    </div>
  )
}
