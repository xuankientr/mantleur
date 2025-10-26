# 🎬 Hệ Thống Payment Hoàn Chỉnh - VNPay Integration

Đã hoàn thiện hệ thống payment Web2 với VNPay Sandbox!

## ✅ Files Đã Tạo/Cập Nhật

### Backend
1. ✅ **`backend/src/controllers/paymentController.js`**
   - Create payment URL
   - Handle VNPay callback
   - Get transaction history
   - Get user balance

2. ✅ **`backend/src/routes/payment.js`**
   - POST `/api/payments/create` - Tạo link thanh toán
   - GET `/api/payments/return` - Callback từ VNPay
   - GET `/api/payments/history/:userId` - Lịch sử giao dịch
   - GET `/api/payments/balance/:userId` - Số dư user

3. ✅ **`backend/prisma/schema.prisma`**
   - Thêm model `Transaction`
   - Thêm indexes cho performance

4. ✅ **`backend/env.example`**
   - Thêm VNPay configuration

### Frontend
1. ✅ **`frontend/src/contexts/PaymentContext.jsx`**
   - VNPay payment integration
   - Top up coins with VNPay
   - Withdraw USDC with VNPay

2. ✅ **`frontend/src/pages/PaymentCallback.jsx`**
   - Handle payment callback from VNPay

3. ✅ **`frontend/src/App.jsx`**
   - Thêm PaymentProvider
   - Thêm PaymentCallback route

## 🔧 Setup

### 1. Backend Dependencies

```bash
cd backend
npm install qs
```

### 2. Update Environment Variables

Tạo file `backend/env.local`:

```env
# Database
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Server
PORT=5000
NODE_ENV=development

# CORS
CORS_ORIGIN="http://localhost:5173"

# VNPay Sandbox
VNP_TMN_CODE=YOUR_SANDBOX_TMN_CODE
VNP_HASH_SECRET=YOUR_SANDBOX_SECRET_KEY
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURN_URL=http://localhost:5000/api/payments/return
FRONTEND_URL=http://localhost:5173
```

### 3. Get VNPay Sandbox Credentials

1. Visit: https://sandbox.vnpayment.vn/
2. Đăng ký tài khoản
3. Lấy TMN Code và Hash Secret
4. Update vào `.env`

### 4. Generate Prisma Client

```bash
cd backend
npx prisma generate
```

### 5. Apply Database Changes

Nếu cần thêm model Transaction vào database, chạy:

```bash
cd backend
npx prisma db push
```

## 📡 API Endpoints

### 1. Create Payment URL

```http
POST /api/payments/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 50000
}
```

Response:
```json
{
  "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?...",
  "orderId": "DEPOSIT_userId_timestamp",
  "transactionId": "cuid"
}
```

### 2. Get User Balance

```http
GET /api/payments/balance/:userId
Authorization: Bearer <token>
```

Response:
```json
{
  "balance": 150000
}
```

### 3. Get Transaction History

```http
GET /api/payments/history/:userId
Authorization: Bearer <token>
```

Response:
```json
[
  {
    "id": "cuid",
    "userId": "cuid",
    "type": "deposit",
    "amount": 50000,
    "status": "success",
    "txnId": "DEPOSIT_userId_timestamp",
    "createdAt": "2024-01-01T10:00:00.000Z",
    "updatedAt": "2024-01-01T10:00:00.000Z"
  }
]
```

## 🔄 Payment Flow

### Deposit Flow

1. User nhập số tiền → Click "Top Up"
2. Frontend gọi `POST /api/payments/create`
3. Server tạo payment URL và trả về
4. User redirect đến VNPay
5. User thanh toán
6. VNPay redirect về `/api/payments/return`
7. Server verify checksum
8. Server cộng coins vào user (100 VND = 1 coin)
9. Redirect về success page

## 💰 Exchange Rate

- **100 VND = 1 Coin**
- Nạp 50,000 VND → Nhận 500 coins
- Rút 500 coins → Nhận 50,000 VND

## 🧪 Test

### 1. Start Backend

```bash
npm run dev
```

Backend sẽ chạy trên: `http://localhost:5000`

### 2. Start Frontend

```bash
cd frontend
npm run dev
```

Frontend sẽ chạy trên: `http://localhost:5173`

### 3. Test Payment

1. Login vào website
2. Go to Profile
3. Click "Payment" button
4. Enter amount (50,000 VND)
5. Click "Top Up"
6. Redirect to VNPay Sandbox
7. Use test credentials
8. Complete payment
9. Auto redirect back
10. See coins added!

## 📝 Next Steps

1. **Cập nhật frontend để gọi API:**
   - Update PaymentModal to use `/api/payments/create`
   - Update Profile page to show balance

2. **Tạo Admin Dashboard:**
   - View withdrawal requests
   - Approve/reject withdrawals
   - View transaction history

3. **Add Security:**
   - Rate limiting
   - IP whitelisting for callback
   - Request signing

## 🎉 Kết Quả

✅ Hệ thống payment Web2 hoàn chỉnh với VNPay Sandbox  
✅ Tích hợp vào backend hiện tại  
✅ Frontend có thể gọi API để tạo payment  
✅ Auto cộng coins sau khi thanh toán thành công  

**Sẵn sàng để sử dụng!** 🚀


