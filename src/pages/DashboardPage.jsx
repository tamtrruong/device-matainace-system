import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import { devicesApi, schedulesApi, incidentsApi } from "../api/modules";
import { useAuth } from "../auth/AuthContext";
import DashboardAdmin from "./DashboardAdmin";
import DashboardTechnician from "./DashboardTechnician";

export default function DashboardPage() {
  const { user } = useAuth();
  if (["ROLE_ADMIN", "ROLE_MANAGER"].includes(user?.role)) {
    return <DashboardAdmin />;
  }
  if (user?.role === "ROLE_TECHNICIAN") {
    return <DashboardTechnician />;
  }

  const [extra, setExtra] = useState({
    devices: 0,
    schedules: 0,
    incidents: 0,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [devices, schedules, incidents] = await Promise.all([
          devicesApi.getAll({ size: 200 }),
          schedulesApi.getAll({ size: 200 }),
          incidentsApi.getAll({ size: 200 }),
        ]);
        setExtra({
          devices: devices?.totalElements ?? devices?.content?.length ?? 0,
          schedules:
            schedules?.totalElements ?? schedules?.content?.length ?? 0,
          incidents:
            incidents?.totalElements ?? incidents?.content?.length ?? 0,
        });
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Không tải được dashboard.",
        );
      }
    };
    load();
  }, []);

  return (
    <div className="page-grid">
      <PageHeader
        title="Không gian theo dõi cá nhân"
        subtitle="Xem nhanh tình trạng thiết bị và các yêu cầu hỗ trợ có liên quan đến bạn."
      />

      {error ? <div className="error-box">{error}</div> : null}

      <div className="stats-grid secondary-grid">
        <StatCard
          label="Thiết bị đang theo dõi"
          value={extra.devices}
          helper="Danh mục thiết bị mà bạn có thể tra cứu và gửi yêu cầu hỗ trợ."
        />
        <StatCard
          label="Lịch bảo trì hiện có"
          value={extra.schedules}
          helper="Những đợt kiểm tra, bảo dưỡng đã được lên kế hoạch."
        />
        <StatCard
          label="Yêu cầu sự cố"
          value={extra.incidents}
          helper="Những yêu cầu hỗ trợ đã được ghi nhận trong hệ thống."
        />
      </div>
    </div>
  );
}
