const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Tạo user test
    const user = await prisma.user.create({
      data: {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123', // Trong thực tế nên hash
        coinBalance: 0
      }
    });

    console.log('✅ User created:', user);

    // Tạo token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
      { expiresIn: '24h' }
    );

    console.log('✅ Token:', token);
    console.log('✅ User ID:', user.id);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();


