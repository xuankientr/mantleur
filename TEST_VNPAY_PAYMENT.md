# 🧪 Test VNPay Payment Integration

## ✅ Cấu Hình Đã Cập Nhật

### VNPay Sandbox Credentials:
- **Terminal ID (vnp_TmnCode):** `7DZ9914S`
- **Secret Key (vnp_HashSecret):** `TTA4970KSZ1P8Y3O7YJKNEP4PIUEZFFL`
- **Payment URL:** `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html`
- **Return URL:** `http://localhost:5000/api/payments/return`

### Test Card Information:
```
Ngân hàng: NCB
Số thẻ: 9704198526191432198
Tên chủ thẻ: NGUYEN VAN A
Ngày phát hành: 07/15
Mật khẩu OTP: 123456
```

## 🚀 Cách Test

### 1. Start Backend

```bash
cd backend
npm run dev
```

Server sẽ chạy trên: `http://localhost:5000`

### 2. Start Frontend

```bash
cd frontend  
npm run dev
```

Frontend sẽ chạy trên: `http://localhost:5173`

### 3. Test Payment Flow

#### Step 1: Login
- Vào `http://localhost:5173/login`
- Login với tài khoản test

#### Step 2: Go to Profile
- Click vào Profile icon
- Click "Payment" button

#### Step 3: Top Up
- Nhập số tiền: 50,000 VND
- Click "Top Up"
- Sẽ nhận được payment URL

#### Step 4: Redirect to VNPay
- Copy payment URL
- Open in new tab
- VNPay Sandbox page sẽ hiện ra

#### Step 5: Test Payment
- Số thẻ: `9704198526191432198`
- Tên chủ thẻ: `NGUYEN VAN A`
- Ngày phát hành: `07/15`
- OTP: `123456`

#### Step 6: Callback
- Sau khi thanh toán thành công
- VNPay redirect về: `http://localhost:5000/api/payments/return`
- Server verify checksum
- Cộng coins vào user (50,000 VND = 500 coins)
- Redirect về frontend success page

## 📝 Logs Để Kiểm Tra

### Backend Logs:
```
✅ Payment created - Order ID: DEPOSIT_123_1234567890, Amount: 50000 VND, User: 123
📥 VNPay callback received: {...}
✅ Payment successful - Order ID: DEPOSIT_123_1234567890, Amount: 50000 VND
✅ Balance added - User ID: 123, Amount: 50000 VND
```

### Frontend Logs:
```
Creating payment for amount: 50000
Payment URL received: https://sandbox.vnpayment.vn/...
Redirecting to VNPay...
Payment successful! Redirecting to profile...
```

## 🎯 Expected Results

### Database Changes:
- `transactions` table: Thêm 1 transaction với status = 'success'
- `users` table: coinBalance tăng 500 coins (50,000 VND = 500 coins)

### API Response:
```json
{
  "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?...",
  "orderId": "DEPOSIT_userId_timestamp",
  "transactionId": "cuid"
}
```

## ❌ Troubleshooting

### 1. Payment URL không hoạt động:
- Check VNPay credentials trong `.env`
- Check vnp_ReturnUrl đúng format
- Check checksum calculation

### 2. Callback không được gọi:
- Check VNPay đã nhận được URL return
- Check port 5000 đang listen
- Check network connectivity

### 3. Checksum verification failed:
- Check vnp_HashSecret đúng
- Check signature calculation
- Check parameter sorting

### 4. Balance không cộng:
- Check database connection
- Check user ID đúng
- Check update query

## 📞 Support

- VNPay Docs: https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html
- Demo Code: https://sandbox.vnpayment.vn/apis/vnpay-demo/code-demo-tích-hợp
- Merchant Admin: https://sandbox.vnpayment.vn/merchantv2/
- Test Environment: https://sandbox.vnpayment.vn/vnpaygw-sit-testing/

## 🎉 Kết Quả Mong Đợi

✅ User nạp 50,000 VND  
✅ Nhận 500 coins  
✅ Transaction history được lưu  
✅ Balance được cập nhật  
✅ Redirect về success page  

**Hệ thống sẵn sàng để test!** 🚀


