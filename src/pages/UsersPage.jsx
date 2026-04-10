import { useEffect, useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import { usersApi } from '../api/modules'
import { formatDateTime, toneByRole } from '../utils/formatters'
import { useAuth } from '../auth/AuthContext'

const initialForm = { username: '', password: '', email: '', fullName: '', phone: '', role: 'ROLE_USER' }

export default function UsersPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [keyword, setKeyword] = useState('')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const loadUsers = async () => {
    setLoading(true)
    try {
      const data = await usersApi.getAll()
      setUsers(Array.isArray(data) ? data : [])
      setError('')
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không tải được danh sách người dùng.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadUsers() }, [])

  const filtered = useMemo(() => users.filter((item) => {
    const q = keyword.toLowerCase()
    return !q || item.username?.toLowerCase().includes(q) || item.fullName?.toLowerCase().includes(q) || item.email?.toLowerCase().includes(q)
  }), [users, keyword])

  const handleCreate = async (event) => {
    event.preventDefault()
    await usersApi.create(form)
    setOpen(false)
    setForm(initialForm)
    loadUsers()
  }

  const handleToggle = async (id) => { await usersApi.toggleStatus(id); loadUsers() }
  const handleDelete = async (id) => {
    if (!window.confirm('Xóa người dùng này?')) return
    await usersApi.remove(id)
    loadUsers()
  }

  const columns = [
    { key: 'username', label: 'Username' },
    { key: 'fullName', label: 'Họ tên', render: (row) => row.fullName || 'N/A' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Vai trò', render: (row) => <Badge tone={toneByRole(row.role)}>{row.role}</Badge> },
    { key: 'enabled', label: 'Trạng thái', render: (row) => <Badge tone={row.enabled ? 'success' : 'danger'}>{row.enabled ? 'Hoạt động' : 'Đã khóa'}</Badge> },
    { key: 'createdAt', label: 'Tạo lúc', render: (row) => formatDateTime(row.createdAt) },
    {
      key: 'actions', label: 'Thao tác', render: (row) => (
        <div className="table-actions">
          {user?.role === 'ROLE_ADMIN' ? <button className="ghost-btn" onClick={() => handleToggle(row.id)}>{row.enabled ? 'Khóa' : 'Mở'}</button> : null}
          {user?.role === 'ROLE_ADMIN' ? <button className="danger-btn" onClick={() => handleDelete(row.id)}>Xóa</button> : null}
        </div>
      )
    },
  ]

  return (
    <div className="page-grid">
      <PageHeader
        title="Người dùng & phân quyền"
        subtitle="Quản lý tài khoản nội bộ, phân quyền truy cập và trạng thái hoạt động của nhân sự trong hệ thống."
        actions={user?.role === 'ROLE_ADMIN' ? <button className="primary-btn" onClick={() => setOpen(true)}>Thêm tài khoản</button> : null}
      />

      <div className="filters glass-card">
        <input placeholder="Tìm theo username, họ tên, email..." value={keyword} onChange={(e) => setKeyword(e.target.value)} />
      </div>

      {error ? <div className="error-box">{error}</div> : null}
      <DataTable columns={columns} rows={filtered} emptyMessage={loading ? 'Đang tải dữ liệu...' : 'Chưa có người dùng phù hợp.'} />

      <Modal open={open} title="Tạo tài khoản mới" onClose={() => setOpen(false)}>
        <form className="form-grid" onSubmit={handleCreate}>
          <input placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
          <input placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input placeholder="Họ tên" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          <input placeholder="Số điện thoại" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="ROLE_USER">ROLE_USER</option>
            <option value="ROLE_TECHNICIAN">ROLE_TECHNICIAN</option>
            <option value="ROLE_MANAGER">ROLE_MANAGER</option>
            <option value="ROLE_ADMIN">ROLE_ADMIN</option>
          </select>
          <div className="form-actions">
            <button className="primary-btn" type="submit">Lưu</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
