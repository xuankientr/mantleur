require('dotenv').config({ path: './env.local' });
const crypto = require('crypto');

console.log('🔍 Testing Hash Verification with REAL VNPay Data');
console.log('==================================================');

// Real callback data from VNPay
const realCallbackData = {
  vnp_Amount: '5000000',
  vnp_BankCode: 'NCB',
  vnp_BankTranNo: 'VNP15219501',
  vnp_CardType: 'ATM',
  vnp_OrderInfo: 'Nap tien vao tai khoan',
  vnp_PayDate: '20251026161938',
  vnp_ResponseCode: '00',
  vnp_TmnCode: '7DZ9914S',
  vnp_TransactionNo: '15219501',
  vnp_TransactionStatus: '00',
  vnp_TxnRef: 'DEPOSIT_cmh7c945r0000vjezw3g4omwp_1761470292984',
  vnp_SecureHash: '1284e8f007f385b7904f0e7faed9ed09f599244624ce5f7d7744dcc71ef4b736d9318e67248bce9a95ba2874c4833cb74bf70c7c7936d6111553b32bfcf9b185'
};

console.log('📥 Real Callback Data:', realCallbackData);

// Extract received secure hash
const receivedSecureHash = realCallbackData.vnp_SecureHash.toUpperCase();
console.log('🔐 Received SecureHash:', receivedSecureHash);

// Remove secure hash fields before recomputing
const vnp_Params = { ...realCallbackData };
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
  
  // Method 1: Raw string (no encoding)
  const rawSignData = sortedKeys
    .map(key => `${key}=${sorted[key]}`)
    .join('&');
  const hash1 = crypto.createHmac('sha512', secret)
    .update(Buffer.from(rawSignData, 'utf-8'))
    .digest('hex')
    .toUpperCase();
  console.log('1. Raw string:', hash1, hash1 === receivedSecureHash ? '✅' : '❌');
  
  // Method 2: Direct string (no Buffer)
  const hash2 = crypto.createHmac('sha512', secret)
    .update(signData, 'utf-8')
    .digest('hex')
    .toUpperCase();
  console.log('2. Direct string:', hash2, hash2 === receivedSecureHash ? '✅' : '❌');
  
  // Method 3: Different encoding
  const signData3 = sortedKeys
    .map(key => `${key}=${sorted[key]}`)
    .join('&')
    .replace(/ /g, '+');
  const hash3 = crypto.createHmac('sha512', secret)
    .update(Buffer.from(signData3, 'utf-8'))
    .digest('hex')
    .toUpperCase();
  console.log('3. Spaces as +:', hash3, hash3 === receivedSecureHash ? '✅' : '❌');
}
