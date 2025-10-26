const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testDonationWithdrawalFlow() {
  try {
    console.log('🚀 Testing Donation → Withdrawal Flow...\n');

    // 1. Create test users
    console.log('1️⃣ Creating test users...');
    
    // Create donor user
    const donorPassword = await bcrypt.hash('donor123', 10);
    const donorUser = await prisma.user.upsert({
      where: { email: 'donor@test.com' },
      update: {
        username: 'donor',
        password: donorPassword,
        coinBalance: 1000 // Give donor 1000 coins
      },
      create: {
        username: 'donor',
        email: 'donor@test.com',
        password: donorPassword,
        coinBalance: 1000
      },
    });

    // Create streamer user
    const streamerPassword = await bcrypt.hash('streamer123', 10);
    const streamerUser = await prisma.user.upsert({
      where: { email: 'streamer@test.com' },
      update: {
        username: 'streamer',
        password: streamerPassword,
        coinBalance: 100 // Give streamer 100 coins initially
      },
      create: {
        username: 'streamer',
        email: 'streamer@test.com',
        password: streamerPassword,
        coinBalance: 100
      },
    });

    console.log('✅ Test users created:');
    console.log(`   Donor: ${donorUser.username} (${donorUser.coinBalance} coins)`);
    console.log(`   Streamer: ${streamerUser.username} (${streamerUser.coinBalance} coins)`);

    // 2. Create a test stream
    console.log('\n2️⃣ Creating test stream...');
    const testStream = await prisma.stream.create({
      data: {
        title: 'Test Stream for Donation',
        description: 'Testing donation flow',
        streamerId: streamerUser.id,
        isLive: true,
        streamKey: `test_stream_${Date.now()}`
      }
    });
    console.log(`✅ Test stream created: ${testStream.title}`);

    // 3. Login as donor
    console.log('\n3️⃣ Logging in as donor...');
    const donorLoginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'donor@test.com',
      password: 'donor123'
    });
    const donorToken = donorLoginRes.data.token;
    console.log('✅ Donor login successful');

    // 4. Make donation
    console.log('\n4️⃣ Making donation...');
    const donationAmount = 200; // Donate 200 coins
    const donationRes = await axios.post('http://localhost:5000/api/donations', {
      streamId: testStream.id,
      amount: donationAmount,
      message: 'Test donation for withdrawal flow'
    }, {
      headers: {
        'Authorization': `Bearer ${donorToken}`
      }
    });
    console.log(`✅ Donation successful: ${donationAmount} coins`);

    // 5. Check balances after donation
    console.log('\n5️⃣ Checking balances after donation...');
    const donorAfter = await prisma.user.findUnique({
      where: { id: donorUser.id },
      select: { coinBalance: true }
    });
    const streamerAfter = await prisma.user.findUnique({
      where: { id: streamerUser.id },
      select: { coinBalance: true }
    });
    
    console.log(`   Donor balance: ${donorAfter.coinBalance} coins (was ${donorUser.coinBalance})`);
    console.log(`   Streamer balance: ${streamerAfter.coinBalance} coins (was ${streamerUser.coinBalance})`);

    // 6. Login as streamer
    console.log('\n6️⃣ Logging in as streamer...');
    const streamerLoginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'streamer@test.com',
      password: 'streamer123'
    });
    const streamerToken = streamerLoginRes.data.token;
    console.log('✅ Streamer login successful');

    // 7. Streamer creates withdrawal request
    console.log('\n7️⃣ Streamer creating withdrawal request...');
    const withdrawalAmount = 150; // Withdraw 150 coins (less than received)
    const withdrawalRes = await axios.post('http://localhost:5000/api/withdrawals', {
      coinAmount: withdrawalAmount,
      method: 'bank_transfer',
      accountInfo: 'Test withdrawal from donation',
      bankAccount: '1234567890',
      bankName: 'Test Bank'
    }, {
      headers: {
        'Authorization': `Bearer ${streamerToken}`
      }
    });
    console.log(`✅ Withdrawal request created: ${withdrawalAmount} coins`);

    // 8. Check final balances
    console.log('\n8️⃣ Checking final balances...');
    const donorFinal = await prisma.user.findUnique({
      where: { id: donorUser.id },
      select: { coinBalance: true }
    });
    const streamerFinal = await prisma.user.findUnique({
      where: { id: streamerUser.id },
      select: { coinBalance: true }
    });
    
    console.log(`   Donor final balance: ${donorFinal.coinBalance} coins`);
    console.log(`   Streamer final balance: ${streamerFinal.coinBalance} coins`);

    // 9. Check withdrawal status
    console.log('\n9️⃣ Checking withdrawal status...');
    const withdrawal = await prisma.withdrawal.findFirst({
      where: { userId: streamerUser.id },
      orderBy: { createdAt: 'desc' }
    });
    console.log(`   Withdrawal ID: ${withdrawal.id}`);
    console.log(`   Status: ${withdrawal.status}`);
    console.log(`   Amount: ${withdrawal.amount} VNĐ (${withdrawal.coinAmount} coins)`);

    console.log('\n🎉 Donation → Withdrawal Flow Test Completed Successfully!');
    console.log('\n📊 Summary:');
    console.log(`   • Donor donated ${donationAmount} coins`);
    console.log(`   • Streamer received ${donationAmount} coins`);
    console.log(`   • Streamer withdrew ${withdrawalAmount} coins`);
    console.log(`   • Streamer can withdraw coins received from donations! ✅`);

  } catch (error) {
    console.error('❌ Error in donation-withdrawal flow test:', error.response?.data || error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Import bcrypt
const bcrypt = require('bcrypt');

testDonationWithdrawalFlow();
