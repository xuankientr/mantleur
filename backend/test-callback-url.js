const http = require('http');

console.log('🧪 Testing VNPay Callback URL');
console.log('==============================');

// Test callback URL
const testUrl = 'http://localhost:5000/api/payments/return';

// Simulate callback data
const callbackParams = new URLSearchParams({
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
});

const fullUrl = `${testUrl}?${callbackParams.toString()}`;
console.log('📞 Testing URL:', fullUrl);

// Make request
const options = {
  method: 'GET',
  headers: {
    'User-Agent': 'VNPay-Callback-Test'
  }
};

const req = http.request(fullUrl, options, (res) => {
  console.log('📊 Response Status:', res.statusCode);
  console.log('📊 Response Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📊 Response Body:', data);
    console.log('📊 Redirect Location:', res.headers.location);
  });
});

req.on('error', (err) => {
  console.error('❌ Request Error:', err.message);
});

req.end();

