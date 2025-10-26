# 🔐 Dữ liệu đăng nhập MantleUR

## ✅ Database đã được seed với dữ liệu mẫu!

### 📋 Thông tin đăng nhập:

| Username | Email | Password | Coin Balance |
|----------|-------|----------|-------------|
| **admin** | admin@mantleur.com | 123456 | 5000 coin |
| **streamer1** | streamer1@mantleur.com | 123456 | 2000 coin |
| **viewer1** | viewer1@mantleur.com | 123456 | 1500 coin |
| **testuser** | test@mantleur.com | 123456 | 1000 coin |

## 🎯 Test Accounts:

### 1. **admin** (Admin Account)
- **Email**: admin@mantleur.com
- **Password**: 123456
- **Coin**: 5000
- **Role**: Admin với quyền cao nhất

### 2. **streamer1** (Streamer Account)
- **Email**: streamer1@mantleur.com
- **Password**: 123456
- **Coin**: 2000
- **Role**: Streamer có thể tạo và quản lý streams

### 3. **viewer1** (Viewer Account)
- **Email**: viewer1@mantleur.com
- **Password**: 123456
- **Coin**: 1500
- **Role**: Viewer có thể xem streams và donate

### 4. **testuser** (Test Account)
- **Email**: test@mantleur.com
- **Password**: 123456
- **Coin**: 1000
- **Role**: User thường để test

## 🎮 Streams có sẵn:

1. **Gaming Stream - PUBG Mobile** (streamer1)
   - Category: Gaming
   - Status: LIVE
   - Viewers: 150

2. **Music Stream - Piano Cover** (admin)
   - Category: Music
   - Status: LIVE
   - Viewers: 89

3. **Talk Show - Chia sẻ kinh nghiệm** (streamer1)
   - Category: Education
   - Status: Offline

4. **Cooking Stream - Nấu ăn cùng nhau** (admin)
   - Category: Entertainment
   - Status: LIVE
   - Viewers: 67

## 🧪 Test Flow:

### 1. Đăng nhập với admin
- Vào http://localhost:5173/login
- Email: admin@mantleur.com
- Password: 123456
- Kiểm tra coin balance: 5000

### 2. Đăng nhập với streamer1
- Email: streamer1@mantleur.com
- Password: 123456
- Vào Dashboard để tạo stream
- Kiểm tra coin balance: 2000

### 3. Đăng nhập với viewer1
- Email: viewer1@mantleur.com
- Password: 123456
- Xem streams và test donate
- Kiểm tra coin balance: 1500

## 💰 Donation History:

- **viewer1** đã donate 100 coin cho "Gaming Stream"
- **testuser** đã donate 50 coin cho "Music Stream"
- **viewer1** đã donate 200 coin cho "Music Stream"

## 🔧 Test Features:

### Authentication:
- ✅ Login với email/password
- ✅ JWT token được lưu trong localStorage
- ✅ Auto-logout khi token hết hạn

### Stream Management:
- ✅ Tạo stream mới
- ✅ Cập nhật stream info
- ✅ Xóa stream
- ✅ Start/Stop stream

### Donation System:
- ✅ Donate coin cho streamer
- ✅ Lịch sử donations
- ✅ Coin balance update

### Real-time Features:
- ✅ Socket.io connection
- ✅ Chat realtime
- ✅ WebRTC signaling

## 🚀 Quick Start:

1. **Mở**: http://localhost:5173
2. **Click**: "Đăng nhập"
3. **Nhập**: admin@mantleur.com / 123456
4. **Explore**: Dashboard, Profile, Streams

## 🎉 Enjoy Testing!

Bây giờ bạn có thể test đầy đủ tất cả features của MantleUR với dữ liệu thực!




















