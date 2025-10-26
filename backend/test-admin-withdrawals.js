const axios = require('axios');

async function testAdminWithdrawals() {
  try {
    console.log('🔐 Testing admin withdrawals access...');

    // First, login as admin to get token
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@example.com',
      password: 'admin123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Admin login successful');

    // Now fetch withdrawals
    const withdrawalsResponse = await axios.get('http://localhost:5000/api/withdrawals', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const withdrawals = withdrawalsResponse.data;
    console.log(`📊 Admin can see ${withdrawals.length} withdrawal requests:`);
    console.log('');

    withdrawals.forEach((withdrawal, index) => {
      console.log(`${index + 1}. ID: ${withdrawal.id}`);
      console.log(`   User: ${withdrawal.user.username} (${withdrawal.user.email})`);
      console.log(`   Coins: ${withdrawal.coinAmount}`);
      console.log(`   VNĐ: ${withdrawal.amount.toLocaleString()}`);
      console.log(`   Method: ${withdrawal.method}`);
      console.log(`   Status: ${withdrawal.status}`);
      console.log(`   Account: ${withdrawal.accountName}`);
      console.log(`   Created: ${new Date(withdrawal.createdAt).toLocaleString()}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error testing admin withdrawals:', error.response?.data || error.message);
  }
}

testAdminWithdrawals();
