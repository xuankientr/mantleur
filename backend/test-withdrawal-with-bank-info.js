const axios = require('axios');

async function testWithdrawalWithBankInfo() {
  try {
    console.log('🏦 Testing withdrawal with bank information...');
    console.log('');

    // Step 1: Login as usertest
    console.log('1️⃣ Logging in as usertest...');
    const userLoginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'usertest@example.com',
      password: 'usertest123'
    });
    const userToken = userLoginResponse.data.token;
    console.log('✅ usertest login successful');
    console.log('User balance:', userLoginResponse.data.user.coinBalance, 'coins');
    console.log('');

    // Step 2: Create withdrawal request with bank info
    console.log('2️⃣ Creating withdrawal request with bank information...');
    const withdrawalResponse = await axios.post('http://localhost:5000/api/withdrawals', {
      coinAmount: 300,
      method: 'bank_transfer',
      accountInfo: 'Nguyen Van A',
      bankAccount: '1234567890',
      bankName: 'Vietcombank'
    }, {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });
    console.log('✅ Withdrawal request created with bank info');
    console.log('Withdrawal ID:', withdrawalResponse.data.id);
    console.log('Amount:', withdrawalResponse.data.vndAmount, 'VNĐ');
    console.log('');

    // Step 3: Login as admin
    console.log('3️⃣ Logging in as admin...');
    const adminLoginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@example.com',
      password: 'admin123'
    });
    const adminToken = adminLoginResponse.data.token;
    console.log('✅ Admin login successful');
    console.log('');

    // Step 4: Admin views withdrawal details
    console.log('4️⃣ Admin viewing withdrawal details...');
    const adminWithdrawalsResponse = await axios.get('http://localhost:5000/api/withdrawals', {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    const latestWithdrawal = adminWithdrawalsResponse.data[0];
    console.log('✅ Latest withdrawal details:');
    console.log('- ID:', latestWithdrawal.id);
    console.log('- User:', latestWithdrawal.user.username);
    console.log('- Coins:', latestWithdrawal.coinAmount);
    console.log('- VNĐ:', latestWithdrawal.amount);
    console.log('- Bank Name:', latestWithdrawal.bankName);
    console.log('- Bank Account:', latestWithdrawal.bankAccount);
    console.log('- Account Name:', latestWithdrawal.accountName);
    console.log('- Status:', latestWithdrawal.status);
    console.log('');

    console.log('🎉 Withdrawal with bank info test successful!');
    console.log('📋 Admin can now see complete bank information for manual transfer');

  } catch (error) {
    console.error('❌ Error in test:', error.response?.data || error.message);
  }
}

testWithdrawalWithBankInfo();
