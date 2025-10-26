// Test database connection and migration
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function testDatabaseAndMigration() {
  try {
    console.log('🔌 Testing database connection...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connected successfully!');
    
    // Test if tables exist
    const userCount = await prisma.user.count();
    console.log(`📊 Users table exists - ${userCount} users`);
    
    const streamCount = await prisma.stream.count();
    console.log(`📊 Streams table exists - ${streamCount} streams`);
    
    const transactionCount = await prisma.transaction.count();
    console.log(`📊 Transactions table exists - ${transactionCount} transactions`);
    
    const withdrawalCount = await prisma.withdrawal.count();
    console.log(`📊 Withdrawals table exists - ${withdrawalCount} withdrawals`);
    
    const donationCount = await prisma.donation.count();
    console.log(`📊 Donations table exists - ${donationCount} donations`);
    
    console.log('🎉 Database schema is ready!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    
    if (error.code === 'P2021') {
      console.log('🔧 Database tables do not exist - need migration');
    } else if (error.code === 'P1001') {
      console.log('🔧 Cannot connect to database - check DATABASE_URL');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseAndMigration();
