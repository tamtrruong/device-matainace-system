import React, { useEffect, useState } from "react";
import { dashboardApi } from "../api/modules";
import StatCard from "../components/StatCard";

export default function DashboardAdmin() {
  const [stats, setStats] = useState({
    totalDevices: 0,
    activeDevices: 0,
    underMaintenanceDevices: 0,
    brokenDevices: 0,
    totalIncidents: 0,
    openIncidents: 0,
    resolvedIncidents: 0,
    totalSchedules: 0,
    scheduledMaintenance: 0,
    completedMaintenance: 0,
    overdueSchedules: 0,
    totalRepairCost: 0,
    totalMaintenanceCost: 0,
    totalUsers: 0,
    totalTechnicians: 0,
    incidentsByMonth: {},
    devicesByStatus: {},
    costByMonth: {},
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const realData = await dashboardApi.getAdminStats();
        if (realData) setStats(realData);
      } catch (error) {
        console.error("Lỗi tải dữ liệu Dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const formatVND = (amount) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);

  if (loading)
    return (
      <div className="center-screen glass-card">
        Đang tải dữ liệu hệ thống...
      </div>
    );

  return (
    <div className="page-grid">
      <div className="page-header glass-card">
        <div>
          <h2>Tổng quan Hệ thống</h2>
          <p className="muted">
            Số liệu thống kê chi tiết dành cho Quản trị viên
          </p>
        </div>
      </div>

      {/* Grid 1: Thiết bị & Sự cố */}
      <div className="stats-grid">
        <StatCard
          label="Tổng thiết bị"
          value={stats.totalDevices}
          helper={`${stats.activeDevices} đang hoạt động tốt`}
        />
        <StatCard
          label="Thiết bị hỏng"
          value={stats.brokenDevices}
          helper="Cần phân công sửa chữa"
          typeClass="text-danger"
        />
        <StatCard
          label="Sự cố đang mở"
          value={stats.openIncidents}
          helper={`Trong tổng số ${stats.totalIncidents} sự cố`}
          typeClass="text-warning"
        />
        <StatCard
          label="Lịch quá hạn"
          value={stats.overdueSchedules}
          helper="Cần rà soát ngay"
          typeClass="text-danger"
        />
      </div>

      {/* Grid 2: Nhân sự & Chi phí */}
      <div className="stats-grid">
        <StatCard
          label="Đội ngũ kỹ thuật"
          value={stats.totalTechnicians}
          helper={`/ ${stats.totalUsers} tổng người dùng`}
        />
        <StatCard
          label="Lịch đang chờ"
          value={stats.scheduledMaintenance}
          helper="Sắp diễn ra"
        />
        <StatCard
          label="Chi phí sửa chữa"
          value={formatVND(stats.totalRepairCost)}
          helper="Toàn thời gian"
        />
        <StatCard
          label="Chi phí bảo trì"
          value={formatVND(stats.totalMaintenanceCost)}
          helper="Toàn thời gian"
        />
      </div>

      {/* Biểu đồ tĩnh dựa trên CSS Grid */}
      <div className="secondary-grid">
        {/* Box Trạng thái */}
        <div className="glass-card stat-card">
          <h3 className="mb-2" style={{ fontSize: "1.2rem" }}>
            Tỉ lệ trạng thái thiết bị
          </h3>
          <div className="form-grid">
            <div
              className="topbar-actions"
              style={{ justifyContent: "space-between" }}
            >
              <span className="muted">Đang hoạt động</span>
              <span className="badge badge-success">
                {stats.devicesByStatus?.ACTIVE || 0}
              </span>
            </div>
            <div
              className="topbar-actions"
              style={{ justifyContent: "space-between" }}
            >
              <span className="muted">Đang bảo trì</span>
              <span className="badge badge-warning">
                {stats.devicesByStatus?.UNDER_MAINTENANCE || 0}
              </span>
            </div>
            <div
              className="topbar-actions"
              style={{ justifyContent: "space-between" }}
            >
              <span className="muted">Hỏng hóc</span>
              <span className="badge badge-danger">
                {stats.devicesByStatus?.BROKEN || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Box Sự cố theo tháng */}
        <div className="glass-card stat-card col-span-2">
          <h3 className="mb-2" style={{ fontSize: "1.2rem" }}>
            Sự cố báo cáo (6 tháng gần nhất)
          </h3>
          <div
            style={{
              display: "flex",
              gap: "12px",
              overflowX: "auto",
              paddingBottom: "10px",
            }}
          >
            {Object.keys(stats.incidentsByMonth || {}).length > 0 ? (
              Object.entries(stats.incidentsByMonth).map(([month, count]) => (
                <div
                  key={month}
                  className="glass-card"
                  style={{
                    flex: 1,
                    minWidth: "90px",
                    textAlign: "center",
                    padding: "16px 8px",
                    borderRadius: "16px",
                  }}
                >
                  <h4
                    className="mb-1"
                    style={{ fontSize: "1.4rem", color: "#8db7ff" }}
                  >
                    {count}
                  </h4>
                  <p
                    className="muted"
                    style={{ margin: 0, fontSize: "0.8rem" }}
                  >
                    {month}
                  </p>
                </div>
              ))
            ) : (
              <div
                className="muted center-screen"
                style={{ minHeight: "100px", width: "100%" }}
              >
                Chưa có dữ liệu sự cố
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
