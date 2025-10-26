const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function createFreshAdmin() {
  try {
    console.log('🔧 Creating fresh admin with clear password...');
    
    // Delete existing admin users
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['admin@example.com', 'adminworking@example.com']
        }
      }
    });
    
    console.log('🗑️ Deleted old admin users');
    
    // Hash password with bcryptjs
    const hashedPassword = await bcrypt.hash('admin123', 12);
    console.log('🔐 Password hash:', hashedPassword);
    
    // Create new admin user
    const newAdmin = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        coinBalance: 100000
      }
    });
    
    console.log('✅ Fresh admin created successfully!');
    console.log('👑 Admin details:');
    console.log('  Username:', newAdmin.username);
    console.log('  Email:', newAdmin.email);
    console.log('  Password Hash:', newAdmin.password);
    console.log('  Coins:', newAdmin.coinBalance);
    
    // Test the password
    const isValid = await bcrypt.compare('admin123', newAdmin.password);
    console.log('🧪 Password test:', isValid ? '✅ VALID' : '❌ INVALID');
    
    console.log('\n🎯 LOGIN CREDENTIALS:');
    console.log('  Email: admin@example.com');
    console.log('  Password: admin123');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createFreshAdmin();
