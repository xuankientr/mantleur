const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createInitialAccounts() {
  try {
    console.log('🚀 Creating initial accounts...');

    // Delete existing accounts
    await prisma.user.deleteMany({
      where: { 
        OR: [
          { email: 'admin@example.com' },
          { email: 'usertest@example.com' }
        ]
      }
    });

    // Hash passwords
    const saltRounds = 12;
    const adminPassword = await bcrypt.hash('admin123', saltRounds);
    const userPassword = await bcrypt.hash('usertest123', saltRounds);

    // Create admin account
    const admin = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@example.com',
        password: adminPassword,
        coinBalance: 100000 // 100,000 coins for admin
      }
    });

    // Create test user account
    const user = await prisma.user.create({
      data: {
        username: 'usertest',
        email: 'usertest@example.com',
        password: userPassword,
        coinBalance: 10000 // 10,000 coins for test user
      }
    });

    console.log('✅ Initial accounts created successfully:');
    console.log('');
    console.log('🔑 ADMIN ACCOUNT:');
    console.log('Username: admin');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    console.log('Coins: 100,000');
    console.log('ID:', admin.id);
    console.log('');
    console.log('👤 TEST USER ACCOUNT:');
    console.log('Username: usertest');
    console.log('Email: usertest@example.com');
    console.log('Password: usertest123');
    console.log('Coins: 10,000');
    console.log('ID:', user.id);
    console.log('');
    console.log('🎯 You can now:');
    console.log('- Login as admin to access Admin Panel');
    console.log('- Login as usertest to test payment features');

  } catch (error) {
    console.error('❌ Error creating initial accounts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createInitialAccounts();
