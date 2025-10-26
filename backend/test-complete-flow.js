const axios = require('axios');

async function testCompleteFlow() {
  try {
    console.log('🚀 Testing complete withdrawal flow...');
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

    // Step 2: Create withdrawal request
    console.log('2️⃣ Creating withdrawal request...');
    const withdrawalResponse = await axios.post('http://localhost:5000/api/withdrawals', {
      coinAmount: 100,
      method: 'bank_transfer',
      accountInfo: 'Test withdrawal request'
    }, {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });
    console.log('✅ Withdrawal request created');
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

    // Step 4: Admin views all withdrawals
    console.log('4️⃣ Admin viewing all withdrawals...');
    const adminWithdrawalsResponse = await axios.get('http://localhost:5000/api/withdrawals', {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    console.log(`✅ Admin can see ${adminWithdrawalsResponse.data.length} withdrawal requests`);
    
    // Show the latest withdrawal
    const latestWithdrawal = adminWithdrawalsResponse.data[0];
    console.log('Latest withdrawal:');
    console.log('- ID:', latestWithdrawal.id);
    console.log('- User:', latestWithdrawal.user.username);
    console.log('- Coins:', latestWithdrawal.coinAmount);
    console.log('- VNĐ:', latestWithdrawal.amount);
    console.log('- Status:', latestWithdrawal.status);
    console.log('');

    // Step 5: Admin approves withdrawal
    console.log('5️⃣ Admin approving withdrawal...');
    const approveResponse = await axios.put(`http://localhost:5000/api/withdrawals/${latestWithdrawal.id}/status`, {
      status: 'approved',
      adminNote: 'Approved by admin'
    }, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    console.log('✅ Withdrawal approved successfully');
    console.log('');

    // Step 6: Check final status
    console.log('6️⃣ Checking final status...');
    const finalWithdrawalsResponse = await axios.get('http://localhost:5000/api/withdrawals', {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    const updatedWithdrawal = finalWithdrawalsResponse.data.find(w => w.id === latestWithdrawal.id);
    console.log('Final status:', updatedWithdrawal.status);
    console.log('Admin note:', updatedWithdrawal.adminNote);

    console.log('');
    console.log('🎉 Complete flow test successful!');

  } catch (error) {
    console.error('❌ Error in flow test:', error.response?.data || error.message);
  }
}

testCompleteFlow();
