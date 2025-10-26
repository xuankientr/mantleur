# 💳 Hướng dẫn Setup MoMo Payment Gateway

## 📋 Tổng quan

Hướng dẫn chi tiết để setup MoMo payment gateway cho MantleUR.

## 🏦 Bước 1: Đăng ký MoMo Merchant Account

### 1.1 Truy cập MoMo Developer Portal
- **URL**: https://developers.momo.vn/
- **Click**: "Đăng ký ngay" hoặc "Register"

### 1.2 Điền thông tin đăng ký
```
Thông tin cá nhân:
- Họ và tên: [Tên của bạn]
- Email: [Email của bạn]
- Số điện thoại: [Số điện thoại]
- CMND/CCCD: [Số CMND/CCCD]

Thông tin doanh nghiệp:
- Tên công ty: MantleUR
- Mã số thuế: [Mã số thuế]
- Địa chỉ: [Địa chỉ công ty]
- Ngành nghề: Công nghệ thông tin
```

### 1.3 Upload tài liệu
- **Giấy phép kinh doanh** (nếu có)
- **CMND/CCCD** (mặt trước và sau)
- **Hợp đồng dịch vụ** (nếu có)

### 1.4 Chờ phê duyệt
- **Thời gian**: 3-5 ngày làm việc
- **Email xác nhận**: MoMo sẽ gửi email khi được phê duyệt

## 🔑 Bước 2: Lấy Credentials

### 2.1 Đăng nhập MoMo Developer Portal
- **URL**: https://developers.momo.vn/
- **Login**: Với tài khoản đã đăng ký

### 2.2 Tạo App
```
App Information:
- App Name: MantleUR Payment
- App Description: Payment gateway for MantleUR streaming platform
- Category: E-commerce
- Website: http://localhost:5173 (hoặc domain thực tế)
```

### 2.3 Lấy Credentials
Sau khi tạo app, bạn sẽ nhận được:
```
Partner Code: MOMO_PARTNER_CODE
Access Key: MOMO_ACCESS_KEY  
Secret Key: MOMO_SECRET_KEY
```

## ⚙️ Bước 3: Cấu hình Environment Variables

### 3.1 Tạo file `.env` trong backend
```env
# MoMo Configuration
MOMO_PARTNER_CODE=MOMO_PARTNER_CODE
MOMO_ACCESS_KEY=MOMO_ACCESS_KEY
MOMO_SECRET_KEY=MOMO_SECRET_KEY
MOMO_ENDPOINT=https://test-payment.momo.vn/v2/gateway/api/create
MOMO_RETURN_URL=http://localhost:5173/payment/success
MOMO_NOTIFY_URL=http://localhost:5000/api/payment/momo-webhook

# Payment Mode
PAYMENT_MODE=momo

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### 3.2 Cập nhật production URLs
Khi deploy lên production:
```env
MOMO_ENDPOINT=https://payment.momo.vn/v2/gateway/api/create
MOMO_RETURN_URL=https://yourdomain.com/payment/success
MOMO_NOTIFY_URL=https://yourdomain.com/api/payment/momo-webhook
FRONTEND_URL=https://yourdomain.com
```

## 🧪 Bước 4: Test với Sandbox

### 4.1 Test Cards
MoMo cung cấp test cards để test:
```
Test Card Numbers:
- 9704198526191432198 (Thành công)
- 9704220196191432198 (Thất bại)
- 9704220196191432199 (Hết hạn)
```

### 4.2 Test Flow
1. **Start server**: `npm run dev`
2. **Login**: Vào ứng dụng
3. **Nạp tiền**: Chọn MoMo, nhập 10,000 VNĐ
4. **Test payment**: Sử dụng test card
5. **Check result**: Xem coin có được cộng không

## 🔧 Bước 5: Cấu hình Webhook

### 5.1 Webhook URL
```
Development: http://localhost:5000/api/payment/momo-webhook
Production: https://yourdomain.com/api/payment/momo-webhook
```

### 5.2 Cấu hình trong MoMo Portal
1. **Đăng nhập**: MoMo Developer Portal
2. **Vào App**: Chọn app MantleUR
3. **Webhook Settings**: 
   - **URL**: `https://yourdomain.com/api/payment/momo-webhook`
   - **Method**: POST
   - **Content-Type**: application/json

