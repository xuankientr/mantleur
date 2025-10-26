const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkTestData() {
  try {
    console.log('🔍 Checking test data in database...\n');

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
    
    users.forEach(user => {
      console.log(`  - ${user.username} (${user.email})`);
      console.log(`    ID: ${user.id}`);
      console.log(`    Coins: ${user.coinBalance}`);
      console.log(`    Created: ${user.createdAt.toISOString()}`);
      console.log('');
    });

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
    
    transactions.forEach(txn => {
      console.log(`  - ${txn.txnId}`);
      console.log(`    Amount: ${txn.amount} VND`);
      console.log(`    Status: ${txn.status}`);
      console.log(`    User ID: ${txn.userId}`);
      console.log(`    Created: ${txn.createdAt.toISOString()}`);
      console.log('');
    });

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

    console.log('✅ Test data check completed!');

  } catch (error) {
    console.error('❌ Error checking test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTestData();
