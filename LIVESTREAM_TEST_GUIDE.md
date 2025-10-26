# 🎥 Hướng dẫn Test Livestream MantleUR

## ✅ Các lỗi đã fix:

### 1. **Lỗi JSON Parsing trong Registration**
- **Vấn đề**: Frontend gửi 3 tham số riêng biệt thay vì object
- **Fix**: Cập nhật Register.jsx để gửi object đúng format
- **Status**: ✅ Đã fix

### 2. **WebRTC PeerJS Connection**
- **Vấn đề**: PeerJS cố kết nối với localhost:9000 (không có server)
- **Fix**: Chuyển sang sử dụng PeerJS cloud miễn phí
- **Status**: ✅ Đã fix

### 3. **Video Preview trong Dashboard**
- **Vấn đề**: Không có video element để hiển thị stream
- **Fix**: Thêm video preview component
- **Status**: ✅ Đã fix

## 🧪 Test Livestream:

### **Bước 1: Đăng nhập**
1. Mở http://localhost:5173
2. Click "Đăng nhập"
3. Sử dụng test account:
   - **Email**: admin@mantleur.com
   - **Password**: 123456

### **Bước 2: Tạo Stream**
1. Vào Dashboard (sau khi đăng nhập)
2. Click "Tạo Stream"
3. Nhập thông tin:
   - **Tiêu đề**: "Test Stream"
   - **Mô tả**: "Stream test đầu tiên"
   - **Danh mục**: "Gaming"
4. Click "Tạo Stream"

### **Bước 3: Bắt đầu Livestream**
1. Trong danh sách streams, click "Bắt đầu" trên stream vừa tạo
2. **Cho phép camera/microphone** khi browser hỏi
3. Kiểm tra video preview xuất hiện
4. Stream status sẽ chuyển thành "LIVE"

### **Bước 4: Test từ Browser khác**
1. Mở tab mới hoặc browser khác
2. Vào http://localhost:5173
3. Đăng nhập với account khác (ví dụ: viewer1@mantleur.com)
4. Vào trang chủ và click vào stream đang live
5. Kiểm tra có thể xem stream không

## 🔧 Troubleshooting:

### **Nếu không thấy video preview:**
1. Kiểm tra browser console (F12) có lỗi không
2. Đảm bảo đã cho phép camera/microphone
3. Thử refresh trang và bắt đầu lại

### **Nếu PeerJS connection failed:**
1. Kiểm tra internet connection
2. Thử refresh trang
3. Kiểm tra console có lỗi PeerJS không

### **Nếu không thể xem stream từ browser khác:**
1. Đảm bảo stream đang ở trạng thái LIVE
2. Kiểm tra WebRTC connection
3. Thử với browser khác (Chrome, Firefox)

## 🎯 Expected Results:

### **Streamer (Dashboard):**
- ✅ Video preview hiển thị camera
- ✅ Stream status = "LIVE"
- ✅ Có thể dừng stream

### **Viewer (Home page):**
- ✅ Thấy stream trong danh sách với badge "LIVE"
- ✅ Click vào stream có thể xem video
- ✅ Chat realtime hoạt động

## 🚀 Advanced Testing:

### **Test Multiple Viewers:**
1. Mở nhiều browser/tab
2. Đăng nhập với accounts khác nhau
3. Tất cả cùng xem 1 stream
4. Kiểm tra chat realtime

### **Test Donation:**
1. Trong khi xem stream
2. Click donate button
3. Nhập số coin và message
4. Kiểm tra coin balance update

### **Test Mobile:**
1. Mở http://localhost:5173 trên mobile
2. Test responsive design
3. Test camera permission trên mobile

## 📱 Mobile Testing:

### **iOS Safari:**
- Cần HTTPS để access camera
- Test trên localhost có thể không hoạt động

### **Android Chrome:**
- Hoạt động tốt trên localhost
- Test camera permission

## 🎉 Success Criteria:

- ✅ **Registration**: Không còn lỗi JSON parsing
- ✅ **WebRTC**: PeerJS kết nối thành công
- ✅ **Stream Creation**: Tạo stream thành công
- ✅ **Live Streaming**: Video preview hoạt động
- ✅ **Multi-viewer**: Nhiều người có thể xem cùng lúc
- ✅ **Real-time Chat**: Chat hoạt động trong stream
- ✅ **Donation**: Donate coin hoạt động

## 🔍 Debug Information:

### **Browser Console Commands:**
```javascript
// Kiểm tra PeerJS connection
console.log('Peer:', window.peer);

// Kiểm tra media stream
console.log('Stream:', window.localStream);

// Kiểm tra WebRTC stats
navigator.mediaDevices.getUserMedia({video: true, audio: true})
  .then(stream => console.log('Media OK:', stream))
  .catch(err => console.error('Media Error:', err));
```

### **Network Tab:**
- Kiểm tra WebSocket connections
- Kiểm tra PeerJS signaling
- Kiểm tra API calls

---

**🎥 Nếu tất cả test cases pass, livestream đã hoạt động hoàn hảo!**








































