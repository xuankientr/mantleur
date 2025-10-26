const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdminBcrypt() {
  try {
    // Delete existing admin
    await prisma.user.deleteMany({
      where: { email: 'admin@example.com' }
    });

    // Hash password with bcrypt
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash('admin123', saltRounds);

    // Create admin with correct password hash
    const admin = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        coinBalance: 1000000
      }
    });

    console.log('✅ Admin user created with bcrypt hash');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    console.log('Hash:', hashedPassword);
    console.log('ID:', admin.id);

  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminBcrypt();
