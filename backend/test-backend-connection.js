// Test script to check if backend is running
const axios = require('axios');

async function testBackend() {
  try {
    console.log('🔌 Testing backend connection...');
    
    // Test basic endpoint
    const response = await axios.get('https://mantleur-backend.onrender.com/api/payments/return', {
      timeout: 10000,
      params: {
        vnp_Amount: '100000',
        vnp_BankCode: 'NCB',
        vnp_BankTranNo: 'VNP14155555',
        vnp_CardType: 'ATM',
        vnp_OrderInfo: 'Nap tien vao tai khoan',
        vnp_PayDate: '20231201120000',
        vnp_ResponseCode: '00',
        vnp_TmnCode: '2QXUI4J4',
        vnp_TransactionNo: '14155555',
        vnp_TransactionStatus: '00',
        vnp_TxnRef: 'ORDER_12345',
        vnp_SecureHash: 'test_hash'
      }
    });
    
    console.log('✅ Backend is running!');
    console.log('Status:', response.status);
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('❌ Backend test failed:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('🔧 Backend is not running or not accessible');
    } else if (error.response?.status === 404) {
      console.log('🔧 Route not found - backend might not be deployed');
    } else if (error.response?.status === 500) {
      console.log('🔧 Backend error - check logs');
    }
  }
}

testBackend();
