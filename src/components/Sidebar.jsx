import { LayoutDashboard, Users, Cpu, Wrench, ShieldAlert, LogIn, CircleUserRound, MessagesSquare } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function Sidebar() {
  const { user, getRoleLabel } = useAuth()

  const roleCopy = {
    ROLE_ADMIN: 'Trung tâm điều hành thiết bị, nhân sự và toàn bộ yêu cầu bảo trì trong hệ thống.',
    ROLE_MANAGER: 'Không gian giám sát tiến độ, phân công công việc và bám sát lịch bảo trì.',
    ROLE_TECHNICIAN: 'Bảng công việc dành cho kỹ thuật viên với lịch bảo trì và sự cố đang phụ trách.',
    ROLE_USER: 'Cổng theo dõi thiết bị, gửi yêu cầu hỗ trợ và trao đổi nội bộ khi cần thiết.',
  }
  const links = [
    { to: '/dashboard', label: 'Tổng quan', icon: LayoutDashboard, roles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_TECHNICIAN', 'ROLE_USER'] },
    { to: '/users', label: 'Người dùng', icon: Users, roles: ['ROLE_ADMIN', 'ROLE_MANAGER'] },
    { to: '/devices', label: 'Thiết bị', icon: Cpu, roles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_TECHNICIAN', 'ROLE_USER'] },
    { to: '/schedules', label: 'Lịch bảo trì', icon: Wrench, roles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_TECHNICIAN', 'ROLE_USER'] },
    { to: '/incidents', label: 'Sự cố', icon: ShieldAlert, roles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_TECHNICIAN', 'ROLE_USER'] },
    { to: '/forum', label: 'Diễn đàn', icon: MessagesSquare, roles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_TECHNICIAN', 'ROLE_USER'] },
    { to: '/profile', label: 'Tài khoản', icon: CircleUserRound, roles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_TECHNICIAN', 'ROLE_USER'] },
  ].filter((item) => item.roles.includes(user?.role))

  return (
    <aside className="sidebar glass-card">
      <div>
        <p className="eyebrow">device maintenance system</p>
        <h1 className="brand-title">Maintenance Hub</h1>
        <p className="muted">{roleCopy[user?.role] || 'Không gian quản lý và theo dõi công việc bảo trì thiết bị.'}</p>
      </div>

      <div className="profile-panel">
        <div className="avatar-circle lg">{(user?.fullName || user?.username || 'U').charAt(0).toUpperCase()}</div>
        <div>
          <strong>{user?.fullName || user?.username}</strong>
          <div className="muted">{getRoleLabel(user?.role)}</div>
        </div>
      </div>

      <nav className="nav-list">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <LogIn size={16} />
        <span>{user?.username}</span>
      </div>
    </aside>
  )
}
