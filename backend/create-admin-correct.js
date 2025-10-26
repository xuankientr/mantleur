const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Delete existing admin if exists
    await prisma.user.deleteMany({
      where: { email: 'admin@example.com' }
    });

    // Create admin user with correct bcrypt hash for 'admin123'
    const admin = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@example.com',
        password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // admin123
        coinBalance: 1000000 // 1 million coins for admin
      }
    });

    console.log('✅ Admin user created successfully:');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    console.log('Coins: 1,000,000');
    console.log('ID:', admin.id);

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
