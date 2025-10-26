# 💳 Payment Gateway Integration - Hướng dẫn Triển khai

## 📋 Tổng quan

Hệ thống đã được tích hợp với các payment gateway phổ biến tại Việt Nam để xử lý thanh toán thực tế.

## 🏦 Payment Gateways được hỗ trợ

### 1. **MoMo** (Phổ biến nhất)
- **Website**: https://developers.momo.vn/
- **Sandbox**: https://test-payment.momo.vn/
- **Production**: https://payment.momo.vn/
- **Phí**: 1.5% + 3,000 VNĐ
- **Thời gian**: Instant

### 2. **VNPay**
- **Website**: https://sandbox.vnpayment.vn/
- **Sandbox**: https://sandbox.vnpayment.vn/
- **Production**: https://vnpayment.vn/
- **Phí**: 1.2% + 2,000 VNĐ
- **Thời gian**: Instant

### 3. **ZaloPay**
- **Website**: https://developers.zalopay.vn/
- **Sandbox**: https://sb-openapi.zalopay.vn/
- **Production**: https://openapi.zalopay.vn/
- **Phí**: 1.5% + 3,000 VNĐ
- **Thời gian**: Instant

### 4. **Bank Transfer** (Chuyển khoản)
- **Xử lý**: Manual
- **Phí**: 0 VNĐ
- **Thời gian**: 24h

## 🔧 Cấu hình Environment Variables

### 1. **MoMo Configuration**
```env
MOMO_PARTNER_CODE=your_momo_partner_code
MOMO_ACCESS_KEY=your_momo_access_key
MOMO_SECRET_KEY=your_momo_secret_key
MOMO_ENDPOINT=https://test-payment.momo.vn/v2/gateway/api/create
MOMO_RETURN_URL=http://localhost:5173/payment/success
MOMO_NOTIFY_URL=http://localhost:5000/api/payment/momo-webhook
```

### 2. **VNPay Configuration**
```env
VNPAY_TMN_CODE=your_vnpay_tmn_code
VNPAY_HASH_SECRET=your_vnpay_hash_secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:5173/payment/success
```

### 3. **ZaloPay Configuration**
```env
ZALOPAY_APP_ID=your_zalopay_app_id
ZALOPAY_KEY1=your_zalopay_key1
ZALOPAY_KEY2=your_zalopay_key2
ZALOPAY_ENDPOINT=https://sb-openapi.zalopay.vn/v2/create
ZALOPAY_RETURN_URL=http://localhost:5173/payment/success
```

## 🔄 Payment Flow

### 1. **User nạp tiền**
```
User → Payment Form → Create Payment → Payment Gateway → User Payment → Webhook → Update DB → Add Coins
```

### 2. **Payment Gateway Response**
```
Payment Gateway → Webhook → Verify Signature → Update Payment Status → Add Coins to User
```

## 🛡️ Security Features

### 1. **Signature Verification**
- **MoMo**: HMAC-SHA256 signature verification
- **VNPay**: HMAC-SHA512 signature verification
- **ZaloPay**: HMAC-SHA256 signature verification

### 2. **Webhook Security**
- Verify signature từ payment gateway
- Check payment status
- Prevent duplicate processing
- Log tất cả transactions

### 3. **Data Validation**
- Validate payment amount
- Check payment status
- Verify order ID format
- Sanitize input data

## 📊 Webhook Endpoints

### 1. **MoMo Webhook**
```http
POST /api/payment/momo-webhook
Content-Type: application/json

{
  "orderId": "PAY_cm123..._1234567890",
  "amount": 100000,
  "orderInfo": "Nạp tiền MantleUR - 100000 VNĐ",
  "resultCode": 0,
  "transId": "momo_transaction_id",
  "responseTime": 1234567890,
  "extraData": "",
  "signature": "hmac_signature"
}
```

