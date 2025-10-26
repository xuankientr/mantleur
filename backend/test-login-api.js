const axios = require('axios');

async function testLoginAPI() {
  try {
    console.log('🧪 Testing login API...\n');
    
    const loginData = {
      username: 'admin',
      password: 'admin123'
    };
    
    console.log('📤 Sending login request:');
    console.log(`  URL: https://mantleur.onrender.com/api/auth/login`);
    console.log(`  Data:`, loginData);
    console.log('');
    
    const response = await axios.post('https://mantleur.onrender.com/api/auth/login', loginData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Login successful!');
    console.log(`  Status: ${response.status}`);
    console.log(`  Token: ${response.data.token ? 'Present' : 'Missing'}`);
    console.log(`  User: ${response.data.user ? response.data.user.username : 'Missing'}`);
    
    if (response.data.token) {
      console.log(`\n🔑 Token: ${response.data.token}`);
    }
    
  } catch (error) {
    console.log('❌ Login failed!');
    console.log(`  Status: ${error.response ? error.response.status : 'No response'}`);
    console.log(`  Message: ${error.response ? error.response.data.message : error.message}`);
    
    if (error.response && error.response.data) {
      console.log(`  Data:`, error.response.data);
    }
  }
}

testLoginAPI();
