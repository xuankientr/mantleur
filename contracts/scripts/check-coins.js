const hre = require("hardhat");
require('dotenv').config();

async function main() {
  // Check current coin balance in smart contract
  const provider = new hre.ethers.JsonRpcProvider("https://rpc-amoy.polygon.technology");
  
  const PAYMENT_CONTRACT = '0x8E0C155cB0bCef0B54b34368d5271237c7c841F8';
  const USER_ADDRESS = '0x0A22E9D0Ce320490B9C3b44dc975Cb6086a4d3b0';
  
  const PAYMENT_ABI = [
    'function getUserCoinBalance(address user) view returns (uint256)',
    'function getContractUSDTBalance() view returns (uint256)'
  ];
  
  const paymentContract = new hre.ethers.Contract(PAYMENT_CONTRACT, PAYMENT_ABI, provider);
  
  try {
    console.log('Checking coin balances...');
    console.log('User Address:', USER_ADDRESS);
    console.log('Payment Contract:', PAYMENT_CONTRACT);
    
    // Check user's coin balance in smart contract
    const coinBalance = await paymentContract.getUserCoinBalance(USER_ADDRESS);
    console.log('Coins in Smart Contract:', coinBalance.toString());
    
    // Check contract's USDC balance
    const contractBalance = await paymentContract.getContractUSDTBalance();
    console.log('Contract USDC Balance:', hre.ethers.formatUnits(contractBalance, 6));
    
    console.log('\n📊 Summary:');
    console.log('- You have', coinBalance.toString(), 'coins in the smart contract');
    console.log('- Contract holds', hre.ethers.formatUnits(contractBalance, 6), 'USDC');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main().catch(console.error);



