require('dotenv').config({ path: './env.local' });
const crypto = require('crypto');

function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort();
  keys.forEach(key => {
    sorted[key] = obj[key];
  });
  return sorted;
}

function createPaymentUrl(orderId, amount, orderInfo, bankCode = '') {
  const now = new Date();
  const vietnamTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
  const createDate = vietnamTime.toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
  const expireDate = new Date(vietnamTime.getTime() + 1 * 60 * 60 * 1000)
    .toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);

  let vnp_Params = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: process.env.VNP_TMN_CODE,
    vnp_Locale: 'vn',
    vnp_CurrCode: 'VND',
    vnp_TxnRef: orderId,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: 'other',
    vnp_Amount: Math.round(amount) * 100,
    vnp_ReturnUrl: 'http://localhost:5001/test-callback', // Updated callback URL
    vnp_IpAddr: '192.168.1.1',
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate
  };

  if (bankCode) vnp_Params['vnp_BankCode'] = bankCode;

  const sorted = sortObject(vnp_Params);
  
  // VNPay Sandbox yêu cầu spaces as + cho signData
  const signData = Object.keys(sorted)
    .map(key => `${key}=${encodeURIComponent(sorted[key])}`)
    .join('&')
    .replace(/%20/g, '+');

  const vnp_HashSecret = process.env.VNP_HASH_SECRET.trim();
  
  const signed = crypto
    .createHmac('sha512', vnp_HashSecret)
    .update(Buffer.from(signData, 'utf-8'))
    .digest('hex')
    .toUpperCase();

  // ✅ chỉ thêm vnp_SecureHash (VNPay Sandbox không chấp nhận vnp_SecureHashType)
  sorted['vnp_SecureHash'] = signed;
  
  const paymentUrl = `${process.env.VNP_URL}?${Object.keys(sorted)
    .map(key => `${key}=${encodeURIComponent(sorted[key])}`)
    .join('&')}`;

  return {
    signData,
    signed,
    paymentUrl,
    sorted
  };
}

console.log('🧪 Generating Payment URL with Test Callback...');
console.log('================================================');

const result = createPaymentUrl('DEPOSIT_test123_1761462982024', 50000, 'Nap tien vao tai khoan');

console.log('🔐 Sign Data:', result.signData);
console.log('🔐 My Hash:', result.signed);
console.log('');
console.log('✅ Payment URL:');
console.log(result.paymentUrl);
console.log('');
console.log('📋 Next Steps:');
console.log('1. Start test callback server: node test-callback-server.js');
console.log('2. Copy payment URL above');
console.log('3. Test in PRIVATE/INCOGNITO browser');
console.log('4. Check callback server logs for the 3 key lines');
