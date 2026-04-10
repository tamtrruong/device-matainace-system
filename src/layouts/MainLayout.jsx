import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

export default function MainLayout() {
  const location = useLocation()

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="content-area">
        <div className="top-strip">
          <span>Path: {location.pathname}</span>
          <span>Vite + React + Axios</span>
        </div>
        <Outlet />
      </main>
    </div>
  )
}
