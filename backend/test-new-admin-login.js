const axios = require('axios');

async function testNewAdminLogin() {
  try {
    console.log('🧪 Testing new admin login...');
    
    const response = await axios.post('https://mantleur.onrender.com/api/auth/login', {
      email: 'adminworking@example.com',
      password: 'admin123'
    });
    
    console.log('✅ Login successful!');
    console.log('👑 User:', response.data.user);
    console.log('🔑 Token:', response.data.token.substring(0, 20) + '...');
    
  } catch (error) {
    console.log('❌ Login failed!');
    console.log('Status:', error.response?.status);
    console.log('Message:', error.response?.data);
  }
}

testNewAdminLogin();
