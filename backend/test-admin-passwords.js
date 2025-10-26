const bcrypt = require('bcrypt');

const adminHash = '$2b$12$aDJgcl/XhOQJgTaKRywoe..Vy6iaUhpeJet22m12bkgJxPSafkhii';

const passwordsToTest = [
  'admin123',
  'admin',
  'password',
  'password123',
  '123456',
  'admin@123',
  'Admin123',
  'ADMIN123'
];

async function testPasswords() {
  console.log('🧪 Testing admin passwords...\n');
  
  for (const password of passwordsToTest) {
    try {
      const match = await bcrypt.compare(password, adminHash);
      console.log(`Password: "${password}" - ${match ? '✅ MATCH' : '❌ NO MATCH'}`);
      
      if (match) {
        console.log(`\n🎉 FOUND CORRECT PASSWORD: "${password}"`);
        break;
      }
    } catch (error) {
      console.log(`Password: "${password}" - ❌ ERROR: ${error.message}`);
    }
  }
  
  console.log('\n✅ Password testing completed!');
}

testPasswords();
