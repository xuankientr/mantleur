const hre = require("hardhat");
require('dotenv').config();

async function main() {
  // Direct sync coins to database via API
  const provider = new hre.ethers.JsonRpcProvider("https://rpc-amoy.polygon.technology");
  
  const PAYMENT_CONTRACT = '0x8E0C155cB0bCef0B54b34368d5271237c7c841F8';
  const USER_ADDRESS = '0x0A22E9D0Ce320490B9C3b44dc975Cb6086a4d3b0';
  
  const PAYMENT_ABI = [
    'function getUserCoinBalance(address user) view returns (uint256)'
  ];
  
  const paymentContract = new hre.ethers.Contract(PAYMENT_CONTRACT, PAYMENT_ABI, provider);
  
  try {
    console.log('🔄 Direct sync coins to database...');
    
    // Get coins from smart contract
    const coinBalance = await paymentContract.getUserCoinBalance(USER_ADDRESS);
    console.log('💰 Coins in Smart Contract:', coinBalance.toString());
    
    if (coinBalance == 0) {
      console.log('ℹ️ No coins to sync');
      return;
    }
    
    // You need to replace this with actual JWT token from browser
    const token = 'YOUR_JWT_TOKEN_HERE';
    
    console.log('📡 Calling API to sync coins...');
    const response = await fetch('http://localhost:5000/api/users/add-coins', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        amount: parseInt(coinBalance.toString())
      })
    });
    
    console.log('📡 API Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Coins synced successfully!');
      console.log('New balance:', data.newBalance);
    } else {
      const errorData = await response.text();
      console.log('❌ Failed to sync coins:', errorData);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main().catch(console.error);



