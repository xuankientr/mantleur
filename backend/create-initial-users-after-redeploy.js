const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function createInitialUsers() {
  try {
    console.log('🚀 Creating initial users after database redeploy...');
    
    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 12);
    const userPassword = await bcrypt.hash('password123', 12);
    
    // Create admin user
    const admin = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@example.com',
        password: adminPassword,
        coinBalance: 100000
      }
    });
    
    // Create test user
    const testUser = await prisma.user.create({
      data: {
        username: 'testuser',
        email: 'testuser@gmail.com',
        password: userPassword,
        coinBalance: 1000
      }
    });
    
    console.log('✅ Users created successfully!');
    console.log('\n👑 ADMIN CREDENTIALS:');
    console.log('  Email: admin@example.com');
    console.log('  Password: admin123');
    console.log('\n👤 TEST USER CREDENTIALS:');
    console.log('  Email: testuser@gmail.com');
    console.log('  Password: password123');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createInitialUsers();
