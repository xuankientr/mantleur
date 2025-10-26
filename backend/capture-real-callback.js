const express = require('express');
const app = express();

console.log('🔍 Starting Callback Capture Server');
console.log('=====================================');

// Middleware to parse query parameters
app.use(express.urlencoded({ extended: true }));

// Capture callback endpoint
app.get('/capture', (req, res) => {
  console.log('📥 REAL CALLBACK RECEIVED!');
  console.log('==========================');
  console.log('📥 Raw URL:', req.originalUrl);
  console.log('📥 Query params:', req.query);
  console.log('📥 Query keys:', Object.keys(req.query));
  console.log('📥 Query values:', Object.values(req.query));
  
  // Save to file for analysis
  const fs = require('fs');
  const data = {
    timestamp: new Date().toISOString(),
    url: req.originalUrl,
    query: req.query
  };
  
  fs.writeFileSync('real-callback-data.json', JSON.stringify(data, null, 2));
  console.log('💾 Data saved to real-callback-data.json');
  
  res.send('Callback captured! Check console and real-callback-data.json');
});

app.listen(5001, () => {
  console.log('🚀 Callback capture server running on port 5001');
  console.log('📞 Test URL: http://localhost:5001/capture');
  console.log('📞 Update VNP_RETURN_URL to: http://localhost:5001/capture');
});
