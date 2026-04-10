import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import HeaderBar from '../components/HeaderBar'
import DataTable from '../components/DataTable'
import useAsync from '../hooks/useAsync'
import { devicesApi } from '../api/modules'
import { formatCurrency, formatDate, formatDateTime, getField, normalizeListResponse } from '../utils/formatters'

export default function DeviceDetailPage() {
  const { id } = useParams()
  const { data, setData, loading, error, run } = useAsync({ detail: null, histories: [], incidents: [] })

  useEffect(() => {
    run(async () => {
      const [detailRes, historiesRes, incidentsRes] = await Promise.all([
        devicesApi.getById(id),
        devicesApi.getHistories(id),
        devicesApi.getIncidents(id)
      ])
      return {
        detail: detailRes.data,
        histories: normalizeListResponse(historiesRes),
        incidents: normalizeListResponse(incidentsRes)
      }
    })
  }, [id, run])

  const historyColumns = [
    { key: 'time', label: 'Thời gian', render: (row) => formatDateTime(getField(row, ['createdAt', 'date', 'maintenanceDate'], '')) },
    { key: 'type', label: 'Loại', render: (row) => getField(row, ['type', 'historyType']) },
    { key: 'description', label: 'Mô tả', render: (row) => getField(row, ['description', 'note', 'content']) },
    { key: 'cost', label: 'Chi phí', render: (row) => formatCurrency(getField(row, ['cost', 'totalCost'], 0)) }
  ]

  const incidentColumns = [
    { key: 'title', label: 'Sự cố', render: (row) => getField(row, ['title', 'summary', 'description']) },
    { key: 'severity', label: 'Mức độ', render: (row) => <span className="badge">{getField(row, ['severity', 'priority'])}</span> },
    { key: 'status', label: 'Trạng thái', render: (row) => <span className="badge">{getField(row, ['status', 'incidentStatus'])}</span> },
    { key: 'createdAt', label: 'Ngày tạo', render: (row) => formatDateTime(getField(row, ['createdAt', 'reportedAt'], '')) }
  ]

  const detail = data?.detail

  return (
    <section className="page-grid">
      <HeaderBar
        title="Chi tiết thiết bị"
        subtitle="Khai thác GET /api/devices/{id}, histories và incidents để xem toàn bộ hồ sơ thiết bị."
        actions={<Link className="ghost-btn" to="/devices">← Quay lại</Link>}
      />

      {loading ? <div className="alert info">Đang tải chi tiết thiết bị...</div> : null}
      {error ? <div className="alert error">{error}</div> : null}

      {detail ? (
        <div className="detail-card glass-card">
          <div className="detail-grid">
            <div><strong>Mã:</strong> {getField(detail, ['code', 'deviceCode'])}</div>
            <div><strong>Tên:</strong> {getField(detail, ['name', 'deviceName'])}</div>
            <div><strong>Loại:</strong> {getField(detail, ['type', 'deviceType'])}</div>
            <div><strong>Nhà sản xuất:</strong> {getField(detail, ['manufacturer', 'brand'])}</div>
            <div><strong>Vị trí:</strong> {getField(detail, ['location', 'room', 'department'])}</div>
            <div><strong>Ngày mua:</strong> {formatDate(getField(detail, ['purchaseDate', 'boughtDate'], ''))}</div>
            <div><strong>Trạng thái:</strong> <span className="badge">{getField(detail, ['status', 'deviceStatus'])}</span></div>
          </div>
        </div>
      ) : null}

      <div className="dual-grid">
        <div>
          <h3 className="section-title">Lịch sử bảo trì / sửa chữa</h3>
          <DataTable columns={historyColumns} rows={data?.histories || []} emptyMessage="Thiết bị này chưa có lịch sử." />
        </div>
        <div>
          <h3 className="section-title">Danh sách sự cố liên quan</h3>
          <DataTable columns={incidentColumns} rows={data?.incidents || []} emptyMessage="Thiết bị này chưa phát sinh sự cố." />
        </div>
      </div>
    </section>
  )
}
