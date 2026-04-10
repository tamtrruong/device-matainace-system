import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { incidentsApi } from "../api/modules"; // Import API gọi sự cố

export default function DashboardUser() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        // Gọi API lấy danh sách sự cố (Backend thường tự động filter những sự cố do user này tạo)
        const response = await incidentsApi.getAll({
          size: 20,
          sort: "createdAt,desc",
        });

        // Map dữ liệu thật từ Backend để khớp với giao diện bảng của bạn
        const realData = (response?.content || []).map((inc) => ({
          id: inc.id,
          type: "Báo cáo sự cố",
          desc: inc.title || inc.description, // Lấy tiêu đề hoặc mô tả sự cố
          time: inc.createdAt
            ? new Date(inc.createdAt).toLocaleString("vi-VN")
            : "Gần đây",
          status: inc.status, // REPORTED, IN_PROGRESS, RESOLVED
        }));

        setActivities(realData);
      } catch (error) {
        console.error("Lỗi khi tải hoạt động:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  // Hàm chuyển đổi màu sắc theo trạng thái thực tế của Database
  const getStatusStyle = (status) => {
    switch (status) {
      case "RESOLVED":
        return { borderColor: "#40e0b0", color: "#40e0b0" }; // Xanh ngọc
      case "IN_PROGRESS":
        return { borderColor: "#88b7ff", color: "#88b7ff" }; // Xanh dương
      case "REPORTED":
        return { borderColor: "#ffd166", color: "#ffd166" }; // Vàng
      default:
        return { borderColor: "#ccc", color: "#ccc" };
    }
  };

  return (
    <div className="page-grid">
      <div className="page-header glass-card">
        <div>
          <h2>Hoạt động của bạn</h2>
          <p className="muted">Danh sách sự cố đã báo cáo và tiến độ xử lý</p>
        </div>
        <div className="header-actions">
          {/* Nút này giờ sẽ chuyển hướng sang trang quản lý sự cố */}
          <button
            className="primary-btn"
            onClick={() => navigate("/incidents")}
          >
            + Thêm báo cáo sự cố
          </button>
        </div>
      </div>

      <div className="table-shell glass-card">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Loại hoạt động</th>
                <th>Mô tả chi tiết</th>
                <th>Thời gian</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {/* Hiển thị Loading khi đang gọi API */}
              {loading ? (
                <tr>
                  <td colSpan="4" className="empty-cell">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : activities.length === 0 ? (
                <tr>
                  <td colSpan="4" className="empty-cell">
                    Chưa có hoạt động nào.
                  </td>
                </tr>
              ) : (
                // Render dữ liệu thật
                activities.map((act) => (
                  <tr key={act.id}>
                    <td>
                      <strong>{act.type}</strong>
                    </td>
                    <td>{act.desc}</td>
                    <td className="muted">{act.time}</td>
                    <td>
                      <span
                        className="badge"
                        style={getStatusStyle(act.status)}
                      >
                        {act.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
