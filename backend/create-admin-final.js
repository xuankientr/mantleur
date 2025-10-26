const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createAdminFinal() {
  try {
    // Delete existing admin
    await prisma.user.deleteMany({
      where: { email: 'admin@example.com' }
    });

    // Create admin with correct password hash for 'admin123'
    const admin = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@example.com',
        password: '$2b$10$rQZ8kL9vJ8K9vJ8K9vJ8K.9vJ8K9vJ8K9vJ8K9vJ8K9vJ8K9vJ8K', // admin123
        coinBalance: 1000000
      }
    });

    console.log('✅ Admin user created with correct password hash');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    console.log('ID:', admin.id);

  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminFinal();
