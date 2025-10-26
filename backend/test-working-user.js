const axios = require('axios');

async function testWorkingUser() {
  try {
    console.log('🧪 Testing working user login...');
    
    const response = await axios.post('https://mantleur.onrender.com/api/auth/login', {
      email: 'testuser@gmail.com',
      password: 'password123'
    });
    
    console.log('✅ Login successful!');
    console.log('👤 User:', response.data.user);
    console.log('🔑 Token:', response.data.token.substring(0, 20) + '...');
    
  } catch (error) {
    console.log('❌ Login failed!');
    console.log('Status:', error.response?.status);
    console.log('Message:', error.response?.data);
  }
}

testWorkingUser();
