# MantleUR - Livestream Platform

Một nền tảng livestream giống NimoTV được xây dựng với React, Node.js và WebRTC.

## 🚀 Features

- ✅ **User Authentication** - JWT-based auth system
- ✅ **Livestream** - WebRTC peer-to-peer streaming
- ✅ **Real-time Chat** - Socket.io chat system
- ✅ **Donate System** - Coin-based donation system
- ✅ **User Profiles** - Profile management
- ✅ **Streamer Dashboard** - Stream management
- ✅ **Responsive Design** - Mobile-friendly UI

## 🛠 Tech Stack

- **Frontend**: React (Vite) + TailwindCSS + Socket.io + PeerJS
- **Backend**: Node.js (Express) + Prisma (PostgreSQL) + Socket.io
- **Media**: WebRTC livestream (PeerJS)
- **Auth**: JWT
- **Database**: PostgreSQL
- **Deploy**: Render

## 📁 Cấu trúc dự án

```
mantleur/
├── frontend/          # React app
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom hooks
│   │   └── utils/         # Utility functions
├── backend/           # Express + Prisma + Socket.io
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Express middleware
│   │   ├── models/        # Database models
│   │   └── routes/        # API routes
│   └── prisma/           # Database schema
├── docs/             # Documentation
└── package.json      # Root package.json
```

## 🚀 Quick Start

### 1. Clone và cài đặt dependencies

```bash
git clone <repo-url>
cd mantleur
npm run install:all
```

### 2. Setup Database

```bash
cd backend
npx prisma generate
npx prisma db push
```

### 3. Setup Environment Variables

**Backend** (`backend/.env`):
```env
DATABASE_URL="postgresql://username:password@localhost:5432/mantleur"
JWT_SECRET="your-super-secret-jwt-key"
PORT=5000
CORS_ORIGIN="http://localhost:5173"
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000
```

### 4. Chạy development

```bash
# Chạy cả frontend và backend
npm run dev

# Hoặc chạy riêng lẻ
npm run dev:frontend  # Frontend trên http://localhost:5173
npm run dev:backend   # Backend trên http://localhost:5000
```

## 🌐 Deployment trên Render

Xem hướng dẫn chi tiết trong [docs/deployment-guide.md](docs/deployment-guide.md)

### Tóm tắt:
1. **Database**: Tạo PostgreSQL trên Render
2. **Backend**: Deploy với `render.yaml`
3. **Frontend**: Deploy như Static Site
4. **Setup**: Chạy database migrations

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - Đăng ký user
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/profile` - Lấy profile hiện tại

### User Management
- `PUT /api/user/profile` - Cập nhật profile
- `GET /api/user/:userId` - Lấy thông tin user
- `GET /api/user/:userId/streams` - Lấy streams của user
- `POST /api/user/add-coins` - Nạp coin

### Stream Management
- `GET /api/streams` - Lấy danh sách streams
- `GET /api/streams/:id` - Lấy thông tin stream
- `POST /api/streams` - Tạo stream mới
- `PUT /api/streams/:id` - Cập nhật stream
- `DELETE /api/streams/:id` - Xóa stream
- `GET /api/streams/user/streams` - Lấy streams của user

### Donation System
- `POST /api/donations` - Tạo donation
- `GET /api/donations/my-donations` - Lấy donations đã gửi
- `GET /api/donations/received` - Lấy donations nhận được
- `GET /api/donations/stream/:streamId` - Lấy donations của stream

## 🗄 Database Schema

### User Table
```sql
- id: String (Primary Key)
- username: String (Unique)
- email: String (Unique)
- password: String (Hashed)
- avatar: String (Optional)
- coinBalance: Integer (Default: 1000)
- createdAt: DateTime
- updatedAt: DateTime
```

### Stream Table
```sql
- id: String (Primary Key)
- title: String
- description: String (Optional)
- category: String (Optional)
- isLive: Boolean (Default: false)
- viewerCount: Integer (Default: 0)
- thumbnail: String (Optional)
- streamKey: String (Unique)
- streamerId: String (Foreign Key)
- createdAt: DateTime
- updatedAt: DateTime
```

### Donation Table
```sql
- id: String (Primary Key)
- amount: Integer
- message: String (Optional)
- donorId: String (Foreign Key)
- streamId: String (Foreign Key)
- streamerId: String (Foreign Key)
- createdAt: DateTime
```

## 🔧 Socket.io Events

### Client → Server
- `join-stream` - Tham gia stream room
- `leave-stream` - Rời stream room
- `chat-message` - Gửi tin nhắn chat
- `webrtc-offer` - WebRTC offer
- `webrtc-answer` - WebRTC answer
- `webrtc-ice-candidate` - ICE candidate
- `update-viewer-count` - Cập nhật số viewers

### Server → Client
- `chat-message` - Nhận tin nhắn chat
- `webrtc-offer` - Nhận WebRTC offer
- `webrtc-answer` - Nhận WebRTC answer
- `webrtc-ice-candidate` - Nhận ICE candidate
- `viewer-count-update` - Cập nhật số viewers

## 🎯 WebRTC Implementation

- **Signaling**: Socket.io server làm signaling server
- **PeerJS**: Client-side WebRTC library
- **Fallback**: ICE servers cho connection issues
- **Streaming**: Camera + microphone capture

## 🎨 UI Components

- **Layout**: Responsive navigation với user menu
- **StreamCard**: Card hiển thị stream info
- **Chat**: Real-time chat component
- **Dashboard**: Stream management interface
- **Profile**: User profile management

## 🔒 Security

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcryptjs với salt rounds
- **CORS Protection**: Configured origins only
- **Input Validation**: Server-side validation
- **SQL Injection**: Prisma ORM protection

## 📱 Responsive Design

- **Mobile First**: Optimized cho mobile devices
- **TailwindCSS**: Utility-first CSS framework
- **Breakpoints**: sm, md, lg, xl responsive design
- **Touch Friendly**: Mobile-optimized interactions

## 🚀 Performance

- **Code Splitting**: React lazy loading
- **Image Optimization**: Optimized thumbnails
- **Caching**: API response caching
- **WebRTC**: Low-latency streaming
- **Socket.io**: Efficient real-time communication

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Kiểm tra DATABASE_URL
   npx prisma db push
   ```

2. **WebRTC Connection Failed**
   - Kiểm tra camera/microphone permissions
   - Thử refresh browser
   - Kiểm tra firewall settings

3. **Socket.io Connection Failed**
   - Kiểm tra CORS_ORIGIN setting
   - Kiểm tra backend đang chạy
   - Kiểm tra network connection

## 📄 License

MIT License - Xem file LICENSE để biết thêm chi tiết.

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## 📞 Support

- **Issues**: GitHub Issues
- **Documentation**: docs/ folder
- **Email**: support@mantleur.com
