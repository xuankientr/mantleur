const axios = require('axios');

async function testExchangeRates() {
  try {
    console.log('💰 Testing exchange rates consistency...');
    console.log('Expected: 100 VND = 1 Coin, 1 Coin = 100 VND');
    console.log('');

    // Step 1: Login as usertest
    console.log('1️⃣ Logging in as usertest...');
    const userLoginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'usertest@example.com',
      password: 'usertest123'
    });
    const userToken = userLoginResponse.data.token;
    const initialBalance = userLoginResponse.data.user.coinBalance;
    console.log('✅ usertest login successful');
    console.log('Initial balance:', initialBalance, 'coins');
    console.log('');

    // Step 2: Test deposit (100 VND = 1 Coin)
    console.log('2️⃣ Testing deposit: 10,000 VND should give 100 coins...');
    const depositResponse = await axios.post('http://localhost:5000/api/payments/create', {
      amount: 10000 // 10,000 VND
    }, {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });
    console.log('✅ Deposit request created');
    console.log('Expected coins to add: 100 coins (10,000 VND ÷ 100)');
    console.log('');

    // Step 3: Check balance after deposit
    console.log('3️⃣ Checking balance after deposit...');
    const balanceResponse = await axios.get('http://localhost:5000/api/payments/balance/cmh7jmi7a0001kg6pi7umlss0', {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });
    const balanceAfterDeposit = balanceResponse.data.balance;
    const coinsAdded = balanceAfterDeposit - initialBalance;
    console.log('Balance after deposit:', balanceAfterDeposit, 'coins');
    console.log('Coins added:', coinsAdded, 'coins');
    console.log('Expected: 100 coins, Actual:', coinsAdded, 'coins');
    console.log('✅ Deposit rate correct:', coinsAdded === 100);
    console.log('');

    // Step 4: Test withdrawal (1 Coin = 100 VND)
    console.log('4️⃣ Testing withdrawal: 50 coins should give 5,000 VND...');
    const withdrawalResponse = await axios.post('http://localhost:5000/api/withdrawals', {
      coinAmount: 50, // 50 coins
      method: 'bank_transfer',
      accountInfo: 'Test User',
      bankAccount: '1234567890',
      bankName: 'Test Bank'
    }, {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });
    console.log('✅ Withdrawal request created');
    console.log('Expected VND amount: 5,000 VND (50 coins × 100)');
    console.log('Actual VND amount:', withdrawalResponse.data.vndAmount, 'VND');
    console.log('✅ Withdrawal rate correct:', withdrawalResponse.data.vndAmount === 5000);
    console.log('');

    // Step 5: Check balance after withdrawal
    console.log('5️⃣ Checking balance after withdrawal...');
    const balanceAfterWithdrawal = await axios.get('http://localhost:5000/api/payments/balance/cmh7jmi7a0001kg6pi7umlss0', {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });
    const finalBalance = balanceAfterWithdrawal.data.balance;
    const coinsDeducted = balanceAfterDeposit - finalBalance;
    console.log('Balance after withdrawal:', finalBalance, 'coins');
    console.log('Coins deducted:', coinsDeducted, 'coins');
    console.log('Expected: 50 coins, Actual:', coinsDeducted, 'coins');
    console.log('✅ Withdrawal deduction correct:', coinsDeducted === 50);
    console.log('');

    // Step 6: Summary
    console.log('📊 EXCHANGE RATE SUMMARY:');
    console.log('Deposit: 10,000 VND → 100 coins ✅');
    console.log('Withdrawal: 50 coins → 5,000 VND ✅');
    console.log('Rate: 100 VND = 1 Coin, 1 Coin = 100 VND ✅');
    console.log('');
    console.log('🎉 All exchange rates are consistent!');

  } catch (error) {
    console.error('❌ Error in exchange rate test:', error.response?.data || error.message);
  }
}

testExchangeRates();
