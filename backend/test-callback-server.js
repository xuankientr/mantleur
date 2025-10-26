require('dotenv').config({ path: './env.local' });
const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.urlencoded({ extended: true }));

// Test callback endpoint để capture VNPay logs
app.get('/test-callback', (req, res) => {
  console.log('📥 VNPay Callback Received!');
  console.log('📥 Raw URL:', req.originalUrl);
  console.log('📥 Query params:', req.query);
  
  // Copy params để không mutate req.query
  const vnp_Params = { ...req.query };
  
  // Extract received secure hash
  const receivedSecureHash = (vnp_Params['vnp_SecureHash'] || '').toUpperCase();
  console.log('🔐 Received SecureHash:', receivedSecureHash);
  
  // Remove secure hash fields before recomputing
  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];
  
  // Sort keys A-Z
  const sortedKeys = Object.keys(vnp_Params).sort();
  const sorted = {};
  sortedKeys.forEach(k => sorted[k] = vnp_Params[k]);
  
  // Build signData using encodeURIComponent on each value
  const signData = sortedKeys
    .map(key => `${key}=${encodeURIComponent(sorted[key])}`)
    .join('&');
  
  console.log('🔐 Sign Data:', signData);
  
  // Generate hash
  const secret = process.env.VNP_HASH_SECRET.trim();
  const signed = crypto.createHmac('sha512', secret)
    .update(Buffer.from(signData, 'utf-8'))
    .digest('hex')
    .toUpperCase();
  
  console.log('🔐 My Hash:', signed);
  
  // Compare
  const match = receivedSecureHash === signed;
  console.log('🔐 Hash Match:', match ? '✅ YES' : '❌ NO');
  
  if (!match) {
    console.log('❌ Expected:', signed);
    console.log('❌ Received:', receivedSecureHash);
  }
  
  res.send(`
    <h1>VNPay Callback Test</h1>
    <h2>Logs captured in server console</h2>
    <p>Check your terminal for the 3 key logs:</p>
    <ul>
      <li>🔐 Sign Data: [raw string for hashing]</li>
      <li>🔐 My Hash: [generated hash]</li>
      <li>🔐 Received SecureHash: [from VNPay]</li>
    </ul>
    <p>Hash Match: ${match ? '✅ YES' : '❌ NO'}</p>
  `);
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`🧪 Test callback server running on port ${PORT}`);
  console.log(`🔗 Test URL: http://localhost:${PORT}/test-callback`);
  console.log('');
  console.log('📋 Instructions:');
  console.log('1. Update VNP_RETURN_URL to: http://localhost:5001/test-callback');
  console.log('2. Generate new payment URL');
  console.log('3. Test payment in browser');
  console.log('4. Check logs for the 3 key lines');
});

