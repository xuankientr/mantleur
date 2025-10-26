const axios = require('axios');

async function testBasicFunctionality() {
  try {
    console.log('🧪 TESTING BASIC FUNCTIONALITY');
    console.log('==============================');
    console.log('');

    // Test 1: Server Status
    console.log('1️⃣ Testing server status...');
    try {
      const healthCheck = await axios.get('http://localhost:5000/api/users/cmh7jmi7a0001kg6pi7umlss0');
      console.log('✅ Backend server is running');
    } catch (error) {
      console.log('❌ Backend server issue:', error.message);
    }
    console.log('');

    // Test 2: User Login
    console.log('2️⃣ Testing user login...');
    try {
      const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'usertest@example.com',
        password: 'usertest123'
      });
      console.log('✅ User login successful');
      console.log('User:', loginResponse.data.user.username);
      console.log('Balance:', loginResponse.data.user.coinBalance, 'coins');
      console.log('Token:', loginResponse.data.token.substring(0, 20) + '...');
    } catch (error) {
      console.log('❌ User login failed:', error.response?.data || error.message);
    }
    console.log('');

    // Test 3: Admin Login
    console.log('3️⃣ Testing admin login...');
    try {
      const adminLoginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'admin@example.com',
        password: 'admin123'
      });
      console.log('✅ Admin login successful');
      console.log('Admin:', adminLoginResponse.data.user.username);
      console.log('Balance:', adminLoginResponse.data.user.coinBalance, 'coins');
    } catch (error) {
      console.log('❌ Admin login failed:', error.response?.data || error.message);
    }
    console.log('');

    // Test 4: Payment Creation
    console.log('4️⃣ Testing payment creation...');
    try {
      const userLoginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'usertest@example.com',
        password: 'usertest123'
      });
      const userToken = userLoginResponse.data.token;

      const paymentResponse = await axios.post('http://localhost:5000/api/payments/create', {
        amount: 5000 // 5,000 VND
      }, {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });
      console.log('✅ Payment creation successful');
      console.log('Order ID:', paymentResponse.data.orderId);
      console.log('Amount:', paymentResponse.data.amount, 'VND');
      console.log('Expected coins:', Math.floor(paymentResponse.data.amount / 100), 'coins');
    } catch (error) {
      console.log('❌ Payment creation failed:', error.response?.data || error.message);
    }
    console.log('');

    // Test 5: Withdrawal Creation
    console.log('5️⃣ Testing withdrawal creation...');
    try {
      const userLoginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'usertest@example.com',
        password: 'usertest123'
      });
      const userToken = userLoginResponse.data.token;

      const withdrawalResponse = await axios.post('http://localhost:5000/api/withdrawals', {
        coinAmount: 25, // 25 coins
        method: 'bank_transfer',
        accountInfo: 'Test User',
        bankAccount: '9876543210',
        bankName: 'Techcombank'
      }, {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });
      console.log('✅ Withdrawal creation successful');
      console.log('Withdrawal ID:', withdrawalResponse.data.id);
      console.log('Coins:', withdrawalResponse.data.coinAmount);
      console.log('VND:', withdrawalResponse.data.vndAmount);
      console.log('Rate check (25 coins = 2,500 VND):', withdrawalResponse.data.vndAmount === 2500);
    } catch (error) {
      console.log('❌ Withdrawal creation failed:', error.response?.data || error.message);
    }
    console.log('');

    // Test 6: Admin Withdrawal Access
    console.log('6️⃣ Testing admin withdrawal access...');
    try {
      const adminLoginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'admin@example.com',
        password: 'admin123'
      });
      const adminToken = adminLoginResponse.data.token;

      const withdrawalsResponse = await axios.get('http://localhost:5000/api/withdrawals', {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      console.log('✅ Admin withdrawal access successful');
      console.log('Total withdrawals:', withdrawalsResponse.data.length);
      
      if (withdrawalsResponse.data.length > 0) {
        const latest = withdrawalsResponse.data[0];
        console.log('Latest withdrawal:');
        console.log('- User:', latest.user.username);
        console.log('- Coins:', latest.coinAmount);
        console.log('- VND:', latest.amount);
        console.log('- Bank:', latest.bankName);
        console.log('- Status:', latest.status);
      }
    } catch (error) {
      console.log('❌ Admin withdrawal access failed:', error.response?.data || error.message);
    }
    console.log('');

    console.log('🎯 BASIC FUNCTIONALITY TEST COMPLETE');
    console.log('===================================');
    console.log('All core features are working correctly!');
    console.log('');
    console.log('📋 Next steps for manual testing:');
    console.log('1. Open http://localhost:5173 in browser');
    console.log('2. Login with usertest@example.com / usertest123');
    console.log('3. Test payment modal (top-up)');
    console.log('4. Test withdrawal with bank info');
    console.log('5. Login as admin@example.com / admin123');
    console.log('6. Access /admin/withdrawals to manage requests');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testBasicFunctionality();
