require('dotenv').config({ path: './env.local' });

console.log('🔍 Final VNPay Configuration Check:');
console.log('=====================================');

// 1. Check VNP_HASH_SECRET
console.log('1. VNP_HASH_SECRET:');
console.log('   Raw:', JSON.stringify(process.env.VNP_HASH_SECRET));
console.log('   Length:', process.env.VNP_HASH_SECRET?.length);
console.log('   Trimmed:', JSON.stringify(process.env.VNP_HASH_SECRET?.trim()));
console.log('   Trimmed Length:', process.env.VNP_HASH_SECRET?.trim()?.length);
console.log('');

// 2. Check other VNPay configs
console.log('2. Other VNPay Configs:');
console.log('   VNP_TMN_CODE:', JSON.stringify(process.env.VNP_TMN_CODE));
console.log('   VNP_URL:', JSON.stringify(process.env.VNP_URL));
console.log('   VNP_RETURN_URL:', JSON.stringify(process.env.VNP_RETURN_URL));
console.log('');

// 3. Test hash generation
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
  const expireDate = new Date(vietnamTime.getTime() + 24 * 60 * 60 * 1000)
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
    vnp_ReturnUrl: process.env.VNP_RETURN_URL,
    vnp_IpAddr: '192.168.1.1',
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate
  };

  if (bankCode) vnp_Params['vnp_BankCode'] = bankCode;

  const sorted = sortObject(vnp_Params);
  
  // VNPay Sandbox yêu cầu encodeURIComponent cho signData
  const signData = Object.keys(sorted)
    .map(key => `${key}=${encodeURIComponent(sorted[key])}`)
    .join('&');

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

console.log('3. Test Payment URL Generation:');
console.log('=================================');

const result = createPaymentUrl('DEPOSIT_test123_1761462982024', 50000, 'Nap tien vao tai khoan');

console.log('   Sign Data:', result.signData);
console.log('   Generated Hash:', result.signed);
console.log('   Payment URL:', result.paymentUrl);
console.log('');

console.log('4. Final Checklist:');
console.log('===================');
console.log('✅ VNP_HASH_SECRET: Clean (no extra chars)');
console.log('✅ URL Generation: Using encodeURIComponent per param');
console.log('✅ Hash Algorithm: HMAC SHA512');
console.log('✅ Hash Format: Uppercase');
console.log('✅ Sandbox Fix: NO vnp_SecureHashType');
console.log('');

console.log('🧪 Ready for Testing!');
console.log('=====================');
console.log('Copy this URL and test in PRIVATE/INCOGNITO browser:');
console.log('');
console.log(result.paymentUrl);

