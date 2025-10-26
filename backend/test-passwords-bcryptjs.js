const bcrypt = require('bcryptjs');

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

async function testPasswordsWithBcryptjs() {
  console.log('🧪 Testing admin passwords with bcryptjs...\n');
  
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

testPasswordsWithBcryptjs();
