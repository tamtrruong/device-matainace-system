import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useAuth } from '../auth/AuthContext'

export default function AppShell() {
  const { user, logout, getRoleLabel } = useAuth()
  const location = useLocation()

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="content-area">
        <div className="topbar glass-card">
          <div>
            <div className="muted tiny-label">phiên làm việc</div>
            <strong>{location.pathname === '/dashboard' ? 'trang tổng quan' : location.pathname.replace('/', '').replace('-', ' ')}</strong>
          </div>
          <div className="topbar-actions">
            <div className="user-chip">
              <div className="avatar-circle">{(user?.fullName || user?.username || 'U').charAt(0).toUpperCase()}</div>
              <div>
                <div>{user?.fullName || user?.username}</div>
                <div className="muted tiny-label">{getRoleLabel(user?.role)}</div>
              </div>
            </div>
            <button className="ghost-btn" onClick={logout}>Đăng xuất</button>
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  )
}
