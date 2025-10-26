# Hướng dẫn Deploy MantleUR lên Render

## Tổng quan

Dự án MantleUR được deploy trên Render với 3 services:
- **Backend API**: Node.js + Express + Prisma + Socket.io
- **Frontend**: React Static Site
- **Database**: PostgreSQL

## Bước 1: Chuẩn bị Repository

1. Push code lên GitHub repository
2. Đảm bảo có file `render.yaml` trong thư mục `docs/`

## Bước 2: Deploy Database

1. Đăng nhập vào [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "PostgreSQL"
3. Cấu hình:
   - **Name**: `mantleur-db`
   - **Plan**: Free (Starter)
   - **Region**: Singapore (gần Việt Nam)
4. Click "Create Database"
5. Lưu lại **Connection String** để sử dụng sau

## Bước 3: Deploy Backend

1. Trong Render Dashboard, click "New +" → "Web Service"
2. Connect GitHub repository
3. Cấu hình:
   - **Name**: `mantleur-backend`
   - **Environment**: Node
   - **Build Command**: `cd backend && npm install && npx prisma generate`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free (Starter)

4. **Environment Variables**:
   ```
   NODE_ENV=production
   DATABASE_URL=<connection-string-từ-bước-2>
   JWT_SECRET=<tạo-random-string-dài>
   CORS_ORIGIN=https://mantleur-frontend.onrender.com
   ```

5. Click "Create Web Service"

## Bước 4: Deploy Frontend

1. Trong Render Dashboard, click "New +" → "Static Site"
2. Connect GitHub repository
3. Cấu hình:
   - **Name**: `mantleur-frontend`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`
   - **Plan**: Free

4. **Environment Variables**:
   ```
   VITE_API_URL=https://mantleur-backend.onrender.com
   ```

5. Click "Create Static Site"

## Bước 5: Setup Database

1. Sau khi backend deploy xong, vào **Shell** của backend service
2. Chạy lệnh:
   ```bash
   cd backend
   npx prisma db push
   ```
3. Kiểm tra database đã tạo tables chưa

## Bước 6: Kiểm tra Deployment

1. **Backend**: `https://mantleur-backend.onrender.com/api/health`
2. **Frontend**: `https://mantleur-frontend.onrender.com`
3. **Database**: Kiểm tra trong Render Dashboard

## Troubleshooting

### Backend không start được
- Kiểm tra logs trong Render Dashboard
- Đảm bảo `DATABASE_URL` đúng format
- Kiểm tra `JWT_SECRET` đã set

### Frontend không connect được Backend
- Kiểm tra `VITE_API_URL` trong frontend
- Đảm bảo CORS_ORIGIN trong backend đúng
- Kiểm tra backend có chạy không

### Database connection failed
- Kiểm tra `DATABASE_URL` format
- Đảm bảo database đã được tạo
- Chạy `npx prisma db push` để tạo tables

## Monitoring

1. **Logs**: Xem trong Render Dashboard → Service → Logs
2. **Metrics**: CPU, Memory usage
3. **Health Checks**: Automatic health checks

## Scaling

- **Free Plan**: 750 hours/month, sleep after 15min inactive
- **Paid Plans**: Always on, more resources
- **Database**: Upgrade plan để có more storage

## Custom Domain (Optional)

1. Mua domain từ provider
2. Trong Render Dashboard → Service → Settings → Custom Domains
3. Add domain và follow DNS instructions
4. Update CORS_ORIGIN trong backend

## Backup

- **Database**: Render tự động backup
- **Code**: Lưu trong GitHub
- **Environment Variables**: Lưu backup local

## Cost

- **Free Plan**: $0/month (có giới hạn)
- **Starter Plan**: $7/month per service
- **Database**: Free 1GB, $7/month cho 1GB thêm

## Security

- JWT_SECRET phải random và dài
- CORS_ORIGIN chỉ allow frontend domain
- Database connection string bảo mật
- HTTPS tự động enable trên Render




















