import { useEffect, useState } from 'react'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import { devicesApi, schedulesApi, usersApi } from '../api/modules'
import { formatCurrency, formatDateTime, toneByStatus } from '../utils/formatters'
import { useAuth } from '../auth/AuthContext'

const blankForm = {
  title: '', maintenanceType: 'Định kỳ', description: '', scheduledDate: '', estimatedDurationHours: 2,
  deviceId: '', assignedTechnicianId: '', cost: '', notes: '', status: 'SCHEDULED'
}

const toDateTimeLocal = (value) => value ? new Date(value).toISOString().slice(0, 16) : ''

export default function SchedulesPage() {
  const { user } = useAuth()
  const [rows, setRows] = useState([])
  const [devices, setDevices] = useState([])
  const [techs, setTechs] = useState([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(blankForm)
  const [error, setError] = useState('')

  const loadData = async () => {
    try {
      const [scheduleData, deviceData, technicianData] = await Promise.all([
        schedulesApi.getAll({ size: 100 }),
        devicesApi.getActive(),
        usersApi.getTechnicians(),
      ])
      setRows(scheduleData?.content || [])
      setDevices(deviceData || [])
      setTechs(technicianData || [])
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không tải được lịch bảo trì.')
    }
  }

  useEffect(() => { loadData() }, [])

  const openCreate = () => { setEditing(null); setForm(blankForm); setOpen(true) }
  const openEdit = (row) => {
    setEditing(row)
    setForm({
      ...row,
      scheduledDate: toDateTimeLocal(row.scheduledDate),
      cost: row.cost || '',
      deviceId: row.deviceId || '',
      assignedTechnicianId: row.assignedTechnicianId || '',
      estimatedDurationHours: row.estimatedDurationHours || 2,
    })
    setOpen(true)
  }

  const save = async (event) => {
    event.preventDefault()
    const payload = {
      ...form,
      deviceId: Number(form.deviceId),
      assignedTechnicianId: form.assignedTechnicianId ? Number(form.assignedTechnicianId) : null,
      estimatedDurationHours: Number(form.estimatedDurationHours || 0),
      cost: form.cost ? Number(form.cost) : null,
      scheduledDate: form.scheduledDate,
    }
    if (editing) await schedulesApi.update(editing.id, payload)
    else await schedulesApi.create(payload)
    setOpen(false)
    loadData()
  }

  const complete = async (row) => {
    const notes = prompt('Ghi chú hoàn thành:', row.notes || '')
    const cost = prompt('Chi phí thực tế:', row.cost || '')
    await schedulesApi.complete(row.id, { notes, cost })
    loadData()
  }

  const columns = [
    { key: 'scheduleCode', label: 'Mã lịch' },
    { key: 'title', label: 'Tiêu đề' },
    { key: 'deviceName', label: 'Thiết bị' },
    { key: 'assignedTechnicianName', label: 'KTV', render: (row) => row.assignedTechnicianName || 'Chưa gán' },
    { key: 'scheduledDate', label: 'Ngày bảo trì', render: (row) => formatDateTime(row.scheduledDate) },
    { key: 'cost', label: 'Chi phí', render: (row) => formatCurrency(row.cost) },
    { key: 'status', label: 'Trạng thái', render: (row) => <Badge tone={toneByStatus(row.status)}>{row.status}</Badge> },
    ...(['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_TECHNICIAN'].includes(user?.role) ? [{
      key: 'actions', label: 'Thao tác', render: (row) => (
        <div className="table-actions">
          <button className="ghost-btn" onClick={() => openEdit(row)}>Cập nhật</button>
          {row.status !== 'COMPLETED' ? <button className="primary-btn" onClick={() => complete(row)}>Hoàn thành</button> : null}
        </div>
      )
    }] : []),
  ]

  return (
    <div className="page-grid">
      <PageHeader title="Lịch bảo trì" subtitle={['ROLE_ADMIN', 'ROLE_MANAGER'].includes(user?.role) ? 'Lên kế hoạch bảo trì định kỳ, theo dõi người phụ trách và kiểm soát tiến độ thực hiện.' : user?.role === 'ROLE_TECHNICIAN' ? 'Danh sách công việc bảo trì được giao để bạn theo dõi tiến độ và xác nhận hoàn thành.' : 'Tra cứu các lịch bảo trì liên quan đến thiết bị trong hệ thống.'} actions={['ROLE_ADMIN', 'ROLE_MANAGER'].includes(user?.role) ? <button className="primary-btn" onClick={openCreate}>Tạo lịch</button> : null} />
      {error ? <div className="error-box">{error}</div> : null}
      <DataTable columns={columns} rows={rows} emptyMessage="Chưa có lịch bảo trì." />
      <Modal open={open} title={editing ? 'Cập nhật lịch' : 'Tạo lịch bảo trì'} onClose={() => setOpen(false)}>
        <form className="form-grid two-col" onSubmit={save}>
          <input placeholder="Tiêu đề" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <input placeholder="Loại bảo trì" value={form.maintenanceType} onChange={(e) => setForm({ ...form, maintenanceType: e.target.value })} />
          <input type="datetime-local" value={form.scheduledDate} onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })} required />
          <input type="number" placeholder="Thời lượng (giờ)" value={form.estimatedDurationHours} onChange={(e) => setForm({ ...form, estimatedDurationHours: e.target.value })} />
          <select value={form.deviceId} onChange={(e) => setForm({ ...form, deviceId: e.target.value })} required>
            <option value="">Chọn thiết bị</option>
            {devices.map((device) => <option key={device.id} value={device.id}>{device.deviceCode} - {device.name}</option>)}
          </select>
          <select value={form.assignedTechnicianId} onChange={(e) => setForm({ ...form, assignedTechnicianId: e.target.value })}>
            <option value="">Chọn kỹ thuật viên</option>
            {techs.map((tech) => <option key={tech.id} value={tech.id}>{tech.fullName || tech.username}</option>)}
          </select>
          <input type="number" placeholder="Chi phí dự kiến" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} />
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="SCHEDULED">SCHEDULED</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
          <textarea className="col-span-2" placeholder="Mô tả" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <textarea className="col-span-2" placeholder="Ghi chú" value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="form-actions col-span-2"><button className="primary-btn">Lưu</button></div>
        </form>
      </Modal>
    </div>
  )
}
