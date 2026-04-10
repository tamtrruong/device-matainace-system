import { useEffect, useState } from 'react'
import PageHeader from '../components/PageHeader'
import { usersApi } from '../api/modules'
import { useAuth } from '../auth/AuthContext'

const passwordFormDefault = { currentPassword: '', newPassword: '', confirmPassword: '' }

export default function ProfilePage() {
  const { user, syncProfile } = useAuth()
  const [profileForm, setProfileForm] = useState({ fullName: '', email: '', phone: '' })
  const [passwordForm, setPasswordForm] = useState(passwordFormDefault)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    setProfileForm({
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
    })
  }, [user])

  const saveProfile = async (event) => {
    event.preventDefault()
    try {
      await usersApi.updateMe(profileForm)
      await syncProfile()
      setMessage('Thông tin cá nhân đã được cập nhật.')
      setError('')
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không thể cập nhật thông tin.')
      setMessage('')
    }
  }

  const handleAvatar = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      setUploading(true)
      await usersApi.uploadAvatar(file)
      await syncProfile()
      setMessage('Ảnh đại diện đã được cập nhật.')
      setError('')
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không thể tải ảnh đại diện.')
      setMessage('')
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  const changePassword = async (event) => {
    event.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Mật khẩu xác nhận chưa khớp.')
      setMessage('')
      return
    }
    try {
      await usersApi.changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword })
      setPasswordForm(passwordFormDefault)
      setMessage('Mật khẩu đã được thay đổi.')
      setError('')
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không thể đổi mật khẩu.')
      setMessage('')
    }
  }

  return (
    <div className="page-grid">
      <PageHeader
        title="Tài khoản"
        subtitle="Quản lý thông tin cá nhân, ảnh đại diện và cài đặt bảo mật của tài khoản đang đăng nhập."
      />

      {message ? <div className="success-box">{message}</div> : null}
      {error ? <div className="error-box">{error}</div> : null}

      <div className="stats-grid secondary-grid">
        <section className="glass-card profile-card">
          <div className="profile-summary">
            <div className="avatar-preview-wrap">
              {user?.avatarUrl ? <img src={user.avatarUrl} alt={user?.fullName || user?.username} className="avatar-preview" /> : <div className="avatar-circle xl">{(user?.fullName || user?.username || 'U').charAt(0).toUpperCase()}</div>}
            </div>
            <div>
              <h3>{user?.fullName || user?.username}</h3>
              <p className="muted">{user?.email}</p>
              <p className="muted">{user?.role}</p>
            </div>
          </div>
          <label className="ghost-btn file-upload-btn">
            <input type="file" accept="image/*" onChange={handleAvatar} hidden />
            {uploading ? 'Đang tải ảnh...' : 'Cập nhật ảnh đại diện'}
          </label>
        </section>

        <section className="glass-card profile-card">
          <h3>Thông tin cá nhân</h3>
          <form className="form-grid" onSubmit={saveProfile}>
            <input placeholder="Họ tên" value={profileForm.fullName} onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })} />
            <input placeholder="Email" type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} />
            <input placeholder="Số điện thoại" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} />
            <div className="form-actions">
              <button className="primary-btn" type="submit">Lưu thay đổi</button>
            </div>
          </form>
        </section>

        <section className="glass-card profile-card">
          <h3>Đổi mật khẩu</h3>
          <form className="form-grid" onSubmit={changePassword}>
            <input placeholder="Mật khẩu hiện tại" type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} required />
            <input placeholder="Mật khẩu mới" type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} required />
            <input placeholder="Xác nhận mật khẩu mới" type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} required />
            <div className="form-actions">
              <button className="primary-btn" type="submit">Đổi mật khẩu</button>
            </div>
          </form>
        </section>
      </div>
    </div>
  )
}
