const axios = require('axios');

async function testRouteDirect() {
  try {
    console.log('🔍 Testing route directly...');

    // Login as admin first
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@example.com',
      password: 'admin123'
    });
    const token = loginResponse.data.token;

    // Get withdrawals to get an ID
    const withdrawalsResponse = await axios.get('http://localhost:5000/api/withdrawals', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const withdrawalId = withdrawalsResponse.data[0].id;
    console.log('Testing with withdrawal ID:', withdrawalId);

    // Test the route
    const updateResponse = await axios.put(`http://localhost:5000/api/withdrawals/${withdrawalId}/status`, {
      status: 'approved',
      adminNote: 'Test approval'
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('✅ Route works! Response:', updateResponse.data);

  } catch (error) {
    console.error('❌ Route error:', error.response?.status, error.response?.data);
  }
}

testRouteDirect();
