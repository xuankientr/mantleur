const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('Testing payment API with valid token...');
    
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWg0b3JrYm0wMDAwbHJuNjdoeGZsbnU2IiwiaWF0IjoxNzYxNDU1OTAwLCJleHAiOjE3NjE1NDIzMDB9.s_XRPsVB-gj5E6pyQsQyEVcMkC5txx_CMs4lTis7L2s';
    
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

testAPI();


