require('dotenv').config({ path: './env.local' });
const crypto = require('crypto');

console.log('🔍 Debug VNPay Callback Hash Verification');
console.log('==========================================');

// Simulate callback data from VNPay (from your successful test)
const callbackData = {
  vnp_Amount: '5000000',
  vnp_BankCode: 'NCB',
  vnp_BankTranNo: 'VNP15219346',
  vnp_CardType: 'ATM',
  vnp_OrderInfo: 'Nap tien vao tai khoan',
  vnp_PayDate: '20251026145627',
  vnp_ResponseCode: '00',
  vnp_TmnCode: '7DZ9914S',
  vnp_TransactionNo: '15219346',
  vnp_TransactionStatus: '00',
  vnp_TxnRef: 'DEPOSIT_test123_1761462982024',
  vnp_SecureHash: '90f7af6c5af29d6e6df7124c6e13e8234043439e1aacf9de23c0f634e9f3b634f8b3582a70c75da9eaf24424642125fea45a8d5c01db679513b507a0128fbf6f'
};

console.log('📥 Callback Data:', callbackData);

// Extract received secure hash
const receivedSecureHash = callbackData.vnp_SecureHash.toUpperCase();
console.log('🔐 Received SecureHash:', receivedSecureHash);

// Remove secure hash fields before recomputing
const vnp_Params = { ...callbackData };
delete vnp_Params.vnp_SecureHash;
delete vnp_Params.vnp_SecureHashType;

// Sort keys A-Z
const sortedKeys = Object.keys(vnp_Params).sort();
const sorted = {};
sortedKeys.forEach(k => sorted[k] = vnp_Params[k]);

console.log('🔐 Sorted params:', sorted);

// Build signData using encodeURIComponent on each value, then replace %20 with +
const signData = sortedKeys
  .map(key => `${key}=${encodeURIComponent(sorted[key])}`)
  .join('&')
  .replace(/%20/g, '+');

console.log('🔐 Sign Data:', signData);

// Generate hash
const secret = process.env.VNP_HASH_SECRET.trim();
console.log('🔐 Secret:', secret);

const signed = crypto.createHmac('sha512', secret)
  .update(Buffer.from(signData, 'utf-8'))
  .digest('hex')
  .toUpperCase();

console.log('🔐 Generated Hash:', signed);

// Compare
const match = receivedSecureHash === signed;
console.log('🔐 Hash Match:', match ? '✅ YES' : '❌ NO');

if (!match) {
  console.log('❌ Expected:', signed);
  console.log('❌ Received:', receivedSecureHash);
  
  // Try alternative methods
  console.log('\n🧪 Testing alternative methods:');
  
  // Method 1: Raw string
  const rawSignData = sortedKeys
    .map(key => `${key}=${sorted[key]}`)
    .join('&');
  const hash1 = crypto.createHmac('sha512', secret)
    .update(Buffer.from(rawSignData, 'utf-8'))
    .digest('hex')
    .toUpperCase();
  console.log('1. Raw string:', hash1, hash1 === receivedSecureHash ? '✅' : '❌');
  
  // Method 2: Direct string
  const hash2 = crypto.createHmac('sha512', secret)
    .update(signData, 'utf-8')
    .digest('hex')
    .toUpperCase();
  console.log('2. Direct string:', hash2, hash2 === receivedSecureHash ? '✅' : '❌');
}

