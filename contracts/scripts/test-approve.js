const hre = require("hardhat");
require('dotenv').config();

async function main() {
  // Test approve USDC directly
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
  
  const usdcContract = new hre.ethers.Contract(USDC_ADDRESS, USDC_ABI, wallet);
  
  try {
    console.log('Testing USDC approve...');
    console.log('Wallet:', wallet.address);
    console.log('USDC Contract:', USDC_ADDRESS);
    console.log('Payment Contract:', PAYMENT_CONTRACT);
    
    // Check balance
    const balance = await usdcContract.balanceOf(wallet.address);
    const decimals = await usdcContract.decimals();
    console.log('USDC Balance:', hre.ethers.formatUnits(balance, decimals));
    
    // Check current allowance
    const allowance = await usdcContract.allowance(wallet.address, PAYMENT_CONTRACT);
    console.log('Current Allowance:', hre.ethers.formatUnits(allowance, decimals));
    
    if (allowance > 0) {
      console.log('✅ Already approved');
      return;
    }
    
    // Approve 1 USDC
    const amount = hre.ethers.parseUnits('1', decimals);
    console.log('Approving amount:', hre.ethers.formatUnits(amount, decimals), 'USDC');
    
    const gasPrice = await provider.getFeeData();
    console.log('Gas Price:', gasPrice.gasPrice?.toString());
    
    const approveTx = await usdcContract.approve(PAYMENT_CONTRACT, amount, {
      gasLimit: 150000,
      gasPrice: gasPrice.gasPrice ? gasPrice.gasPrice * 2n : undefined
    });
    
    console.log('Approve TX:', approveTx.hash);
    console.log('Waiting for confirmation...');
    
    const receipt = await approveTx.wait();
    console.log('✅ Approve confirmed!');
    console.log('Gas Used:', receipt.gasUsed.toString());
    
    // Check new allowance
    const newAllowance = await usdcContract.allowance(wallet.address, PAYMENT_CONTRACT);
    console.log('New Allowance:', hre.ethers.formatUnits(newAllowance, decimals));
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.transaction) {
      console.log('Transaction:', error.transaction);
    }
  }
}

main().catch(console.error);
