import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import HeaderBar from '../components/HeaderBar'
import useAsync from '../hooks/useAsync'
import { incidentsApi } from '../api/modules'
import { formatCurrency, formatDateTime, getField, safeArray } from '../utils/formatters'

export default function IncidentDetailPage() {
  const { id } = useParams()
  const { data, loading, error, run } = useAsync(null)

  useEffect(() => {
    run(async () => {
      const response = await incidentsApi.getById(id)
      return response.data
    })
  }, [id, run])

  const imageUrls = safeArray(data?.imageUrls || data?.images || data?.attachments)

  return (
    <section className="page-grid">
      <HeaderBar
        title="Chi tiết sự cố"
        subtitle="Tập trung hiển thị mô tả, technician phụ trách, trạng thái và thông tin resolve của phần 6."
        actions={<Link className="ghost-btn" to="/incidents">← Quay lại</Link>}
      />

      {loading ? <div className="alert info">Đang tải chi tiết sự cố...</div> : null}
      {error ? <div className="alert error">{error}</div> : null}

      {data ? (
        <div className="detail-card glass-card">
          <div className="detail-grid">
            <div><strong>Thiết bị:</strong> {getField(data, ['deviceCode', 'deviceId'])}</div>
            <div><strong>Mô tả:</strong> {getField(data, ['description', 'summary'])}</div>
            <div><strong>Mức độ:</strong> <span className="badge">{getField(data, ['severity', 'priority'])}</span></div>
            <div><strong>Trạng thái:</strong> <span className="badge">{getField(data, ['status', 'incidentStatus'])}</span></div>
            <div><strong>Technician:</strong> {getField(data, ['technicianName', 'technicianId'])}</div>
            <div><strong>Thời gian báo cáo:</strong> {formatDateTime(getField(data, ['reportedAt', 'createdAt'], ''))}</div>
            <div><strong>Nguyên nhân lõi:</strong> {getField(data, ['rootCause'], 'Chưa có')}</div>
            <div><strong>Kết quả xử lý:</strong> {getField(data, ['resolution', 'resolutionSummary'], 'Chưa có')}</div>
            <div><strong>Chi phí:</strong> {formatCurrency(getField(data, ['cost', 'actualCost'], 0))}</div>
          </div>

          <div className="detail-subsection">
            <h3>Ảnh hiện trường / minh chứng</h3>
            {imageUrls.length > 0 ? (
              <div className="image-grid">
                {imageUrls.map((url, index) => (
                  <a href={typeof url === 'string' ? url : '#'} target="_blank" rel="noreferrer" key={index} className="image-card">
                    <span>{typeof url === 'string' ? url : JSON.stringify(url)}</span>
                  </a>
                ))}
              </div>
            ) : (
              <p className="muted">Chưa có ảnh hoặc backend đang dùng tên trường khác.</p>
            )}
          </div>
        </div>
      ) : null}
    </section>
  )
}
