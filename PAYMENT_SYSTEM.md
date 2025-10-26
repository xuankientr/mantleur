# 💰 Hệ thống Thanh toán MantleUR

## 📋 Tổng quan

Hệ thống thanh toán cho phép user nạp tiền VNĐ và rút tiền từ coin, tích hợp với các payment gateway phổ biến tại Việt Nam.

## 🏗️ Kiến trúc

### Backend Models

#### Payment Model
```prisma
model Payment {
  id            String   @id @default(cuid())
  amount        Int      // Số VNĐ nạp vào
  coinAmount    Int      // Số coin nhận được (1 VNĐ = 1 coin)
  method        String   // "momo", "zalopay", "bank_transfer", "vnpay"
  status        String   @default("pending") // pending, completed, failed, cancelled
  transactionId String?  // ID giao dịch từ payment gateway
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  userId        String
  user          User     @relation(fields: [userId], references: [id])
}
```

#### Withdrawal Model
```prisma
model Withdrawal {
  id            String   @id @default(cuid())
  amount        Int      // Số VNĐ rút ra
  coinAmount    Int      // Số coin đã trừ
  method        String   // "bank_transfer", "momo", "zalopay"
  status        String   @default("pending") // pending, processing, completed, failed, cancelled
  bankAccount   String?  // Số tài khoản ngân hàng
  bankName      String?  // Tên ngân hàng
  accountName   String?  // Tên chủ tài khoản
  phoneNumber   String?  // Số điện thoại (cho Momo, ZaloPay)
  transactionId String?  // ID giao dịch từ payment gateway
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  userId        String
  user          User     @relation(fields: [userId], references: [id])
}
```

## 🔧 API Endpoints

### Payment Endpoints

#### 1. Lấy lịch sử nạp tiền
```http
GET /api/payment/payments
Authorization: Bearer <token>
Query: ?page=1&limit=10&status=completed
```

#### 2. Tạo payment request
```http
POST /api/payment/payments
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 100000,
  "method": "momo"
}
```

Response:
```json
{
  "payment": {
    "id": "cm123...",
    "amount": 100000,
    "coinAmount": 100000,
    "method": "momo",
    "status": "pending"
  },
  "paymentUrl": "https://payment.momo.vn/v2/gateway/pay?amount=100000&paymentId=cm123...",
  "message": "Vui lòng thanh toán để hoàn tất nạp tiền"
}
```

#### 3. Xác nhận payment (Webhook)
```http
POST /api/payment/payments/confirm
Content-Type: application/json

{
  "paymentId": "cm123...",
  "transactionId": "momo_123456789",
  "status": "success"
}
```

### Withdrawal Endpoints

#### 1. Lấy lịch sử rút tiền
```http
GET /api/payment/withdrawals
Authorization: Bearer <token>
Query: ?page=1&limit=10&status=pending
```

#### 2. Tạo withdrawal request
```http
POST /api/payment/withdrawals
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 500000,
  "method": "bank_transfer",
  "bankAccount": "1234567890",
  "bankName": "Vietcombank",
  "accountName": "Nguyen Van A"
}
```

#### 3. Cập nhật withdrawal status (Admin)
```http
PUT /api/payment/withdrawals/:id/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "completed",
  "transactionId": "bank_123456789"
}
```

## 💳 Payment Methods

### 1. MoMo
- **Min amount**: 10,000 VNĐ
- **Processing time**: Instant
- **Integration**: MoMo API
- **Webhook**: MoMo callback URL

### 2. ZaloPay
- **Min amount**: 10,000 VNĐ
- **Processing time**: Instant
- **Integration**: ZaloPay API
- **Webhook**: ZaloPay callback URL

### 3. VNPay
- **Min amount**: 10,000 VNĐ
- **Processing time**: Instant
- **Integration**: VNPay API
- **Webhook**: VNPay callback URL

### 4. Bank Transfer
- **Min amount**: 10,000 VNĐ
- **Processing time**: Manual (24h)
- **Integration**: Manual processing
- **Webhook**: Manual confirmation

## 💸 Withdrawal Methods

### 1. Bank Transfer
- **Min amount**: 50,000 VNĐ
- **Processing time**: 24h
- **Required fields**: bankAccount, bankName, accountName
- **Fee**: 0 VNĐ

