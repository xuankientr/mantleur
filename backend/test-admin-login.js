const fetch = require('node-fetch');

async function testAdminLogin() {
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Admin login successful:');
      console.log('Token:', data.token);
      console.log('User:', data.user);
    } else {
      console.log('❌ Admin login failed:');
      console.log('Status:', response.status);
      console.log('Error:', data);
    }

  } catch (error) {
    console.error('Error testing admin login:', error);
  }
}

testAdminLogin();