### 5.3 Test Webhook
Sử dụng ngrok để test webhook local:
```bash
# Install ngrok
npm install -g ngrok

# Expose local port
ngrok http 5000

# Copy HTTPS URL và cập nhật MOMO_NOTIFY_URL
```

## 💰 Bước 6: Phí và Thanh toán

### 6.1 Phí MoMo
```
Phí giao dịch:
- Phí cố định: 3,000 VNĐ
- Phí phần trăm: 1.5%
- Tối thiểu: 10,000 VNĐ
- Tối đa: 20,000,000 VNĐ
```

### 6.2 Ví dụ tính phí
```
User nạp: 100,000 VNĐ
Phí MoMo: 100,000 × 1.5% + 3,000 = 4,500 VNĐ
MantleUR nhận: 100,000 - 4,500 = 95,500 VNĐ
User nhận: 95,500 coin
```

### 6.3 Thanh toán
- **Tần suất**: Hàng ngày
- **Phương thức**: Chuyển khoản ngân hàng
- **Thời gian**: 1-2 ngày làm việc

## 🚀 Bước 7: Deploy Production

### 7.1 SSL Certificate
Webhook cần HTTPS:
```bash
# Sử dụng Let's Encrypt
sudo apt install certbot
sudo certbot --nginx -d yourdomain.com
```

### 7.2 Environment Variables
```env
# Production
NODE_ENV=production
MOMO_ENDPOINT=https://payment.momo.vn/v2/gateway/api/create
MOMO_RETURN_URL=https://yourdomain.com/payment/success
MOMO_NOTIFY_URL=https://yourdomain.com/api/payment/momo-webhook
FRONTEND_URL=https://yourdomain.com
```

### 7.3 Deploy Commands
```bash
# Build frontend
cd frontend
npm run build

# Deploy backend
cd backend
npm install
npm start
```

## 🔍 Bước 8: Monitoring và Debug

### 8.1 Log Monitoring
```javascript
// Trong paymentController.js
console.log('MoMo payment request:', {
  orderId,
  amount,
  method: 'momo'
});

// Trong webhook
console.log('MoMo webhook received:', req.body);
```

### 8.2 Common Issues
```
1. Invalid Signature:
   - Check MOMO_SECRET_KEY
   - Verify signature calculation

2. Payment Not Found:
   - Check orderId format
   - Verify payment exists in DB

3. Webhook Timeout:
   - Increase timeout settings
   - Check server performance
```

### 8.3 Debug Tools
```bash
# Check webhook logs
tail -f logs/payment.log

# Test webhook locally
curl -X POST http://localhost:5000/api/payment/momo-webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

## 📊 Bước 9: Analytics và Reporting

### 9.1 Payment Analytics
```javascript
// Track payment metrics
const paymentStats = await prisma.payment.groupBy({
  by: ['status', 'method'],
  _count: true,
  _sum: {
    amount: true
  }
});
```

### 9.2 Revenue Tracking
```javascript
// Daily revenue
const dailyRevenue = await prisma.payment.aggregate({
  where: {
    status: 'completed',
    createdAt: {
      gte: new Date(new Date().setHours(0, 0, 0, 0))
    }
  },
  _sum: {
    amount: true
  }
});
```

## 🎯 Checklist Setup

### ✅ Pre-requisites
- [ ] Đăng ký MoMo merchant account
- [ ] Upload tài liệu cần thiết
- [ ] Chờ phê duyệt từ MoMo
- [ ] Lấy credentials (Partner Code, Access Key, Secret Key)

### ✅ Configuration
- [ ] Cấu hình environment variables
- [ ] Setup webhook URL
- [ ] Test với sandbox
- [ ] Verify signature calculation

### ✅ Testing
- [ ] Test payment flow
- [ ] Test webhook callback
- [ ] Test error handling
- [ ] Test với test cards

### ✅ Production
- [ ] Deploy với HTTPS
- [ ] Cấu hình production URLs
- [ ] Setup monitoring
- [ ] Test với real payments

## 🎉 Kết quả

Sau khi setup xong:
- ✅ **User có thể nạp tiền** qua MoMo
- ✅ **Tiền thực tế** được chuyển đến tài khoản MantleUR
- ✅ **Coin được cộng** vào tài khoản user
- ✅ **Webhook tự động** xử lý thanh toán
- ✅ **Monitoring** và logging đầy đủ

**MoMo Payment Gateway đã sẵn sàng!** 💳🚀
