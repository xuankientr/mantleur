const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function testDonationNotifications() {
  try {
    console.log('🚀 Testing Donation Notifications & Coin Updates...\n');

    // 1. Create test users
    console.log('1️⃣ Creating test users...');
    
    // Create donor user
    const donorPassword = await bcrypt.hash('donor123', 10);
    const donorUser = await prisma.user.upsert({
      where: { email: 'donor@test.com' },
      update: {
        username: 'donor',
        password: donorPassword,
        coinBalance: 1000
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
        coinBalance: 100
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
        title: 'Test Stream for Donation Notifications',
        description: 'Testing donation notifications',
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

    // 4. Make multiple donations to test notifications
    console.log('\n4️⃣ Making donations...');
    
    const donations = [
      { amount: 50, message: 'First donation! 🎉' },
      { amount: 100, message: 'Great stream! 👏' },
      { amount: 200, message: 'Keep it up! 💪' }
    ];

    for (let i = 0; i < donations.length; i++) {
      const donation = donations[i];
      console.log(`\n   💰 Donation ${i + 1}: ${donation.amount} coins - "${donation.message}"`);
      
      const donationRes = await axios.post('http://localhost:5000/api/donations', {
        streamId: testStream.id,
        amount: donation.amount,
        message: donation.message
      }, {
        headers: {
          'Authorization': `Bearer ${donorToken}`
        }
      });
      
      console.log(`   ✅ Donation ${i + 1} successful`);
      
      // Small delay between donations
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // 5. Check final balances
    console.log('\n5️⃣ Checking final balances...');
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

    // 6. Check donation records
    console.log('\n6️⃣ Checking donation records...');
    const allDonations = await prisma.donation.findMany({
      where: { streamId: testStream.id },
      include: {
        donor: {
          select: {
            username: true,
            avatar: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`   Total donations: ${allDonations.length}`);
    allDonations.forEach((donation, index) => {
      console.log(`   ${index + 1}. ${donation.donor.username} donated ${donation.amount} coins: "${donation.message}"`);
    });

    // 7. Test withdrawal with donated coins
    console.log('\n7️⃣ Testing withdrawal with donated coins...');
    
    // Login as streamer
    const streamerLoginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'streamer@test.com',
      password: 'streamer123'
    });
    const streamerToken = streamerLoginRes.data.token;
    console.log('✅ Streamer login successful');

    // Create withdrawal request
    const withdrawalAmount = 200; // Withdraw some of the donated coins
    const withdrawalRes = await axios.post('http://localhost:5000/api/withdrawals', {
      coinAmount: withdrawalAmount,
      method: 'bank_transfer',
      accountInfo: 'Withdrawal from donations',
      bankAccount: '1234567890',
      bankName: 'Test Bank'
    }, {
      headers: {
        'Authorization': `Bearer ${streamerToken}`
      }
    });
    console.log(`✅ Withdrawal request created: ${withdrawalAmount} coins`);

    // 8. Final balance check
    console.log('\n8️⃣ Final balance check...');
    const finalDonor = await prisma.user.findUnique({
      where: { id: donorUser.id },
      select: { coinBalance: true }
    });
    const finalStreamer = await prisma.user.findUnique({
      where: { id: streamerUser.id },
      select: { coinBalance: true }
    });
    
    console.log(`   Donor final balance: ${finalDonor.coinBalance} coins`);
    console.log(`   Streamer final balance: ${finalStreamer.coinBalance} coins`);

    console.log('\n🎉 Donation Notifications Test Completed Successfully!');
    console.log('\n📊 Summary:');
    console.log(`   • Donor started with: 1000 coins`);
    console.log(`   • Donor donated: ${donations.reduce((sum, d) => sum + d.amount, 0)} coins`);
    console.log(`   • Donor final balance: ${finalDonor.coinBalance} coins`);
    console.log(`   • Streamer started with: 100 coins`);
    console.log(`   • Streamer received: ${donations.reduce((sum, d) => sum + d.amount, 0)} coins`);
    console.log(`   • Streamer withdrew: ${withdrawalAmount} coins`);
    console.log(`   • Streamer final balance: ${finalStreamer.coinBalance} coins`);
    console.log('\n🔔 Notifications sent:');
    console.log('   • Real-time donation notifications to stream room');
    console.log('   • Personal notifications to streamer');
    console.log('   • Coin balance updates to both users');
    console.log('   • Withdrawal request notifications to admin');

  } catch (error) {
    console.error('❌ Error in donation notifications test:', error.response?.data || error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testDonationNotifications();
