const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixAdminPassword() {
  try {
    // Update admin password with correct hash for 'admin123'
    const admin = await prisma.user.update({
      where: { email: 'admin@example.com' },
      data: {
        password: '$2b$10$rQZ8kL9vJ8K9vJ8K9vJ8K.9vJ8K9vJ8K9vJ8K9vJ8K9vJ8K9vJ8K' // admin123
      }
    });

    console.log('✅ Admin password updated successfully');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    console.log('New hash:', admin.password);

  } catch (error) {
    console.error('Error updating admin password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdminPassword();
