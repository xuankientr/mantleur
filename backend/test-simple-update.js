const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testSimpleUpdate() {
  try {
    console.log('🔍 Testing simple withdrawal update...');

    // Get a withdrawal ID
    const withdrawals = await prisma.withdrawal.findMany({
      take: 1,
      orderBy: { createdAt: 'desc' }
    });

    if (withdrawals.length === 0) {
      console.log('❌ No withdrawals found');
      return;
    }

    const withdrawalId = withdrawals[0].id;
    console.log('Testing with withdrawal ID:', withdrawalId);

    // Try to update
    const updated = await prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: {
        status: 'approved',
        adminNote: 'Test approval',
        processedAt: new Date()
      }
    });

    console.log('✅ Update successful:', updated);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSimpleUpdate();
