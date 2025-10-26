# FIX SUPABASE CONNECTION ERROR

## ❌ Lỗi hiện tại:
```
Can't reach database server at `aws-1-us-east-1.pooler.supabase.com:5432`
```

## ⚠️ VẤN ĐỀ PHÁT HIỆN:

Trên Render bạn có:
```
DATABASE_URL="postgresql://..."
```

**Dấu ngoặc kép** làm Prisma không kết nối được!

### 🔧 Fix:

**Không có dấu ngoặc kép:**
```
postgresql://postgres.xgbylmnkwqzsacszkpkt:KP7FsNR2FO5XAyPQ@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require
```

## 🔧 Cách fix:

### Option 1: Update trên Render Dashboard

**Bước 1:** Vào Supabase Dashboard
1. https://supabase.com/dashboard
2. Login vào tài khoản
3. Chọn project: `xgbylmnkwqzsacszkpkt`

**Bước 2:** Lấy Connection String
1. Click vào "Settings" (sidebar)
2. Click "Database"
3. Scroll xuống phần "Connection Pooling"
4. Copy connection string (NOT the Session Mode URL)

**Format đúng:**
```
postgresql://postgres.xgbylmnkwqzsacszkpkt:[PASSWORD]@aws-1-us-east-1.pooler.supabase.com:6543/postgres
```

**HOẶC dùng Direct Connection (không pooling):**
```
postgresql://postgres.xgbylmnkwqzsacszkpkt:[PASSWORD]@aws-1-us-east-1.pooler.supabase.com:5432/postgres
```

### Option 2: Dùng Connection String mà user cung cấp

User đã cung cấp connection string:
```
POSTGRES_URL_NON_POOLING="postgres://postgres.xgbylmnkwqzsacszkpkt:KP7FsNR2FO5XAyPQ@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"
```

**Sửa lại để dùng cho Prisma:**
```
postgresql://postgres.xgbylmnkwqzsacszkpkt:KP7FsNR2FO5XAyPQ@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require
```

### Option 3: Check Supabase Status

Có thể Supabase database đang có vấn đề:
1. Vào https://supabase.com/dashboard
2. Check project status
3. Nếu có warning → Fix issue
4. Nếu OK → Connection string sai

## 📝 Update trên Render

**Key:** `DATABASE_URL`
**Value:** (Paste connection string ở trên)

**Sau đó:**
1. Save Changes
2. Manual Deploy
3. Check logs xem đã connect chưa

## ✅ Expected Result

Sau khi update, logs sẽ hiển thị:
```
✅ Database connected successfully
Server running on port 5000
```

## 🧪 Test Connection

```bash
# Test từ terminal
psql "postgresql://postgres.xgbylmnkwqzsacszkpkt:KP7FsNR2FO5XAyPQ@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"

# Hoặc test từ Render
curl https://mantleur.onrender.com
```

