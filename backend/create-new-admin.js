const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Use production database URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://mantleur_db_user:RE06BgjMlShICvo4rPIiSGTvZ1jtrDbT@dpg-d3do6codl3ps73c27qlg-a/mantleur_db"
    }
  }
});

async function createNewAdmin() {
  try {
    console.log('🔧 Creating new admin user...\n');

    // Check if admin exists
    const existingAdmin = await prisma.user.findFirst({
      where: { username: 'admin' }
    });

    if (existingAdmin) {
      console.log('❌ Admin user already exists, updating password...');
      
      // Update password with new hash
      const newPassword = 'admin123';
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      
      const updatedAdmin = await prisma.user.update({
        where: { id: existingAdmin.id },
        data: { password: hashedPassword },
        select: {
          id: true,
          username: true,
          email: true,
          coinBalance: true
        }
      });
      
      console.log('✅ Admin password updated!');
      console.log(`  Username: ${updatedAdmin.username}`);
      console.log(`  Email: ${updatedAdmin.email}`);
      console.log(`  Coins: ${updatedAdmin.coinBalance}`);
      console.log(`  New Password: admin123`);
      
    } else {
      console.log('❌ Admin user not found, creating new one...');
      
      // Create new admin
      const newPassword = 'admin123';
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      
      const newAdmin = await prisma.user.create({
        data: {
          username: 'admin',
          email: 'admin@example.com',
          password: hashedPassword,
          coinBalance: 100000
        },
        select: {
          id: true,
          username: true,
          email: true,
          coinBalance: true
        }
      });
      
      console.log('✅ New admin user created!');
      console.log(`  Username: ${newAdmin.username}`);
      console.log(`  Email: ${newAdmin.email}`);
      console.log(`  Coins: ${newAdmin.coinBalance}`);
      console.log(`  Password: admin123`);
    }

    console.log('\n✅ Admin setup completed!');

  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createNewAdmin();
