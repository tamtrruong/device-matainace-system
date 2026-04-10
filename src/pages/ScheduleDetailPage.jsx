import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import HeaderBar from '../components/HeaderBar'
import useAsync from '../hooks/useAsync'
import { schedulesApi } from '../api/modules'
import { formatCurrency, formatDate, getField, safeArray } from '../utils/formatters'

export default function ScheduleDetailPage() {
  const { id } = useParams()
  const { data, loading, error, run } = useAsync(null)

  useEffect(() => {
    run(async () => {
      const response = await schedulesApi.getById(id)
      return response.data
    })
  }, [id, run])

  const checklist = safeArray(data?.checklist || data?.tasks || data?.items)

  return (
    <section className="page-grid">
      <HeaderBar
        title="Chi tiết lịch bảo trì"
        subtitle="Xem hạng mục công việc, tình trạng lịch và thông tin được duyệt/thực thi/xác nhận."
        actions={<Link className="ghost-btn" to="/schedules">← Quay lại</Link>}
      />

      {loading ? <div className="alert info">Đang tải chi tiết lịch bảo trì...</div> : null}
      {error ? <div className="alert error">{error}</div> : null}

      {data ? (
        <div className="detail-card glass-card">
          <div className="detail-grid">
            <div><strong>Tên lịch:</strong> {getField(data, ['title', 'name'])}</div>
            <div><strong>Thiết bị:</strong> {getField(data, ['deviceCode', 'deviceId'])}</div>
            <div><strong>Tần suất:</strong> {getField(data, ['frequency', 'cycle'])}</div>
            <div><strong>Ngày kế hoạch:</strong> {formatDate(getField(data, ['plannedDate', 'scheduledDate'], ''))}</div>
            <div><strong>Trạng thái:</strong> <span className="badge">{getField(data, ['status'])}</span></div>
            <div><strong>Chi phí:</strong> {formatCurrency(getField(data, ['actualCost', 'cost'], 0))}</div>
            <div><strong>Technician:</strong> {getField(data, ['technicianName', 'technicianId'])}</div>
            <div><strong>Ghi chú:</strong> {getField(data, ['description', 'completionNote', 'note'])}</div>
          </div>

          <div className="detail-subsection">
            <h3>Checklist / hạng mục</h3>
            {checklist.length > 0 ? (
              <ul className="bullet-list">
                {checklist.map((item, index) => <li key={index}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>)}
              </ul>
            ) : (
              <p className="muted">Chưa có checklist hoặc backend đang trả về trường khác.</p>
            )}
          </div>
        </div>
      ) : null}
    </section>
  )
}
