# HOW TO UPDATE RENDER ENVIRONMENT VARIABLES

## 🎯 Chỉ cần cập nhật 2 biến này trên Render:

### 1. DATABASE_URL

**Connection string mới từ Supabase Dashboard:**

Cách lấy:
1. Vào https://supabase.com/dashboard
2. Chọn project của bạn
3. Settings → Database
4. Copy "Connection Pooling" connection string
5. Sẽ có dạng: `postgresql://postgres.xgbylmnkwqzsacszkpkt:[PASSWORD]@aws-1-us-east-1.pooler.supabase.com:6543/postgres`

**HOẶC dùng Non-pooling URL:**
```env
postgresql://postgres.xgbylmnkwqzsacszkpkt:KP7FsNR2FO5XAyPQ@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require
```

**Lưu ý:** Port `6543` là pooling, port `5432` là direct connection

### 2. JWT_SECRET  
```env
your-super-secret-jwt-key-change-this-in-production
```

---

## 📱 Cách update trên Render Dashboard:

### Bước 1: Mở Render Dashboard
1. Truy cập: https://dashboard.render.com
2. Login vào tài khoản

### Bước 2: Vào Web Service
1. Tìm service backend của bạn (ví dụ: "mantleur")
2. Click vào service đó

### Bước 3: Vào Environment Tab
1. Click tab "Environment" ở sidebar bên trái
2. Sẽ thấy danh sách environment variables

### Bước 4: Update DATABASE_URL
1. Tìm biến `DATABASE_URL` (nếu không có thì click "Add Environment Variable")
2. Click "Edit" hoặc "Add"
3. **Key:** `DATABASE_URL`
4. **Value:** Paste connection string ở trên
5. Click "Save Changes"

### Bước 5: Update JWT_SECRET
1. Tìm biến `JWT_SECRET` (nếu không có thì thêm mới)
2. **Key:** `JWT_SECRET`
3. **Value:** `your-super-secret-jwt-key-change-this-in-production`
4. Click "Save Changes"

### Bước 6: Manual Deploy
1. Click tab "Manual Deploy"
2. Click "Deploy latest commit"
3. Đợi 2-3 phút để deploy xong

---

## ⚠️ Lưu ý:

### Không cần Supabase SDK ở Backend!
Backend hiện tại đang dùng **Prisma** với Supabase PostgreSQL. Đây là setup tốt nhất vì:
- ✅ Type-safe database operations
- ✅ Better control over queries
- ✅ Direct PostgreSQL connection
- ✅ Stable connection với retry logic

### Supabase SDK chỉ dùng ở Frontend!
Frontend đã có Supabase SDK setup sẵn trong:
- `frontend/src/utils/supabase.js`
- `frontend/src/utils/supabaseClient.js`

---

## 🧪 Test sau khi deploy:

```bash
# Check backend health
curl https://mantleur.onrender.com/api/health

# Test login
curl -X POST https://mantleur.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

---

## ✅ Summary

**Backend (Render):**
- ✅ Dùng Prisma + Supabase PostgreSQL
- ✅ Cần update: DATABASE_URL
- ✅ Giữ nguyên: JWT_SECRET

**Frontend (Vercel):**
- ✅ Dùng Supabase SDK (optional)
- ✅ Environment variables đã setup
- ✅ Tự động deploy khi push code

**Current Status:**
- ✅ Code đã push lên GitHub
- ✅ Render tự động deploy backend
- ✅ Vercel tự động deploy frontend
- ⏳ Chờ bạn update DATABASE_URL trên Render

