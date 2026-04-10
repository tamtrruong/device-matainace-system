import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function ProtectedRoute({ roles }) {
  const { isAuthenticated, loading, user } = useAuth()
  const location = useLocation()

  if (loading) return <div className="center-screen">Đang tải phiên đăng nhập...</div>
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />
  if (roles?.length && !roles.includes(user?.role)) return <Navigate to="/dashboard" replace />
  return <Outlet />
}
