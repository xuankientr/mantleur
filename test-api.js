const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('Testing payment API...');
    
    const response = await fetch('http://localhost:5000/api/payments/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid-token'
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


