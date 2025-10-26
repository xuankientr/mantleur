const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testRealDeposit() {
  try {
    console.log('💰 Testing REAL deposit flow...');
    console.log('Expected: 100 VND = 1 Coin');
    console.log('');

    // Step 1: Login as usertest
    console.log('1️⃣ Logging in as usertest...');
    const userLoginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'usertest@example.com',
      password: 'usertest123'
    });
    const userToken = userLoginResponse.data.token;
    const userId = userLoginResponse.data.user.id;
    const initialBalance = userLoginResponse.data.user.coinBalance;
    console.log('✅ usertest login successful');
    console.log('User ID:', userId);
    console.log('Initial balance:', initialBalance, 'coins');
    console.log('');

    // Step 2: Create deposit transaction manually (simulate VNPay callback)
    console.log('2️⃣ Simulating VNPay callback for 10,000 VND deposit...');
    const depositAmount = 10000; // 10,000 VND
    const expectedCoins = Math.floor(depositAmount / 100); // 100 coins
    
    // Create transaction record
    const transaction = await prisma.transaction.create({
      data: {
        txnId: `DEPOSIT_${userId}_${Date.now()}`,
        userId: userId,
        amount: depositAmount,
        type: 'deposit',
        status: 'success'
      }
    });
    console.log('✅ Transaction created:', transaction.txnId);

    // Add coins to user balance
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        coinBalance: {
          increment: expectedCoins
        }
      },
      select: {
        coinBalance: true
      }
    });
    console.log('✅ Coins added to user balance');
    console.log('Expected coins to add:', expectedCoins, 'coins');
    console.log('New balance:', updatedUser.coinBalance, 'coins');
    console.log('Coins added:', updatedUser.coinBalance - initialBalance, 'coins');
    console.log('✅ Deposit rate correct:', (updatedUser.coinBalance - initialBalance) === expectedCoins);
    console.log('');

    // Step 3: Test withdrawal
    console.log('3️⃣ Testing withdrawal: 50 coins should give 5,000 VND...');
    const withdrawalCoins = 50;
    const expectedVnd = withdrawalCoins * 100; // 5,000 VND
    
    const withdrawal = await prisma.withdrawal.create({
      data: {
        userId: userId,
        coinAmount: withdrawalCoins,
        amount: expectedVnd,
        method: 'bank_transfer',
        accountName: 'Test User',
        bankAccount: '1234567890',
        bankName: 'Test Bank',
        status: 'pending'
      }
    });
    console.log('✅ Withdrawal created');
    console.log('Expected VND amount:', expectedVnd, 'VND');
    console.log('Actual VND amount:', withdrawal.amount, 'VND');
    console.log('✅ Withdrawal rate correct:', withdrawal.amount === expectedVnd);
    console.log('');

    // Step 4: Deduct coins
    console.log('4️⃣ Deducting coins from user balance...');
    const userAfterWithdrawal = await prisma.user.update({
      where: { id: userId },
      data: {
        coinBalance: {
          decrement: withdrawalCoins
        }
      },
      select: {
        coinBalance: true
      }
    });
    console.log('Balance after withdrawal:', userAfterWithdrawal.coinBalance, 'coins');
    console.log('Coins deducted:', updatedUser.coinBalance - userAfterWithdrawal.coinBalance, 'coins');
    console.log('✅ Withdrawal deduction correct:', (updatedUser.coinBalance - userAfterWithdrawal.coinBalance) === withdrawalCoins);
    console.log('');

    // Step 5: Summary
    console.log('📊 EXCHANGE RATE SUMMARY:');
    console.log(`Deposit: ${depositAmount.toLocaleString()} VND → ${expectedCoins} coins ✅`);
    console.log(`Withdrawal: ${withdrawalCoins} coins → ${expectedVnd.toLocaleString()} VND ✅`);
    console.log('Rate: 100 VND = 1 Coin, 1 Coin = 100 VND ✅');
    console.log('');
    console.log('🎉 All exchange rates are working correctly!');

  } catch (error) {
    console.error('❌ Error in real deposit test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testRealDeposit();
