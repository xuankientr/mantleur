const jwt = require('jsonwebtoken');

// Tạo token cho user mới
const token = jwt.sign(
  { userId: 'cmh7c945r0000vjezw3g4omwp' },
  process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
  { expiresIn: '24h' }
);

console.log('✅ Token for new user:');
console.log(token);

