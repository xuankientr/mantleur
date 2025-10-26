const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createNewUser() {
  try {
    // Tạo user mới với password đã hash sẵn
    const user = await prisma.user.create({
      data: {
        username: 'testuser2',
        email: 'test2@example.com',
        password: '$2a$12$IH2Gd.Tgz/0B1ohsanTcnuq.MC7Q5ZpXJfoxk0Ovk7K8/qqhpor3y', // 123456
        coinBalance: 0
      }
    });

    console.log('✅ User created successfully:');
    console.log('Username:', user.username);
    console.log('Email:', user.email);
    console.log('Password: 123456');
    console.log('User ID:', user.id);
    console.log('Coins:', user.coinBalance);

  } catch (error) {
    if (error.code === 'P2002') {
      console.log('❌ User already exists with this email or username');
    } else {
      console.error('Error:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createNewUser();
