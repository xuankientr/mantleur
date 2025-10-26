const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Delete existing test user if exists
    await prisma.user.deleteMany({
      where: { email: 'usertest@example.com' }
    });

    // Hash password with bcrypt
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash('usertest123', saltRounds);

    // Create test user
    const user = await prisma.user.create({
      data: {
        username: 'usertest',
        email: 'usertest@example.com',
        password: hashedPassword,
        coinBalance: 10000 // 10,000 coins for testing
      }
    });

    console.log('✅ Test user created successfully:');
    console.log('Username: usertest');
    console.log('Email: usertest@example.com');
    console.log('Password: usertest123');
    console.log('Coins: 10,000');
    console.log('ID:', user.id);

  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