### 2. MoMo
- **Min amount**: 50,000 VNĐ
- **Processing time**: 24h
- **Required fields**: phoneNumber
- **Fee**: 0 VNĐ

### 3. ZaloPay
- **Min amount**: 50,000 VNĐ
- **Processing time**: 24h
- **Required fields**: phoneNumber
- **Fee**: 0 VNĐ

## 🎨 Frontend Features

### Payment Page (`/payment`)

#### 1. Balance Display
- Hiển thị số dư coin hiện tại
- Chuyển đổi coin sang VNĐ (1:1)
- Nút nạp tiền và rút tiền

#### 2. Deposit Form
- Chọn số tiền (min: 10,000 VNĐ)
- Chọn phương thức thanh toán
- Redirect đến payment gateway

#### 3. Withdraw Form
- Chọn số tiền (min: 50,000 VNĐ)
- Chọn phương thức rút tiền
- Nhập thông tin tài khoản/điện thoại

#### 4. Transaction History
- Lịch sử nạp tiền
- Lịch sử rút tiền
- Trạng thái giao dịch
- Phân trang

## 🔄 Workflow

### Deposit Workflow
1. **User chọn nạp tiền** → Nhập số tiền và phương thức
2. **Tạo payment record** → Status: pending
3. **Redirect đến payment gateway** → User thanh toán
4. **Payment gateway callback** → Webhook xác nhận
5. **Cập nhật payment status** → completed/failed
6. **Cộng coin cho user** → Nếu thành công

### Withdrawal Workflow
1. **User chọn rút tiền** → Nhập số tiền và thông tin
2. **Kiểm tra số dư** → Đảm bảo đủ coin
3. **Tạo withdrawal record** → Status: pending
4. **Trừ coin ngay lập tức** → Tránh double spending
5. **Admin xử lý** → Chuyển khoản thực tế
6. **Cập nhật status** → completed/failed

## 🛡️ Security

### 1. Authentication
- Tất cả endpoints cần JWT token
- User chỉ xem được giao dịch của mình

### 2. Validation
- Kiểm tra số tiền tối thiểu
- Kiểm tra số dư trước khi rút
- Validate thông tin tài khoản

### 3. Rate Limiting
- Giới hạn số lần nạp/rút trong ngày
- Chống spam và abuse

## 📊 Monitoring

### 1. Transaction Logs
- Log tất cả giao dịch
- Track payment gateway responses
- Monitor failed transactions

### 2. Admin Dashboard
- Xem tất cả withdrawals
- Cập nhật status
- Export reports

### 3. Alerts
- Failed payments
- Pending withdrawals
- System errors

## 🧪 Testing

### 1. Unit Tests
- Payment controller functions
- Withdrawal validation
- Status updates

### 2. Integration Tests
- Payment gateway integration
- Webhook handling
- Database transactions

### 3. E2E Tests
- Complete deposit flow
- Complete withdrawal flow
- Error handling

## 🚀 Deployment

### 1. Environment Variables
```env
# Payment Gateway URLs
MOMO_API_URL=https://api.momo.vn
ZALOPAY_API_URL=https://api.zalopay.vn
VNPAY_API_URL=https://api.vnpay.vn

# Webhook URLs
PAYMENT_WEBHOOK_URL=https://yourdomain.com/api/payment/webhook
FRONTEND_URL=https://yourdomain.com
```

### 2. Database Migration
```bash
npx prisma db push
npx prisma generate
```

### 3. SSL Certificate
- Required for payment gateway integration
- HTTPS for all payment endpoints

## 📈 Future Enhancements

### 1. Advanced Features
- Recurring payments
- Payment plans
- Refund system
- Multi-currency support

### 2. Analytics
- Transaction analytics
- Revenue reports
- User spending patterns

### 3. Mobile App
- Mobile payment integration
- Push notifications
- Biometric authentication

## 🎯 Kết quả

Hệ thống thanh toán hoàn chỉnh với:
- ✅ **Backend**: Payment & Withdrawal APIs
- ✅ **Frontend**: Beautiful payment UI
- ✅ **Database**: Payment & Withdrawal models
- ✅ **Security**: Authentication & validation
- ✅ **Integration**: Ready for payment gateways

**User có thể nạp tiền VNĐ và rút tiền từ coin một cách an toàn và tiện lợi!** 💰
