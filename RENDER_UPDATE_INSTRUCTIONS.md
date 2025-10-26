# 🚀 Render Environment Variables Update

## Cập nhật DATABASE_URL trên Render:

1. Vào Render Dashboard: https://dashboard.render.com
2. Chọn service **mantleur** (backend)
3. Vào **Environment** tab
4. Cập nhật `DATABASE_URL` với:

```
DATABASE_URL=postgres://postgres.xgbylmnkwqzsacszkpkt:KP7FsNR2FO5XAyPQ@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require
```

5. Click "Save Changes"
6. Manual deploy backend

## Test Production:

1. Truy cập: https://mantleur-frontend.vercel.app/login
2. Đăng nhập với:
   - Email: `admin@example.com`
   - Password: `admin123`
3. Kiểm tra redirect đến `/admin/withdrawals`

## Kết quả:
- ✅ Local: Supabase PostgreSQL
- ✅ Production: Supabase PostgreSQL  
- ✅ Database đồng bộ hoàn toàn
- ✅ Admin login hoạt động
- ✅ Auto redirect admin
