const axios = require('axios');

async function testAdminLogin() {
  try {
    console.log('🔐 Testing admin login for frontend...');

    // Test admin login
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@example.com',
      password: 'admin123'
    });

    console.log('✅ Admin login successful');
    console.log('Token:', loginResponse.data.token.substring(0, 50) + '...');
    console.log('User:', loginResponse.data.user);

    // Test if admin can access withdrawals
    const withdrawalsResponse = await axios.get('http://localhost:5000/api/withdrawals', {
      headers: {
        'Authorization': `Bearer ${loginResponse.data.token}`
      }
    });

    console.log(`📊 Admin can access ${withdrawalsResponse.data.length} withdrawals`);

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testAdminLogin();
