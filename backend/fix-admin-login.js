const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function fixAdminLogin() {
  try {
    console.log('🔧 Fixing admin login...');
    
    // Hash password with bcryptjs
    const hashedPassword = await bcrypt.hash('admin123', 12);
    console.log('🔐 New password hash:', hashedPassword);
    
    // Update admin user
    const updatedAdmin = await prisma.user.update({
      where: { email: 'admin@example.com' },
      data: {
        password: hashedPassword,
        username: 'admin'
      }
    });
    
    console.log('✅ Admin updated successfully!');
    console.log('👑 Admin details:');
    console.log('  Username:', updatedAdmin.username);
    console.log('  Email:', updatedAdmin.email);
    console.log('  Password Hash:', updatedAdmin.password);
    
    // Test the password
    const isValid = await bcrypt.compare('admin123', updatedAdmin.password);
    console.log('🧪 Password test:', isValid ? '✅ VALID' : '❌ INVALID');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdminLogin();
