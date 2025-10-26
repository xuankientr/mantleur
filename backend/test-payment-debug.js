const crypto = require('crypto');

// VNPay configuration
const vnp_TmnCode = '7DZ9914S';
const vnp_HashSecret = 'TTA4970KSZ1P8Y3O7YJKNEP4PIUEZFFL';
const vnp_Url = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
const vnp_ReturnUrl = 'http://localhost:5000/api/payments/return';

// Helper function to sort object for VNPay
function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(key);
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = obj[str[key]];
  }
  return sorted;
}

function createPaymentUrl(orderId, amount, orderInfo, bankCode = '') {
  const now = new Date();
  const vietnamTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
  const createDate = vietnamTime.toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
  const expireDate = new Date(vietnamTime.getTime() + 24 * 60 * 60 * 1000).toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);

  console.log('🕐 Create Date:', createDate);
  console.log('🕐 Expire Date:', expireDate);

  let vnp_Params = {};
  vnp_Params['vnp_Version'] = '2.1.0';
  vnp_Params['vnp_Command'] = 'pay';
  vnp_Params['vnp_TmnCode'] = vnp_TmnCode;
  vnp_Params['vnp_Locale'] = 'vn';
  vnp_Params['vnp_CurrCode'] = 'VND';
  vnp_Params['vnp_TxnRef'] = orderId;
  vnp_Params['vnp_OrderInfo'] = orderInfo;
  vnp_Params['vnp_OrderType'] = 'other';
  vnp_Params['vnp_Amount'] = Math.round(amount) * 100;
  vnp_Params['vnp_ReturnUrl'] = vnp_ReturnUrl;
  vnp_Params['vnp_IpAddr'] = '192.168.1.1';
  vnp_Params['vnp_CreateDate'] = createDate;
  vnp_Params['vnp_ExpireDate'] = expireDate;
  
  if (bankCode !== null && bankCode !== '') {
    vnp_Params['vnp_BankCode'] = bankCode;
  }

  // 👉 KHÔNG thêm vnp_SecureHashType ở đây, chỉ thêm sau khi ký xong
  const sorted = sortObject(vnp_Params);

  // VNPay Sandbox yêu cầu encodeURIComponent cho signData
  const signData = Object.keys(sorted)
    .map(key => `${key}=${encodeURIComponent(sorted[key])}`)
    .join('&');

  console.log('🔐 Sign Data:', signData);
  console.log('🔐 Hash Secret:', vnp_HashSecret);

  const signed = crypto
    .createHmac('sha512', vnp_HashSecret)
    .update(Buffer.from(signData, 'utf-8'))
    .digest('hex')
    .toUpperCase();

  console.log('🔐 My Hash:', signed);

  // ✅ chỉ thêm vnp_SecureHash (VNPay Sandbox không chấp nhận vnp_SecureHashType)
  sorted['vnp_SecureHash'] = signed;
  // ❌ KHÔNG thêm vnp_SecureHashType cho Sandbox
  
  console.log('🔐 Generated Hash:', signed);
  console.log('✅ Final params sent to VNPay:', sorted);
  
  const paymentUrl = `${vnp_Url}?${Object.keys(sorted)
    .map(key => `${key}=${encodeURIComponent(sorted[key])}`)
    .join('&')}`;

  console.log('✅ Payment URL:', paymentUrl);

  return paymentUrl;
}

// Test với dữ liệu mẫu
const testOrderId = 'DEPOSIT_test123_1761462982024';
const testAmount = 50000;
const testOrderInfo = 'Nap tien vao tai khoan';

console.log('🧪 Testing VNPay Payment URL Generation...\n');

const paymentUrl = createPaymentUrl(testOrderId, testAmount, testOrderInfo);

console.log('\n📋 Summary:');
console.log('Order ID:', testOrderId);
console.log('Amount:', testAmount, 'VND');
console.log('Payment URL:', paymentUrl);
console.log('\n🔗 Copy URL above to test in browser');
