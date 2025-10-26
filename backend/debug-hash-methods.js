require('dotenv').config({ path: './env.local' });
const crypto = require('crypto');

console.log('🔍 VNPay Signature Debug Tool');
console.log('============================');

// Test với các cách hash khác nhau
function testHashVariants(signData, secret) {
  console.log('\n📋 Testing different hash methods:');
  
  // Method 1: encodeURIComponent (current)
  const hash1 = crypto.createHmac('sha512', secret)
    .update(Buffer.from(signData, 'utf-8'))
    .digest('hex')
    .toUpperCase();
  console.log('1. encodeURIComponent:', hash1);
  
  // Method 2: Raw string (no encoding)
  const rawSignData = signData.replace(/%20/g, ' ').replace(/%3A/g, ':').replace(/%2F/g, '/');
  const hash2 = crypto.createHmac('sha512', secret)
    .update(Buffer.from(rawSignData, 'utf-8'))
    .digest('hex')
    .toUpperCase();
  console.log('2. Raw string:', hash2);
  
  // Method 3: Spaces as +
  const plusSignData = signData.replace(/%20/g, '+');
  const hash3 = crypto.createHmac('sha512', secret)
    .update(Buffer.from(plusSignData, 'utf-8'))
    .digest('hex')
    .toUpperCase();
  console.log('3. Spaces as +:', hash3);
  
  // Method 4: No Buffer, direct string
  const hash4 = crypto.createHmac('sha512', secret)
    .update(signData, 'utf-8')
    .digest('hex')
    .toUpperCase();
  console.log('4. Direct string:', hash4);
  
  return { hash1, hash2, hash3, hash4 };
}

// Generate test data
const now = new Date();
const vietnamTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
const createDate = vietnamTime.toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
const expireDate = new Date(vietnamTime.getTime() + 24 * 60 * 60 * 1000)
  .toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);

const vnp_Params = {
  vnp_Version: '2.1.0',
  vnp_Command: 'pay',
  vnp_TmnCode: process.env.VNP_TMN_CODE,
  vnp_Locale: 'vn',
  vnp_CurrCode: 'VND',
  vnp_TxnRef: 'DEPOSIT_test123_1761462982024',
  vnp_OrderInfo: 'Nap tien vao tai khoan',
  vnp_OrderType: 'other',
  vnp_Amount: 5000000,
  vnp_ReturnUrl: 'http://localhost:5001/test-callback',
  vnp_IpAddr: '192.168.1.1',
  vnp_CreateDate: createDate,
  vnp_ExpireDate: expireDate
};

// Sort parameters
const sortedKeys = Object.keys(vnp_Params).sort();
const sorted = {};
sortedKeys.forEach(k => sorted[k] = vnp_Params[k]);

// Create sign data
const signData = sortedKeys
  .map(key => `${key}=${encodeURIComponent(sorted[key])}`)
  .join('&');

console.log('\n🔐 Sign Data:', signData);
console.log('🔐 Secret:', process.env.VNP_HASH_SECRET);

const variants = testHashVariants(signData, process.env.VNP_HASH_SECRET.trim());

console.log('\n🧪 Test URLs:');
console.log('=============');

const baseUrl = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
const params = new URLSearchParams(sorted);

// Test với từng hash variant
Object.entries(variants).forEach(([method, hash], index) => {
  params.set('vnp_SecureHash', hash);
  const testUrl = `${baseUrl}?${params.toString()}`;
  console.log(`\n${index + 1}. ${method}:`);
  console.log(testUrl);
});

console.log('\n📋 Instructions:');
console.log('1. Copy each URL above');
console.log('2. Test in PRIVATE/INCOGNITO browser');
console.log('3. See which one works (doesn\'t show "Invalid signature")');
console.log('4. Report back which method number worked');

