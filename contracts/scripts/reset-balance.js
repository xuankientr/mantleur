const { ethers } = require('hardhat');

async function resetCoinBalance() {
  try {
    console.log('🔄 Resetting coin balance...');
    
    const PAYMENT_CONTRACT_ADDRESS = '0x8E0C155cB0bCef0B54b34368d5271237c7c841F8';
    const USER_ADDRESS = '0x0A22E9D0Ce320490B9C3b44dc975Cb6086a4d3b0';
    
    // Get PaymentProcessor contract
    const paymentContract = await ethers.getContractAt('PaymentProcessor', PAYMENT_CONTRACT_ADDRESS);
    
    // Get user's coin balance from smart contract
    const coinBalance = await paymentContract.getUserCoinBalance(USER_ADDRESS);
    console.log('💰 Smart contract balance (raw):', coinBalance.toString());
    
    // Calculate actual coins
    const actualCoins = Number(coinBalance) / 1000000 / 100;
    console.log('🎯 Actual coins:', actualCoins);
    
    // Calculate correct database balance (1000 initial + actual coins)
    const correctBalance = 1000 + actualCoins;
    console.log('✅ Correct database balance should be:', correctBalance);
    
    console.log('\n📝 To fix the database:');
    console.log(`UPDATE users SET coinBalance = ${correctBalance} WHERE id = 'cmh4pxbrl0002lrn6qa9roybz';`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

resetCoinBalance();



