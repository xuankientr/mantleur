const { PrismaClient } = require('@prisma/client');

// Test external database connection
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function testExternalDB() {
  try {
    console.log('🔌 Testing external database connection...');
    console.log('📍 Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connected successfully!');
    
    // Test query
    const userCount = await prisma.user.count();
    console.log(`📊 Total users: ${userCount}`);
    
    // Test create user
    const testUser = await prisma.user.create({
      data: {
        username: `testuser_${Date.now()}`,
        email: `test_${Date.now()}@example.com`,
        password: 'hashed_password',
        coinBalance: 1000
      }
    });
    console.log('✅ Test user created:', testUser.id);
    
    // Clean up
    await prisma.user.delete({
      where: { id: testUser.id }
    });
    console.log('🧹 Test user cleaned up');
    
    console.log('🎉 External database test completed successfully!');
    
  } catch (error) {
    console.error('❌ External database test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testExternalDB();
