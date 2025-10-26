# Tính năng Lên lịch Livestream

## 🎯 Tổng quan

Tính năng lên lịch livestream cho phép streamer tạo và quản lý các lịch stream trước, giúp người xem biết trước khi nào streamer sẽ live và có thể chuẩn bị tham gia.

## ✨ Tính năng chính

### 1. **Tạo lịch stream**
- Đặt tiêu đề và mô tả cho stream
- Chọn thể loại (Gaming, Music, Talk Show, etc.)
- Thiết lập thời gian bắt đầu
- Đặt thời lượng dự kiến (tùy chọn)
- Upload thumbnail tùy chỉnh

### 2. **Quản lý lịch stream**
- Xem danh sách tất cả lịch stream
- Chỉnh sửa thông tin lịch stream
- Hủy lịch stream
- Bắt đầu stream từ lịch đã tạo

### 3. **Hiển thị công khai**
- Người xem có thể xem lịch stream của tất cả streamer
- Lọc theo trạng thái (scheduled, live, completed, cancelled)
- Phân trang để tối ưu hiệu suất

### 4. **Tích hợp với hệ thống hiện có**
- Tự động chuyển đổi từ scheduled stream sang live stream
- Liên kết với hệ thống donation và chat
- Thông báo khi stream bắt đầu

## 🗄️ Database Schema

### ScheduledStream Model
```sql
- id: String (Primary Key)
- title: String
- description: String (Optional)
- category: String (Optional)
- thumbnail: String (Optional)
- scheduledAt: DateTime
- duration: Integer (Optional, in minutes)
- isNotified: Boolean (Default: false)
- status: String (scheduled, live, completed, cancelled)
- createdAt: DateTime
- updatedAt: DateTime
- streamerId: String (Foreign Key)
- streamId: String (Optional, Foreign Key)
```

## 🚀 API Endpoints

### Public Endpoints
- `GET /api/scheduled-streams` - Lấy danh sách scheduled streams
- `GET /api/scheduled-streams/:id` - Lấy thông tin scheduled stream cụ thể

### Protected Endpoints (Cần authentication)
- `POST /api/scheduled-streams` - Tạo scheduled stream mới
- `PUT /api/scheduled-streams/:id` - Cập nhật scheduled stream
- `DELETE /api/scheduled-streams/:id` - Xóa scheduled stream
- `GET /api/scheduled-streams/user/my-schedules` - Lấy scheduled streams của user
- `POST /api/scheduled-streams/:id/start` - Bắt đầu stream từ scheduled stream

## 🎨 Frontend Components

### 1. **ScheduledStreamCard**
- Hiển thị thông tin scheduled stream
- Hiển thị trạng thái và thời gian
- Nút action cho owner (Edit, Delete, Start)
- Responsive design

### 2. **ScheduleStreamForm**
- Form tạo/chỉnh sửa scheduled stream
- Validation thời gian và dữ liệu
- Preview thumbnail
- Modal popup

### 3. **ScheduledStreams Page**
- Danh sách tất cả scheduled streams
- Filter theo trạng thái
- Pagination
- Search và sort

### 4. **Home Page Integration**
- Section hiển thị scheduled streams sắp diễn ra
- Link đến trang quản lý đầy đủ

## 🔧 Cách sử dụng

### Cho Streamer:
1. Đăng nhập vào hệ thống
2. Vào trang "Lịch stream" hoặc "Dashboard"
3. Click "Lên lịch stream"
4. Điền thông tin và chọn thời gian
5. Lưu lịch stream
6. Khi đến giờ, click "Bắt đầu Stream"

### Cho Viewer:
1. Vào trang chủ để xem scheduled streams sắp diễn ra
2. Vào trang "Lịch stream" để xem tất cả
3. Click vào scheduled stream để xem chi tiết
4. Chờ đến giờ để tham gia stream

## 🎯 Lợi ích

### Cho Streamer:
- Tăng engagement với audience
- Lên kế hoạch content trước
- Tạo anticipation cho viewers
- Quản lý thời gian hiệu quả

### Cho Viewer:
- Biết trước khi nào streamer sẽ live
- Có thể lên kế hoạch tham gia
- Không bỏ lỡ stream yêu thích
- Tăng interaction với streamer

## 🔮 Tính năng tương lai

- **Notifications**: Thông báo push khi stream sắp bắt đầu
- **Recurring Schedules**: Lịch stream định kỳ
- **Stream Goals**: Mục tiêu donation cho scheduled stream
- **Calendar Integration**: Tích hợp với Google Calendar
- **Reminder System**: Nhắc nhở trước khi stream bắt đầu

## 🐛 Troubleshooting

### Lỗi thường gặp:
1. **"Scheduled time must be in the future"** - Thời gian lên lịch phải trong tương lai
2. **"Not authorized to update this stream"** - Chỉ owner mới có thể chỉnh sửa
3. **"Stream is not in scheduled status"** - Chỉ có thể bắt đầu stream đang ở trạng thái scheduled

### Giải pháp:
- Kiểm tra thời gian lên lịch
- Đảm bảo đang đăng nhập với tài khoản đúng
- Refresh trang và thử lại

## 📊 Performance

- Pagination để tối ưu loading time
- Lazy loading cho images
- Caching cho API responses
- Optimized database queries

## 🔒 Security

- JWT authentication cho protected endpoints
- Authorization checks cho CRUD operations
- Input validation và sanitization
- Rate limiting cho API calls

---

**Tính năng này đã được implement hoàn chỉnh và sẵn sàng sử dụng!** 🎉









