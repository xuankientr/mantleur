const { PrismaClient } = require('@prisma/client');

// Use production database URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://mantleur_db_user:RE06BgjMlShICvo4rPIiSGTvZ1jtrDbT@dpg-d3do6codl3ps73c27qlg-a/mantleur_db"
    }
  }
});

async function checkAdminPassword() {
  try {
    console.log('🔍 Checking admin password in production...\n');

    // Check admin user
    const admin = await prisma.user.findFirst({
      where: { username: 'admin' },
      select: {
        id: true,
        username: true,
        email: true,
        password: true,
        coinBalance: true,
        createdAt: true
      }
    });
    
    if (!admin) {
      console.log('❌ Admin user not found in production database');
      return;
    }

    console.log('👑 ADMIN USER:');
    console.log(`  Username: ${admin.username}`);
    console.log(`  Email: ${admin.email}`);
    console.log(`  Password Hash: ${admin.password}`);
    console.log(`  Coins: ${admin.coinBalance}`);
    console.log(`  Created: ${admin.createdAt.toISOString()}`);
    console.log('');

    // Check other users for reference
    console.log('👥 ALL USERS (for reference):');
    const users = await prisma.user.findMany({
      select: {
        username: true,
        email: true,
        password: true
      }
    });
    
    users.forEach(user => {
      console.log(`  - ${user.username} (${user.email})`);
      console.log(`    Password Hash: ${user.password}`);
      console.log('');
    });

    console.log('✅ Password check completed!');

  } catch (error) {
    console.error('❌ Error checking admin password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminPassword();