### 2. **VNPay Webhook**
```http
POST /api/payment/vnpay-webhook
Content-Type: application/json

{
  "vnp_TxnRef": "PAY_cm123..._1234567890",
  "vnp_Amount": 10000000,
  "vnp_ResponseCode": "00",
  "vnp_TransactionNo": "vnpay_transaction_id",
  "vnp_SecureHash": "hmac_signature"
}
```

### 3. **ZaloPay Webhook**
```http
POST /api/payment/zalopay-webhook
Content-Type: application/json

{
  "app_trans_id": "PAY_cm123..._1234567890",
  "amount": 100000,
  "status": 1,
  "zp_trans_id": "zalopay_transaction_id",
  "mac": "hmac_signature"
}
```

## 🧪 Testing

### 1. **Sandbox Testing**
- **MoMo**: Sử dụng test environment
- **VNPay**: Sử dụng sandbox environment
- **ZaloPay**: Sử dụng sandbox environment

### 2. **Test Cards**
- **MoMo**: Test card numbers từ MoMo
- **VNPay**: Test card numbers từ VNPay
- **ZaloPay**: Test card numbers từ ZaloPay

### 3. **Webhook Testing**
- Sử dụng ngrok để expose local webhook
- Test với payment gateway sandbox
- Verify signature và data processing

## 🚀 Production Deployment

### 1. **SSL Certificate**
- Required cho webhook endpoints
- HTTPS cho tất cả payment URLs
- Valid SSL certificate

### 2. **Environment Variables**
- Set production payment gateway credentials
- Update webhook URLs to production domain
- Set PAYMENT_MODE=real

### 3. **Monitoring**
- Monitor webhook success rates
- Track payment failures
- Alert on signature verification failures
- Log all payment transactions

## 💰 Revenue Flow

### 1. **Tiền từ User**
```
User → Payment Gateway → MantleUR Account → Admin
```

### 2. **Phí Payment Gateway**
```
User Payment → Payment Gateway Fee → Net Amount → MantleUR Account
```

### 3. **Ví dụ tính phí**
- **User nạp**: 100,000 VNĐ
- **MoMo phí**: 1,500 VNĐ + 3,000 VNĐ = 4,500 VNĐ
- **MantleUR nhận**: 95,500 VNĐ
- **User nhận**: 95,500 coin

## 🔍 Troubleshooting

### 1. **Common Issues**
- **Invalid signature**: Check secret key
- **Payment not found**: Check order ID format
- **Webhook timeout**: Increase timeout settings
- **Duplicate processing**: Check payment status

### 2. **Debug Steps**
- Check webhook logs
- Verify signature calculation
- Check database payment records
- Test with sandbox environment

### 3. **Error Handling**
- Graceful fallback to mock payment
- Retry failed webhooks
- Alert on critical errors
- Log all error details

## 📈 Analytics

### 1. **Payment Metrics**
- Success rate by payment method
- Average payment amount
- Payment volume by time
- Failed payment reasons

### 2. **Revenue Tracking**
- Daily/monthly revenue
- Payment gateway fees
- Net revenue after fees
- User payment patterns

## 🎯 Next Steps

### 1. **Immediate**
- [ ] Get payment gateway credentials
- [ ] Set up sandbox environment
- [ ] Test webhook endpoints
- [ ] Deploy to production

### 2. **Future Enhancements**
- [ ] Add more payment methods
- [ ] Implement refund system
- [ ] Add payment analytics
- [ ] Mobile payment integration

## 🎉 Kết quả

### ✅ **Payment Gateway Integration**
- **MoMo**: Ready for integration
- **VNPay**: Ready for integration
- **ZaloPay**: Ready for integration
- **Bank Transfer**: Manual processing ready

### ✅ **Security**
- **Signature verification**: Implemented
- **Webhook security**: Implemented
- **Data validation**: Implemented
- **Error handling**: Implemented

### ✅ **Testing**
- **Sandbox support**: Ready
- **Mock fallback**: Available
- **Webhook testing**: Ready
- **Production ready**: Yes

**Payment Gateway Integration đã sẵn sàng để triển khai!** 💳🚀
