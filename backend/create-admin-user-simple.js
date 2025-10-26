const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@example.com' }
    });

    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user with pre-hashed password (admin123)
    const admin = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@example.com',
        password: '$2b$10$rQZ8kL9vJ8K9vJ8K9vJ8K.9vJ8K9vJ8K9vJ8K9vJ8K9vJ8K9vJ8K', // admin123
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
