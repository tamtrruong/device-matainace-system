Frontend này được làm riêng cho 6 nhóm chức năng trong tài liệu API:

- Phần 1: Authentication
- Phần 2: User Management
- Phần 3: Dashboard
- Phần 4: Device Management
- Phần 5: Maintenance Schedule
- Phần 6: Incident Management

## Công nghệ

- React + Vite
- React Router DOM
- Axios
- Lucide React

## Chạy project

```bash
npm install
cp .env.example .env
npm run dev
```

Mặc định frontend sẽ gọi backend tại:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

## Màn hình đã có

### 1) Device Management

- Danh sách thiết bị
- Tìm kiếm nhanh trên giao diện
- Thêm thiết bị
- Cập nhật thiết bị
- Xóa / thanh lý thiết bị
- Xem chi tiết thiết bị
- Xem lịch sử sửa chữa / bảo trì của thiết bị
- Xem các sự cố từng xảy ra với thiết bị

### 2) Maintenance Schedule

- Danh sách lịch bảo trì
- Tạo lịch bảo trì
- Approve và giao technician
- Execute để cập nhật tiến độ + checklist
- Confirm để xác nhận hoàn thành và ghi nhận chi phí
- Xem chi tiết lịch bảo trì

### 3) Incident Management

- Danh sách sự cố
- Tạo sự cố mới
- Assign technician
- Cập nhật status
- Resolve sự cố với nguyên nhân lõi, kết quả xử lý, chi phí
- Xem chi tiết sự cố

## Mapping endpoint

Các endpoint đã được nối sẵn trong `src/api/modules.js`

### Devices

- `GET /devices`
- `GET /devices/{id}`
- `POST /devices`
- `PUT /devices/{id}`
- `DELETE /devices/{id}`
- `GET /devices/{id}/histories`
- `GET /devices/{id}/incidents`

### Schedules

- `GET /schedules`
- `GET /schedules/{id}`
- `POST /schedules`
- `PUT /schedules/{id}/approve`
- `PUT /schedules/{id}/execute`
- `PUT /schedules/{id}/confirm`

### Incidents

- `GET /incidents`
- `GET /incidents/{id}`
- `POST /incidents`
- `PUT /incidents/{id}/assign`
- `PUT /incidents/{id}/status`
- `PUT /incidents/{id}/resolve`

## Lưu ý quan trọng khi nối với backend Spring Boot

Vì tài liệu API mới mô tả endpoint và nghiệp vụ chứ chưa chốt DTO/response schema chi tiết, frontend đang hỗ trợ nhiều tên field để dễ ghép backend hơn. Ví dụ:

- device code có thể là `code` hoặc `deviceCode`
- name có thể là `name` hoặc `deviceName`
- lịch có thể trả `title` hoặc `name`
- response list có thể là mảng trực tiếp, hoặc nằm trong `content`, `data`, `items`

Nếu backend của bạn đã chốt DTO cụ thể, chỉ cần sửa các phần sau:

- `src/utils/formatters.js` cho tên field
- `src/pages/*.jsx` tại chỗ tạo payload hoặc đọc response

## Gợi ý backend Spring Boot để ghép nhanh

Nên để response trả JSON nhất quán như sau:

### Device

```json
{
  "id": 1,
  "code": "DV001",
  "name": "Máy in HP",
  "type": "Printer",
  "manufacturer": "HP",
  "location": "Phòng Kế toán",
  "purchaseDate": "2026-03-20",
  "status": "ACTIVE"
}
```

### Schedule

```json
{
  "id": 1,
  "title": "Bảo trì quý 2",
  "deviceId": 1,
  "deviceCode": "DV001",
  "frequency": "QUARTERLY",
  "plannedDate": "2026-04-15",
  "status": "APPROVED"
}
```

### Incident

```json
{
  "id": 1,
  "deviceId": 1,
  "deviceCode": "DV001",
  "description": "Máy không khởi động",
  "severity": "HIGH",
  "status": "IN_PROGRESS",
  "reportedAt": "2026-04-02T08:30:00"
}
```

## Cấu trúc thư mục

```text
src/
  api/
  components/
  hooks/
  layouts/
  pages/
  styles/
  utils/
```

## Nên làm thêm nếu còn thời gian

- Form validation bằng react-hook-form + zod
- Quản lý auth / role để phân quyền nút bấm theo Admin, Technician, User
- Toast notification
- Upload ảnh sự cố qua `/api/files/upload`
- Dashboard cho thống kê
  > > > > > > > bf0646f (first commit)
