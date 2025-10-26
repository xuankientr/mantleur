# 🧪 Hướng dẫn Test MantleUR

## ✅ Đã Fix Routing Issue

**Vấn đề**: Layout component không hiển thị nội dung con
**Fix**: Thay `{children}` bằng `<Outlet />` trong Layout component

## 🌐 Truy cập Website:

**Mở trình duyệt và truy cập: http://localhost:5173**

## 🧪 Test các tính năng:

### 1. ✅ Trang chủ (Home)
- **URL**: http://localhost:5173
- **Kiểm tra**: 
  - Header với logo MantleUR
  - Hero section với tiêu đề
  - Test content với 3 cards
  - Buttons Đăng nhập/Đăng ký

### 2. ✅ Đăng ký (Register)
- **URL**: http://localhost:5173/register
- **Kiểm tra**:
  - Form đăng ký với username, email, password
  - Validation
  - Submit button

### 3. ✅ Đăng nhập (Login)
- **URL**: http://localhost:5173/login
- **Kiểm tra**:
  - Form đăng nhập với email, password
  - Submit button

### 4. ✅ Dashboard (sau khi đăng nhập)
- **URL**: http://localhost:5173/dashboard
- **Kiểm tra**:
  - Stream management interface
  - Create stream form

### 5. ✅ Profile (sau khi đăng nhập)
- **URL**: http://localhost:5173/profile
- **Kiểm tra**:
  - User profile information
  - Edit profile form

## 🔧 API Test:

### Backend API
- **Health Check**: http://localhost:5000/api/health
- **Expected**: `{"status":"OK","timestamp":"..."}`

### Test API với curl:
```bash
# Health check
curl http://localhost:5000/api/health

# Get streams
curl http://localhost:5000/api/streams
```

## 🐛 Troubleshooting:

### Nếu vẫn chỉ thấy header:

1. **Refresh browser** (Ctrl+F5)
2. **Clear cache** browser
3. **Kiểm tra console** (F12) để xem lỗi JavaScript
4. **Kiểm tra Network tab** để xem API calls

### Nếu có lỗi JavaScript:

1. Mở Developer Tools (F12)
2. Vào tab Console
3. Xem lỗi và báo cáo

### Nếu API không hoạt động:

1. Kiểm tra backend đang chạy: http://localhost:5000/api/health
2. Kiểm tra CORS settings
3. Kiểm tra environment variables

## 📱 Test trên Mobile:

1. Mở http://localhost:5173 trên mobile
2. Test responsive design
3. Test touch interactions

## 🎯 Expected Results:

### Trang chủ:
- ✅ Header với logo và navigation
- ✅ Hero section với tiêu đề MantleUR
- ✅ Test content với 3 feature cards
- ✅ Buttons Đăng nhập/Đăng ký

### Sau khi đăng nhập:
- ✅ User menu với avatar và coin balance
- ✅ Navigation đến Dashboard và Profile
- ✅ Logout functionality

## 🚀 Next Steps:

1. **Test đầy đủ** tất cả pages
2. **Test authentication** flow
3. **Test responsive** design
4. **Deploy** lên Render

---

**🎉 Nếu bạn thấy nội dung chính (không chỉ header), có nghĩa là đã fix thành công!**




















