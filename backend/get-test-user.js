const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

async function getTestUser() {
  try {
    // Lấy user test
    const user = await prisma.user.findFirst({
      where: {
        username: 'testuser'
      }
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('✅ User found:', user);

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

getTestUser();


