const fetch = require('node-fetch');

async function testNewUserAPI() {
  try {
    console.log('Testing payment API with new user...');
    
    // Token cho user mới: cmh7c945r0000vjezw3g4omwp
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWg3Yzk0NXIwMDAwdmpleenczZzRvbXdwIiwiaWF0IjoxNzYxNDYwOTQzLCJleHAiOjE3NjE1NDczNDN9.SJ_sRmMh6-vyNLOIf987cZ3HE5kMbcb-CBLuFykXuj4';
    
    const response = await fetch('http://localhost:5000/api/payments/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ amount: 50000 })
    });
    
    const data = await response.text();
    console.log('Status:', response.status);
    console.log('Response:', data);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testNewUserAPI();
