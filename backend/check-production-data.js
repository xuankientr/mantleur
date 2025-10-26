const { PrismaClient } = require('@prisma/client');

// Use production database URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://mantleur_db_user:RE06BgjMlShICvo4rPIiSGTvZ1jtrDbT@dpg-d3do6codl3ps73c27qlg-a/mantleur_db"
    }
  }
});

async function checkProductionData() {
  try {
    console.log('🔍 Checking production data on Render...\n');

    // Check users
    console.log('👥 USERS:');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        coinBalance: true,
        createdAt: true
      }
    });
    
    if (users.length === 0) {
      console.log('  ❌ No users found in production database');
    } else {
      users.forEach(user => {
        console.log(`  - ${user.username} (${user.email})`);
        console.log(`    ID: ${user.id}`);
        console.log(`    Coins: ${user.coinBalance}`);
        console.log(`    Created: ${user.createdAt.toISOString()}`);
        console.log('');
      });
    }

    // Check transactions
    console.log('💳 TRANSACTIONS:');
    const transactions = await prisma.transaction.findMany({
      select: {
        id: true,
        txnId: true,
        amount: true,
        status: true,
        createdAt: true,
        userId: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    if (transactions.length === 0) {
      console.log('  ❌ No transactions found in production database');
    } else {
      transactions.forEach(txn => {
        console.log(`  - ${txn.txnId}`);
        console.log(`    Amount: ${txn.amount} VND`);
        console.log(`    Status: ${txn.status}`);
        console.log(`    User ID: ${txn.userId}`);
        console.log(`    Created: ${txn.createdAt.toISOString()}`);
        console.log('');
      });
    }

    // Check withdrawals
    console.log('💰 WITHDRAWALS:');
    const withdrawals = await prisma.withdrawal.findMany({
      select: {
        id: true,
        amount: true,
        coinAmount: true,
        status: true,
        bankAccount: true,
        bankName: true,
        accountName: true,
        createdAt: true,
        userId: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    if (withdrawals.length === 0) {
      console.log('  ❌ No withdrawals found in production database');
    } else {
      withdrawals.forEach(withdrawal => {
        console.log(`  - ${withdrawal.id}`);
        console.log(`    Amount: ${withdrawal.amount} VND (${withdrawal.coinAmount} coins)`);
        console.log(`    Status: ${withdrawal.status}`);
        console.log(`    Bank: ${withdrawal.bankName} - ${withdrawal.bankAccount}`);
        console.log(`    Account: ${withdrawal.accountName}`);
        console.log(`    User ID: ${withdrawal.userId}`);
        console.log(`    Created: ${withdrawal.createdAt.toISOString()}`);
        console.log('');
      });
    }

    // Check donations
    console.log('🎁 DONATIONS:');
    const donations = await prisma.donation.findMany({
      select: {
        id: true,
        amount: true,
        message: true,
        createdAt: true,
        donorId: true,
        streamerId: true,
        streamId: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    if (donations.length === 0) {
      console.log('  ❌ No donations found in production database');
    } else {
      donations.forEach(donation => {
        console.log(`  - ${donation.id}`);
        console.log(`    Amount: ${donation.amount} coins`);
        console.log(`    Message: ${donation.message}`);
        console.log(`    Donor ID: ${donation.donorId}`);
        console.log(`    Streamer ID: ${donation.streamerId}`);
        console.log(`    Stream ID: ${donation.streamId}`);
        console.log(`    Created: ${donation.createdAt.toISOString()}`);
        console.log('');
      });
    }

    // Check streams
    console.log('📺 STREAMS:');
    const streams = await prisma.stream.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        isLive: true,
        viewerCount: true,
        streamerId: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    if (streams.length === 0) {
      console.log('  ❌ No streams found in production database');
    } else {
      streams.forEach(stream => {
        console.log(`  - ${stream.title}`);
        console.log(`    ID: ${stream.id}`);
        console.log(`    Description: ${stream.description}`);
        console.log(`    Live: ${stream.isLive}`);
        console.log(`    Viewers: ${stream.viewerCount}`);
        console.log(`    Streamer ID: ${stream.streamerId}`);
        console.log(`    Created: ${stream.createdAt.toISOString()}`);
        console.log('');
      });
    }

    console.log('✅ Production data check completed!');

  } catch (error) {
    console.error('❌ Error checking production data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProductionData();
