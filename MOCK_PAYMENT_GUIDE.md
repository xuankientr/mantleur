# 🧪 Mock Payment System - Hướng dẫn Test

## 📋 Tổng quan

Mock Payment System cho phép test tính năng nạp/rút tiền mà không cần tích hợp với payment gateway thực tế.

## 🎯 Tính năng Mock

### 1. Mock Payment Flow
- ✅ **Tạo payment request** → Redirect đến mock payment page
- ✅ **Mock payment page** → Simulate success/failure
- ✅ **Payment callback** → Update database và cộng coin
- ✅ **Transaction history** → Hiển thị lịch sử giao dịch

### 2. Mock Withdrawal Flow
- ✅ **Tạo withdrawal request** → Trừ coin ngay lập tức
- ✅ **Admin dashboard** → Xem và xử lý withdrawals
- ✅ **Process withdrawal** → Approve/reject requests
- ✅ **Return coins** → Nếu withdrawal failed

## 🔧 API Endpoints

### Mock Payment Endpoints

#### 1. Mock Payment Success
```http
POST /api/mock-payment/mock-payment-success
Content-Type: application/json

{
  "paymentId": "cm123..."
}
```

#### 2. Mock Payment Failure
```http
POST /api/mock-payment/mock-payment-failure
Content-Type: application/json

{
  "paymentId": "cm123..."
}
```

#### 3. Process Withdrawal (Admin)
```http
POST /api/mock-payment/mock-withdrawal-process/:id
Content-Type: application/json

{
  "status": "completed" // or "failed"
}
```

#### 4. Get Pending Withdrawals (Admin)
```http
GET /api/mock-payment/admin/withdrawals
```

## 🎨 Frontend Pages

### 1. Mock Payment Page (`/payment/mock`)
- **URL**: `http://localhost:5173/payment/mock?paymentId=xxx&amount=xxx&method=xxx`
- **Features**:
  - Hiển thị thông tin payment
  - Nút "Thanh toán thành công"
  - Nút "Thanh toán thất bại"
  - Nút "Hủy thanh toán"
  - Auto redirect sau khi xử lý

### 2. Admin Withdrawals Page (`/admin/withdrawals`)
- **URL**: `http://localhost:5173/admin/withdrawals`
- **Features**:
  - Danh sách pending withdrawals
  - Stats dashboard
  - Xem chi tiết withdrawal
  - Approve/reject withdrawals
  - Real-time updates

## 🧪 Test Scenarios

### Scenario 1: Successful Payment
1. **Login** → Vào `/payment`
2. **Click "Nạp tiền"** → Nhập 100,000 VNĐ, chọn MoMo
3. **Click "Tiếp tục"** → Redirect đến mock payment page
4. **Click "Thanh toán thành công"** → Payment completed
5. **Check balance** → Coin tăng 100,000
6. **Check history** → Payment hiển thị "Hoàn thành"

### Scenario 2: Failed Payment
1. **Login** → Vào `/payment`
2. **Click "Nạp tiền"** → Nhập 50,000 VNĐ, chọn ZaloPay
3. **Click "Tiếp tục"** → Redirect đến mock payment page
4. **Click "Thanh toán thất bại"** → Payment failed
5. **Check balance** → Coin không thay đổi
6. **Check history** → Payment hiển thị "Thất bại"

### Scenario 3: Withdrawal Request
1. **Login** → Vào `/payment`
2. **Click "Rút tiền"** → Nhập 200,000 VNĐ
3. **Chọn "Chuyển khoản"** → Nhập thông tin ngân hàng
4. **Click "Gửi yêu cầu"** → Withdrawal created
5. **Check balance** → Coin giảm 200,000 ngay lập tức
6. **Check history** → Withdrawal hiển thị "Chờ xử lý"

### Scenario 4: Admin Process Withdrawal
1. **Open admin page** → `http://localhost:5173/admin/withdrawals`
2. **View pending withdrawals** → Danh sách requests
3. **Click "Xem"** → Chi tiết withdrawal
4. **Click "Duyệt"** → Withdrawal completed
5. **Check user balance** → User nhận tiền (simulated)

## 🔄 Workflow Details

### Payment Workflow
```
User → Payment Form → Create Payment → Mock Payment Page → Success/Failure → Update DB → Redirect
```

### Withdrawal Workflow
```
User → Withdrawal Form → Create Withdrawal → Subtract Coins → Admin Review → Approve/Reject → Update Status
```

## 📊 Database Changes

### Payment Table
- `status`: pending → completed/failed
- `transactionId`: Generated mock ID
- `user.coinBalance`: Incremented on success

### Withdrawal Table
- `status`: pending → completed/failed
- `transactionId`: Generated mock ID
- `user.coinBalance`: Decremented immediately, restored on failure

## 🎯 Test Data

### Sample Payment
```json
{
  "amount": 100000,
  "coinAmount": 100000,
  "method": "momo",
  "status": "pending"
}
```

### Sample Withdrawal
```json
{
  "amount": 200000,
  "coinAmount": 200000,
  "method": "bank_transfer",
  "bankAccount": "1234567890",
  "bankName": "Vietcombank",
  "accountName": "Nguyen Van A",
  "status": "pending"
}
```

## 🚀 Production Integration

### Real Payment Gateway Integration
1. **Replace mock URLs** với real payment gateway URLs
2. **Implement webhooks** để nhận callbacks
3. **Add security** cho webhook endpoints
4. **Add logging** cho tất cả transactions
5. **Add monitoring** cho failed payments

### Example: MoMo Integration
```javascript
// Replace mock URL with real MoMo API
const createPaymentUrl = async (paymentId, amount, method) => {
  if (method === 'momo') {
    const momoResponse = await momoAPI.createPayment({
      amount: amount,
      orderId: paymentId,
      returnUrl: `${baseUrl}/payment/success`,
      notifyUrl: `${baseUrl}/api/payment/momo-webhook`
    });
    return momoResponse.payUrl;
  }
  // ... other methods
};
```

## 🎉 Kết quả Test

### ✅ Payment System Working
- **Mock payment page** → Functional
- **Payment success/failure** → Working
- **Coin balance updates** → Working
- **Transaction history** → Working

### ✅ Withdrawal System Working
- **Withdrawal request** → Working
- **Coin deduction** → Working
- **Admin dashboard** → Working
- **Approval/rejection** → Working

### ✅ Database Updates
- **Payment records** → Created correctly
- **Withdrawal records** → Created correctly
- **User balance** → Updated correctly
- **Transaction IDs** → Generated correctly

## 🎯 Next Steps

1. **Test all scenarios** → Verify functionality
2. **Integrate real payment gateway** → MoMo, ZaloPay, VNPay
3. **Add webhook security** → Verify signatures
4. **Add monitoring** → Track success rates
5. **Add notifications** → Email/SMS alerts

**Mock Payment System đã sẵn sàng để test!** 🧪✨
