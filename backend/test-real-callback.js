require('dotenv').config({ path: './env.local' });
const http = require('http');

console.log('🧪 Testing VNPay Callback with Real Data');
console.log('==========================================');

// Test with real callback data from VNPay
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

const queryString = Object.keys(callbackData)
  .map(key => `${key}=${encodeURIComponent(callbackData[key])}`)
  .join('&');

const testUrl = `http://localhost:5000/api/payments/return?${queryString}`;
console.log('📞 Testing URL:', testUrl);

// Make request
const options = {
  method: 'GET',
  headers: {
    'User-Agent': 'VNPay-Callback-Test',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
  }
};

const req = http.request(testUrl, options, (res) => {
  console.log('📊 Response Status:', res.statusCode);
  console.log('📊 Response Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📊 Response Body:', data);
    console.log('📊 Redirect Location:', res.headers.location);
    
    if (res.statusCode === 302 && res.headers.location) {
      console.log('✅ Redirect detected to:', res.headers.location);
    } else {
      console.log('❌ No redirect detected');
    }
  });
});

req.on('error', (err) => {
  console.error('❌ Request Error:', err.message);
});

req.end();

