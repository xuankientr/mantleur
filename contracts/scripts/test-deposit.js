const hre = require("hardhat");
require('dotenv').config();

async function main() {
  // Test deposit USDC directly
  const provider = new hre.ethers.JsonRpcProvider("https://rpc-amoy.polygon.technology");
  const wallet = new hre.ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  const USDC_ADDRESS = '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582';
  const PAYMENT_CONTRACT = '0x8E0C155cB0bCef0B54b34368d5271237c7c841F8';
  
  const USDC_ABI = [
    'function approve(address spender, uint256 amount) returns (bool)',
    'function allowance(address owner, address spender) view returns (uint256)',
    'function balanceOf(address owner) view returns (uint256)',
    'function decimals() view returns (uint8)'
  ];
  
  const PAYMENT_ABI = [
    'function depositUSDT(uint256 amount) external',
    'function getUserCoinBalance(address user) view returns (uint256)',
    'function getContractUSDTBalance() view returns (uint256)'
  ];
  
  const usdcContract = new hre.ethers.Contract(USDC_ADDRESS, USDC_ABI, wallet);
  const paymentContract = new hre.ethers.Contract(PAYMENT_CONTRACT, PAYMENT_ABI, wallet);
  
  try {
    console.log('Testing USDC deposit...');
    console.log('Wallet:', wallet.address);
    console.log('USDC Contract:', USDC_ADDRESS);
    console.log('Payment Contract:', PAYMENT_CONTRACT);
    
    // Check balances
    const usdcBalance = await usdcContract.balanceOf(wallet.address);
    const decimals = await usdcContract.decimals();
    console.log('USDC Balance:', hre.ethers.formatUnits(usdcBalance, decimals));
    
    const contractBalance = await paymentContract.getContractUSDTBalance();
    console.log('Contract USDC Balance:', hre.ethers.formatUnits(contractBalance, decimals));
    
    const coinBalance = await paymentContract.getUserCoinBalance(wallet.address);
    console.log('Current Coin Balance:', coinBalance.toString());
    
    // Check allowance
    const allowance = await usdcContract.allowance(wallet.address, PAYMENT_CONTRACT);
    console.log('Current Allowance:', hre.ethers.formatUnits(allowance, decimals));
    
    // Deposit 1 USDC
    const amount = hre.ethers.parseUnits('1', decimals);
    console.log('Depositing amount:', hre.ethers.formatUnits(amount, decimals), 'USDC');
    
    const feeData = await provider.getFeeData();
    console.log('Gas Price:', feeData.gasPrice?.toString());
    
    const depositTx = await paymentContract.depositUSDT(amount, {
      gasLimit: 250000,
      gasPrice: feeData.gasPrice ? feeData.gasPrice * 2n : undefined
    });
    
    console.log('Deposit TX:', depositTx.hash);
    console.log('Waiting for confirmation...');
    
    const receipt = await depositTx.wait();
    console.log('✅ Deposit confirmed!');
    console.log('Gas Used:', receipt.gasUsed.toString());
    
    // Check new balances
    const newCoinBalance = await paymentContract.getUserCoinBalance(wallet.address);
    console.log('New Coin Balance:', newCoinBalance.toString());
    
    const newContractBalance = await paymentContract.getContractUSDTBalance();
    console.log('New Contract USDC Balance:', hre.ethers.formatUnits(newContractBalance, decimals));
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.transaction) {
      console.log('Transaction:', error.transaction);
    }
  }
}

main().catch(console.error);



