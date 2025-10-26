const { ethers } = require('hardhat');

async function checkDecimals() {
  try {
    console.log('🔍 Checking USDC decimals...');
    
    const USDC_ADDRESS = '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582';
    const PAYMENT_CONTRACT_ADDRESS = '0x8E0C155cB0bCef0B54b34368d5271237c7c841F8';
    const USER_ADDRESS = '0x0A22E9D0Ce320490B9C3b44dc975Cb6086a4d3b0';
    
    // Get USDC contract
    const usdcContract = await ethers.getContractAt('IERC20', USDC_ADDRESS);
    
    // Get PaymentProcessor contract
    const paymentContract = await ethers.getContractAt('PaymentProcessor', PAYMENT_CONTRACT_ADDRESS);
    
    // Check USDC decimals (USDC has 6 decimals)
    const decimals = 6;
    console.log('📊 USDC decimals:', decimals);
    
    // Check user's coin balance
    const coinBalance = await paymentContract.getUserCoinBalance(USER_ADDRESS);
    console.log('💰 User coin balance (raw):', coinBalance.toString());
    
    // Check exchange rate
    const exchangeRate = await paymentContract.getExchangeRate();
    console.log('💱 Exchange rate:', exchangeRate.toString());
    
    // Calculate actual coins
    const actualCoins = Number(coinBalance) / (10 ** decimals) / Number(exchangeRate);
    console.log('🎯 Actual coins:', actualCoins);
    
    // Check contract USDC balance
    const contractBalance = await paymentContract.getContractUSDTBalance();
    console.log('🏦 Contract USDC balance:', ethers.formatUnits(contractBalance, decimals));
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkDecimals();
