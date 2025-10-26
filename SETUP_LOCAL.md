# Hướng dẫn chạy MantleUR Local

## Bước 1: Setup Environment Variables

### Backend (.env)
Tạo file `backend/.env` với nội dung:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/mantleur"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=5000
NODE_ENV=development
CORS_ORIGIN="http://localhost:5173"
```

### Frontend (.env)
Tạo file `frontend/.env` với nội dung:
```env
VITE_API_URL=http://localhost:5000
```

## Bước 2: Setup Database

### Option 1: Sử dụng PostgreSQL Local
1. Cài đặt PostgreSQL
2. Tạo database `mantleur`
3. Cập nhật `DATABASE_URL` trong `backend/.env`

### Option 2: Sử dụng SQLite (Dễ hơn)
Thay đổi `DATABASE_URL` trong `backend/.env`:
```env
DATABASE_URL="file:./dev.db"
```

## Bước 3: Chạy Database Migration

```bash
cd backend
npx prisma generate
npx prisma db push
```

## Bước 4: Chạy Application

### Cách 1: Chạy cả 2 cùng lúc
```bash
# Từ thư mục root
npm run dev
```

### Cách 2: Chạy riêng lẻ

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## Bước 5: Truy cập

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Health**: http://localhost:5000/api/health

## Troubleshooting

### Database Connection Error
- Kiểm tra PostgreSQL đang chạy
- Kiểm tra `DATABASE_URL` đúng format
- Thử dùng SQLite thay vì PostgreSQL

### Port Already in Use
- Thay đổi PORT trong `backend/.env`
- Thay đổi port frontend trong `frontend/vite.config.js`

### CORS Error
- Kiểm tra `CORS_ORIGIN` trong backend
- Đảm bảo frontend chạy trên port 5173

## Test Features

1. **Đăng ký/Đăng nhập**: Tạo tài khoản mới
2. **Tạo Stream**: Vào Dashboard → Tạo Stream
3. **Livestream**: Bắt đầu stream và test WebRTC
4. **Chat**: Test real-time chat
5. **Donate**: Test donation system




















