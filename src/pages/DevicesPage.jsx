import { useEffect, useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import { devicesApi } from '../api/modules'
import { formatCurrency, formatDate, toneByStatus } from '../utils/formatters'
import { useAuth } from '../auth/AuthContext'

const blankDevice = {
  deviceCode: '', name: '', deviceType: '', manufacturer: '', modelNumber: '', serialNumber: '',
  purchaseDate: '', warrantyExpiryDate: '', purchasePrice: '', status: 'ACTIVE', location: '', locationDetail: '', description: '', maintenanceCycleDays: 30,
}

export default function DevicesPage() {
  const { user } = useAuth()
  const [devices, setDevices] = useState([])
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(blankDevice)
  const [imageFile, setImageFile] = useState(null)
  const [error, setError] = useState('')

  const loadDevices = async () => {
    try {
      const result = await devicesApi.getAll({ keyword: query, size: 100 })
      setDevices(result?.content || [])
      setError('')
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không tải được thiết bị.')
    }
  }

  useEffect(() => { loadDevices() }, [])

  const visible = useMemo(() => devices.filter((device) => {
    const q = query.toLowerCase()
    return !q || device.name?.toLowerCase().includes(q) || device.deviceCode?.toLowerCase().includes(q) || device.location?.toLowerCase().includes(q)
  }), [devices, query])

  const openCreate = () => {
    setEditing(null)
    setForm(blankDevice)
    setImageFile(null)
    setOpen(true)
  }

  const openEdit = (device) => {
    setEditing(device)
    setForm({
      ...device,
      purchaseDate: device.purchaseDate || '',
      warrantyExpiryDate: device.warrantyExpiryDate || '',
      purchasePrice: device.purchasePrice || '',
      maintenanceCycleDays: device.maintenanceCycleDays || 30,
    })
    setImageFile(null)
    setOpen(true)
  }

  const saveDevice = async (event) => {
    event.preventDefault()
    try {
      const payload = {
        ...form,
        purchasePrice: form.purchasePrice ? Number(form.purchasePrice) : null,
        maintenanceCycleDays: form.maintenanceCycleDays ? Number(form.maintenanceCycleDays) : null,
      }
      const saved = editing ? await devicesApi.update(editing.id, payload) : await devicesApi.create(payload)
      const targetId = editing?.id || saved?.id
      if (imageFile && targetId) {
        await devicesApi.uploadImage(targetId, imageFile)
      }
      setOpen(false)
      setImageFile(null)
      await loadDevices()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không thể lưu thiết bị.')
    }
  }

  const columns = [
    {
      key: 'imageUrl', label: 'Ảnh', render: (row) => row.imageUrl ? <img src={row.imageUrl} alt={row.name} className="device-thumb" /> : <div className="device-thumb placeholder">No image</div>
    },
    { key: 'deviceCode', label: 'Mã thiết bị' },
    { key: 'name', label: 'Tên thiết bị' },
    { key: 'deviceType', label: 'Loại' },
    { key: 'location', label: 'Vị trí', render: (row) => `${row.location || ''}${row.locationDetail ? ` • ${row.locationDetail}` : ''}` },
    { key: 'purchasePrice', label: 'Giá mua', render: (row) => formatCurrency(row.purchasePrice) },
    { key: 'status', label: 'Trạng thái', render: (row) => <Badge tone={toneByStatus(row.status)}>{row.status}</Badge> },
    { key: 'warrantyExpiryDate', label: 'Hết bảo hành', render: (row) => formatDate(row.warrantyExpiryDate) },
    ...(['ROLE_ADMIN', 'ROLE_MANAGER'].includes(user?.role) ? [{ key: 'actions', label: 'Thao tác', render: (row) => <button className="ghost-btn" onClick={() => openEdit(row)}>Cập nhật</button> }] : []),
  ]

  return (
    <div className="page-grid">
      <PageHeader title="Thiết bị" subtitle={['ROLE_ADMIN', 'ROLE_MANAGER'].includes(user?.role) ? 'Quản lý hồ sơ thiết bị, vị trí lắp đặt và tình trạng sử dụng trong toàn hệ thống.' : 'Tra cứu nhanh hồ sơ thiết bị, vị trí sử dụng và trạng thái vận hành hiện tại.'} actions={['ROLE_ADMIN', 'ROLE_MANAGER'].includes(user?.role) ? <button className="primary-btn" onClick={openCreate}>Thêm thiết bị</button> : null} />
      <div className="filters glass-card"><input placeholder="Tìm mã, tên, vị trí..." value={query} onChange={(e) => setQuery(e.target.value)} /></div>
      {error ? <div className="error-box">{error}</div> : null}
      <DataTable columns={columns} rows={visible} emptyMessage="Chưa có thiết bị." />
      <Modal open={open} title={editing ? 'Cập nhật thiết bị' : 'Thêm thiết bị'} onClose={() => setOpen(false)}>
        <form className="form-grid two-col" onSubmit={saveDevice}>
          {Object.entries({
            deviceCode: 'Mã thiết bị', name: 'Tên thiết bị', deviceType: 'Loại', manufacturer: 'Hãng', modelNumber: 'Model', serialNumber: 'Serial',
            purchaseDate: 'Ngày mua', warrantyExpiryDate: 'Hết bảo hành', purchasePrice: 'Giá mua', location: 'Vị trí', locationDetail: 'Chi tiết vị trí', maintenanceCycleDays: 'Chu kỳ bảo trì', description: 'Mô tả'
          }).map(([key, label]) => (
            key === 'description'
              ? <textarea key={key} className="col-span-2" placeholder={label} value={form[key] ?? ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
              : <input key={key} type={['purchaseDate', 'warrantyExpiryDate'].includes(key) ? 'date' : ['purchasePrice', 'maintenanceCycleDays'].includes(key) ? 'number' : 'text'} placeholder={label} value={form[key] ?? ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })} required={['deviceCode', 'name', 'deviceType', 'location'].includes(key)} />
          ))}
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="ACTIVE">ACTIVE</option>
            <option value="UNDER_MAINTENANCE">UNDER_MAINTENANCE</option>
            <option value="BROKEN">BROKEN</option>
            <option value="DISPOSED">DISPOSED</option>
          </select>
          <div className="form-field">
            <span className="tiny-label">Hình ảnh thiết bị</span>
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
            {editing?.imageUrl && !imageFile ? <img src={editing.imageUrl} alt={editing.name} className="device-form-preview" /> : null}
            {imageFile ? <div className="muted">{imageFile.name}</div> : null}
          </div>
          <div className="form-actions col-span-2"><button className="primary-btn">Lưu</button></div>
        </form>
      </Modal>
    </div>
  )
}
