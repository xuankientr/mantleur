const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkWithdrawals() {
  try {
    console.log('🔍 Checking all withdrawal requests...');

    const withdrawals = await prisma.withdrawal.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            coinBalance: true
          }
        }
      }
    });

    console.log(`📊 Found ${withdrawals.length} withdrawal requests:`);
    console.log('');

    if (withdrawals.length === 0) {
      console.log('❌ No withdrawal requests found');
    } else {
      withdrawals.forEach((withdrawal, index) => {
        console.log(`${index + 1}. ID: ${withdrawal.id}`);
        console.log(`   User: ${withdrawal.user.username} (${withdrawal.user.email})`);
        console.log(`   Coins: ${withdrawal.coinAmount}`);
        console.log(`   VNĐ: ${withdrawal.amount.toLocaleString()}`);
        console.log(`   Method: ${withdrawal.method}`);
        console.log(`   Status: ${withdrawal.status}`);
        console.log(`   Account: ${withdrawal.accountName}`);
        console.log(`   Created: ${withdrawal.createdAt.toLocaleString()}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Error checking withdrawals:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkWithdrawals();
