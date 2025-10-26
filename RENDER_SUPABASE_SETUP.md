# 🚀 Render + Supabase Setup Guide

## 📋 **Tổng quan**
- **Local**: Sử dụng Supabase PostgreSQL
- **Production (Render)**: Sử dụng Supabase PostgreSQL  
- **Database**: Đồng bộ hoàn toàn giữa local và production

## 🔧 **Setup Steps**

### **1. Tạo Supabase Project**
1. Vào https://supabase.com
2. Click "New Project"
3. Đặt tên: `mantleur-db`
4. Đặt password mạnh (ghi nhớ!)
5. Chọn region: **Singapore** hoặc **Tokyo**
6. Click "Create new project"

### **2. Lấy Connection String**
1. Vào project → **Settings** → **Database**
2. Copy **URI** connection string:
```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

### **3. Setup Local**
1. Cập nhật `backend/.env`:
```
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

2. Chạy commands:
```bash
cd backend
npx prisma generate
node setup-supabase.js
```

### **4. Setup Render Production**
1. Vào Render Dashboard: https://dashboard.render.com
2. Chọn service **mantleur** (backend)
3. Vào **Environment** tab
4. Cập nhật `DATABASE_URL` với Supabase connection string
5. Click "Save Changes"
6. Manual deploy backend

### **5. Test Production**
1. Truy cập: https://mantleur-frontend.vercel.app/login
2. Đăng nhập với:
   - Email: `admin@example.com`
   - Password: `admin123`
3. Kiểm tra redirect đến `/admin/withdrawals`

## 🎯 **Kết quả mong đợi**
- ✅ Local và Production sử dụng cùng database
- ✅ Admin login hoạt động trên cả local và production
- ✅ Auto redirect admin đến `/admin/withdrawals`
- ✅ Database đồng bộ hoàn toàn

## 🔍 **Troubleshooting**

### **Lỗi kết nối database**
- Kiểm tra Supabase project có đang chạy không
- Kiểm tra connection string có đúng không
- Kiểm tra password có đúng không

### **Admin login không hoạt động**
- Kiểm tra admin users đã được tạo trong Supabase chưa
- Kiểm tra Render có sử dụng đúng DATABASE_URL không
- Kiểm tra backend có deploy thành công không

### **Redirect không hoạt động**
- Kiểm tra Login.jsx có logic admin check không
- Kiểm tra AdminWithdrawals.jsx có admin check không
