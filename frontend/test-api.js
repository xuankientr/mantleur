// Test API endpoint directly
async function testAPI() {
  try {
    console.log('🧪 Testing API endpoint...');
    
    const response = await fetch('/api/users/add-coins', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        amount: 100
      })
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const text = await response.text();
    console.log('📡 Response text:', text);
    
    try {
      const json = JSON.parse(text);
      console.log('📡 Response JSON:', json);
    } catch (e) {
      console.log('📡 Response is not JSON');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

// Run test
testAPI();



