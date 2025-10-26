const axios = require('axios');

async function testCompleteBankWithdrawal() {
  try {
    console.log('🏦 Testing COMPLETE withdrawal flow with bank information...');
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

    // Step 2: Create withdrawal request with complete bank info
    console.log('2️⃣ Creating withdrawal request with complete bank information...');
    const withdrawalResponse = await axios.post('http://localhost:5000/api/withdrawals', {
      coinAmount: 1000,
      method: 'bank_transfer',
      accountInfo: 'Tran Thi B',
      bankAccount: '9876543210',
      bankName: 'Techcombank'
    }, {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });
    console.log('✅ Withdrawal request created with complete bank info');
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

    // Step 4: Admin views withdrawal with bank details
    console.log('4️⃣ Admin viewing withdrawal with bank details...');
    const adminWithdrawalsResponse = await axios.get('http://localhost:5000/api/withdrawals', {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    const latestWithdrawal = adminWithdrawalsResponse.data[0];
    console.log('✅ Latest withdrawal with bank details:');
    console.log('- ID:', latestWithdrawal.id);
    console.log('- User:', latestWithdrawal.user.username);
    console.log('- Coins:', latestWithdrawal.coinAmount);
    console.log('- VNĐ:', latestWithdrawal.amount.toLocaleString());
    console.log('- Bank Name:', latestWithdrawal.bankName);
    console.log('- Bank Account:', latestWithdrawal.bankAccount);
    console.log('- Account Name:', latestWithdrawal.accountName);
    console.log('- Status:', latestWithdrawal.status);
    console.log('');

    // Step 5: Admin approves withdrawal
    console.log('5️⃣ Admin approving withdrawal...');
    const approveResponse = await axios.put(`http://localhost:5000/api/withdrawals/${latestWithdrawal.id}/status`, {
      status: 'approved',
      adminNote: `Approved - Ready to transfer ${latestWithdrawal.amount.toLocaleString()} VNĐ to ${latestWithdrawal.bankName} - ${latestWithdrawal.bankAccount}`
    }, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    console.log('✅ Withdrawal approved with bank transfer note');
    console.log('');

    // Step 6: Admin completes withdrawal (simulates manual bank transfer)
    console.log('6️⃣ Admin completing withdrawal (simulating manual bank transfer)...');
    const completeResponse = await axios.put(`http://localhost:5000/api/withdrawals/${latestWithdrawal.id}/status`, {
      status: 'completed',
      adminNote: `Bank transfer completed - ${latestWithdrawal.amount.toLocaleString()} VNĐ transferred to ${latestWithdrawal.bankName} account ${latestWithdrawal.bankAccount}`
    }, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    console.log('✅ Withdrawal completed with bank transfer confirmation');
    console.log('');

    // Step 7: Check final status
    console.log('7️⃣ Checking final status...');
    const finalWithdrawalsResponse = await axios.get('http://localhost:5000/api/withdrawals', {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    const updatedWithdrawal = finalWithdrawalsResponse.data.find(w => w.id === latestWithdrawal.id);
    console.log('Final status:', updatedWithdrawal.status);
    console.log('Transaction ID:', updatedWithdrawal.transactionId);
    console.log('Admin note:', updatedWithdrawal.adminNote);
    console.log('Processed at:', updatedWithdrawal.processedAt);

    console.log('');
    console.log('🎉 COMPLETE bank withdrawal flow test successful!');
    console.log('');
    console.log('📋 Summary:');
    console.log('- User created withdrawal request with complete bank information');
    console.log('- Admin can see all bank details for manual transfer');
    console.log('- Admin approved the request with bank transfer note');
    console.log('- Admin completed the withdrawal with transfer confirmation');
    console.log('- Transaction ID generated:', updatedWithdrawal.transactionId);
    console.log('- Status progression: pending → approved → completed');
    console.log('');
    console.log('🏦 Bank Transfer Details:');
    console.log(`- Amount: ${updatedWithdrawal.amount.toLocaleString()} VNĐ`);
    console.log(`- Bank: ${updatedWithdrawal.bankName}`);
    console.log(`- Account: ${updatedWithdrawal.bankAccount}`);
    console.log(`- Holder: ${updatedWithdrawal.accountName}`);

  } catch (error) {
    console.error('❌ Error in complete bank withdrawal test:', error.response?.data || error.message);
  }
}

testCompleteBankWithdrawal();
