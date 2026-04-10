import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import Badge from "../components/Badge";
import { devicesApi, incidentsApi, usersApi } from "../api/modules";
import { formatDateTime, toneByStatus } from "../utils/formatters";
import { useAuth } from "../auth/AuthContext";

const blankForm = {
  title: "",
  description: "",
  severity: "HIGH",
  deviceId: "",
  occurredAt: "",
  assignedTechnicianId: "",
  status: "REPORTED",
  resolutionNote: "",
};

const toDateTimeLocal = (value) =>
  value ? new Date(value).toISOString().slice(0, 16) : "";

export default function IncidentsPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [devices, setDevices] = useState([]);
  const [techs, setTechs] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blankForm);
  const [error, setError] = useState("");
  const [assigningRow, setAssigningRow] = useState(null);
  const [assignTechnicianId, setAssignTechnicianId] = useState("");

  const loadData = async () => {
    try {
      const [incidentData, deviceData, technicianData] = await Promise.all([
        incidentsApi.getAll({ size: 100 }),
        devicesApi.getActive(),
        usersApi.getTechnicians(),
      ]);
      setRows(incidentData?.content || []);
      setDevices(deviceData || []);
      setTechs(technicianData || []);
      setError("");
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || "Không tải được sự cố.",
      );
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(blankForm);
    setOpen(true);
  };
  const openEdit = (row) => {
    setEditing(row);
    setForm({
      ...row,
      occurredAt: toDateTimeLocal(row.occurredAt),
      deviceId: row.deviceId || "",
      assignedTechnicianId: row.assignedTechnicianId || "",
    });
    setOpen(true);
  };

  const save = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        ...form,
        deviceId: Number(form.deviceId),
        assignedTechnicianId: form.assignedTechnicianId
          ? Number(form.assignedTechnicianId)
          : null,
        occurredAt: form.occurredAt || null,
      };
      if (editing) await incidentsApi.update(editing.id, payload);
      else await incidentsApi.create(payload);
      setOpen(false);
      await loadData();
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || "Không thể lưu sự cố.",
      );
    }
  };

  const openAssignModal = (row) => {
    setAssigningRow(row);
    setAssignTechnicianId(
      row.assignedTechnicianId ? String(row.assignedTechnicianId) : "",
    );
  };

  const submitAssign = async (event) => {
    event.preventDefault();
    if (!assigningRow || !assignTechnicianId) return;
    await incidentsApi.assign(assigningRow.id, Number(assignTechnicianId));
    setAssigningRow(null);
    setAssignTechnicianId("");
    await loadData();
  };

  const resolve = async (row) => {
    const note = prompt("Nội dung xử lý:", row.resolutionNote || "");
    if (note === null) return; // Hủy thao tác nếu bấm Cancel

    // Yêu cầu nhập thêm chi phí để cập nhật lên Dashboard
    const costInput = prompt("Chi phí sửa chữa (VNĐ):", "0");
    const cost = costInput ? Number(costInput) : 0;

    await incidentsApi.resolve(row.id, note, cost);
    loadData();
  };

  const columns = [
    { key: "incidentCode", label: "Mã sự cố" },
    { key: "title", label: "Tiêu đề" },
    { key: "deviceName", label: "Thiết bị" },
    {
      key: "severity",
      label: "Mức độ",
      render: (row) => (
        <Badge
          tone={
            row.severity === "CRITICAL"
              ? "danger"
              : row.severity === "HIGH"
                ? "warning"
                : "info"
          }
        >
          {row.severity}
        </Badge>
      ),
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (row) => (
        <Badge tone={toneByStatus(row.status)}>{row.status}</Badge>
      ),
    },
    {
      key: "assignedTechnicianName",
      label: "KTV",
      render: (row) => row.assignedTechnicianName || "Chưa gán",
    },
    {
      key: "occurredAt",
      label: "Thời gian",
      render: (row) => formatDateTime(row.occurredAt),
    },
    user?.role !== "ROLE_USER"
      ? {
          key: "actions",
          label: "Thao tác",
          render: (row) => (
            <div className="table-actions">
              <button className="ghost-btn" onClick={() => openEdit(row)}>
                Sửa
              </button>
              {["ROLE_ADMIN", "ROLE_MANAGER"].includes(user?.role) ? (
                <button
                  className="ghost-btn"
                  onClick={() => openAssignModal(row)}
                >
                  Gán KTV
                </button>
              ) : null}
              {row.status !== "RESOLVED" ? (
                <button className="primary-btn" onClick={() => resolve(row)}>
                  Đánh dấu xong
                </button>
              ) : null}
            </div>
          ),
        }
      : null,
  ].filter(Boolean);

  return (
    <div className="page-grid">
      <PageHeader
        title="Sự cố"
        subtitle={
          ["ROLE_ADMIN", "ROLE_MANAGER"].includes(user?.role)
            ? "Theo dõi vòng đời sự cố, điều phối kỹ thuật viên và cập nhật kết quả xử lý kịp thời."
            : user?.role === "ROLE_TECHNICIAN"
              ? "Tiếp nhận, xử lý và cập nhật kết quả khắc phục cho các sự cố được phân công."
              : "Gửi yêu cầu hỗ trợ, theo dõi tiến độ xử lý và lịch sử sự cố phát sinh từ thiết bị."
        }
        actions={
          <button className="primary-btn" onClick={openCreate}>
            {user?.role === "ROLE_USER" ? "Báo cáo sự cố" : "Ghi nhận sự cố"}
          </button>
        }
      />
      {error ? <div className="error-box">{error}</div> : null}
      <DataTable columns={columns} rows={rows} emptyMessage="Chưa có sự cố." />

      <Modal
        open={open}
        title={editing ? "Cập nhật sự cố" : "Tạo sự cố"}
        onClose={() => setOpen(false)}
      >
        <form className="form-grid two-col" onSubmit={save}>
          <input
            placeholder="Tiêu đề"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <select
            value={form.severity}
            onChange={(e) => setForm({ ...form, severity: e.target.value })}
          >
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>
          <select
            value={form.deviceId}
            onChange={(e) => setForm({ ...form, deviceId: e.target.value })}
            required
          >
            <option value="">Chọn thiết bị</option>
            {devices.map((device) => (
              <option key={device.id} value={device.id}>
                {device.deviceCode} - {device.name}
              </option>
            ))}
          </select>
          {user?.role !== "ROLE_USER" && (
            <select
              value={form.assignedTechnicianId || ""}
              onChange={(e) =>
                setForm({ ...form, assignedTechnicianId: e.target.value })
              }
            >
              <option value="">Chọn kỹ thuật viên</option>
              {techs.map((tech) => (
                <option key={tech.id} value={tech.id}>
                  {tech.fullName || tech.username}
                </option>
              ))}
            </select>
          )}

          <input
            type="datetime-local"
            value={form.occurredAt || ""}
            onChange={(e) => setForm({ ...form, occurredAt: e.target.value })}
          />
          <select
            value={form.status || "REPORTED"}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            disabled={user?.role === "ROLE_USER"}
            style={
              user?.role === "ROLE_USER"
                ? { opacity: 0.6, cursor: "not-allowed" }
                : {}
            }
          >
            <option value="REPORTED">REPORTED</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="RESOLVED">RESOLVED</option>
          </select>

          <textarea
            className="col-span-2"
            placeholder="Mô tả"
            value={form.description || ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <textarea
            className="col-span-2"
            placeholder="Ghi chú xử lý"
            value={form.resolutionNote || ""}
            onChange={(e) =>
              setForm({ ...form, resolutionNote: e.target.value })
            }
          />
          <div className="form-actions col-span-2">
            <button className="primary-btn">Lưu</button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(assigningRow)}
        title="Gán kỹ thuật viên"
        onClose={() => setAssigningRow(null)}
      >
        <form className="form-grid" onSubmit={submitAssign}>
          <select
            value={assignTechnicianId}
            onChange={(e) => setAssignTechnicianId(e.target.value)}
            required
          >
            <option value="">Chọn kỹ thuật viên</option>
            {techs.map((tech) => (
              <option key={tech.id} value={tech.id}>
                {tech.fullName || tech.username}
              </option>
            ))}
          </select>
          <div className="form-actions">
            <button className="primary-btn" type="submit">
              Xác nhận phân công
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
