const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAdminUser() {
  try {
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@example.com' },
      select: {
        id: true,
        username: true,
        email: true,
        password: true,
        coinBalance: true
      }
    });

    if (admin) {
      console.log('✅ Admin user found:');
      console.log('ID:', admin.id);
      console.log('Username:', admin.username);
      console.log('Email:', admin.email);
      console.log('Password hash:', admin.password);
      console.log('Coins:', admin.coinBalance);
    } else {
      console.log('❌ Admin user not found');
    }

  } catch (error) {
    console.error('Error checking admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminUser();
