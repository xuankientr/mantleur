const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function setupProductionDatabase() {
  try {
    console.log('🚀 Setting up production database...');
    console.log('');

    // 1. Create admin user
    console.log('1️⃣ Creating admin user...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {
        username: 'admin',
        password: adminPassword,
        coinBalance: 100000
      },
      create: {
        username: 'admin',
        email: 'admin@example.com',
        password: adminPassword,
        coinBalance: 100000
      },
    });
    console.log('✅ Admin user created/updated');
    console.log('Username:', adminUser.username);
    console.log('Email:', adminUser.email);
    console.log('Password: admin123');
    console.log('Coins:', adminUser.coinBalance);
    console.log('');

    // 2. Create test user
    console.log('2️⃣ Creating test user...');
    const testUserPassword = await bcrypt.hash('usertest123', 10);
    const testUser = await prisma.user.upsert({
      where: { email: 'usertest@example.com' },
      update: {
        username: 'usertest',
        password: testUserPassword,
        coinBalance: 10000
      },
      create: {
        username: 'usertest',
        email: 'usertest@example.com',
        password: testUserPassword,
        coinBalance: 10000
      },
    });
    console.log('✅ Test user created/updated');
    console.log('Username:', testUser.username);
    console.log('Email:', testUser.email);
    console.log('Password: usertest123');
    console.log('Coins:', testUser.coinBalance);
    console.log('');

    // 3. Check database tables
    console.log('3️⃣ Checking database tables...');
    const userCount = await prisma.user.count();
    const transactionCount = await prisma.transaction.count();
    const withdrawalCount = await prisma.withdrawal.count();
    
    console.log('✅ Database tables ready');
    console.log('Users:', userCount);
    console.log('Transactions:', transactionCount);
    console.log('Withdrawals:', withdrawalCount);
    console.log('');

    console.log('🎉 Production database setup complete!');
    console.log('');
    console.log('📋 Login credentials:');
    console.log('Admin: admin@example.com / admin123');
    console.log('User: usertest@example.com / usertest123');
    console.log('');
    console.log('🔧 Features ready:');
    console.log('- VNPay payment integration');
    console.log('- Withdrawal system with bank info');
    console.log('- Admin panel for withdrawal management');
    console.log('- Exchange rate: 100 VND = 1 Coin');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupProductionDatabase();
