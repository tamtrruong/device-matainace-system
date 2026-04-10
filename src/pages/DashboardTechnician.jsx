import React, { useEffect, useState } from "react";
import { dashboardApi } from "../api/modules";
import StatCard from "../components/StatCard";

export default function DashboardTechnician() {
  const [stats, setStats] = useState({
    pendingIncidents: 0,
    resolvedIncidents: 0,
    upcomingSchedules: 0,
    completedSchedules: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTechStats = async () => {
      try {
        setLoading(true);
        // Gọi API dành riêng cho Kỹ thuật viên
        const realData = await dashboardApi.getTechStats();
        if (realData) {
          setStats(realData);
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu Kỹ thuật viên:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTechStats();
  }, []);

  if (loading) {
    return (
      <div className="center-screen glass-card">
        Đang tải dữ liệu công việc...
      </div>
    );
  }

  return (
    <div className="page-grid">
      <div className="page-header glass-card">
        <div>
          <h2>Bảng điều phối công việc</h2>
          <p className="muted">
            Tập trung vào các hạng mục đang được giao và ưu tiên xử lý sự cố.
          </p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          label="Lịch được giao"
          value={stats.upcomingSchedules}
          helper="Sắp diễn ra"
        />
        <StatCard
          label="Sự cố phụ trách"
          value={stats.pendingIncidents}
          helper="Đang mở / Cần xử lý ngay"
          typeClass="text-warning"
        />
        <StatCard
          label="Sự cố đã giải quyết"
          value={stats.resolvedIncidents}
          helper="Đã hoàn thành"
          typeClass="text-success"
        />
        <StatCard
          label="Lịch bảo trì đã xong"
          value={stats.completedSchedules}
          helper="Đã hoàn thành"
        />
      </div>
    </div>
  );
}
