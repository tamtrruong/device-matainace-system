export const formatDate = (value) => {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)
}

export const formatDateTime = (value) => {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
  }).format(date)
}

export const formatCurrency = (value) => {
  const num = Number(value || 0)
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(num)
}

export const getApiList = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.content)) return payload.content
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

export const toneByRole = (role) => ({
  ROLE_ADMIN: 'danger',
  ROLE_MANAGER: 'info',
  ROLE_TECHNICIAN: 'success',
  ROLE_USER: 'default',
}[role] || 'default')

export const toneByStatus = (value = '') => {
  const key = String(value).toUpperCase()
  if (['ACTIVE', 'SCHEDULED', 'OPEN', 'ENABLED', 'REPORTED'].includes(key)) return 'info'
  if (['IN_PROGRESS', 'UNDER_MAINTENANCE'].includes(key)) return 'warning'
  if (['RESOLVED', 'COMPLETED'].includes(key)) return 'success'
  if (['INACTIVE', 'DISABLED', 'CANCELLED'].includes(key)) return 'danger'
  return 'default'
}
