const hre = require("hardhat");
require('dotenv').config();

async function main() {
  const provider = new hre.ethers.JsonRpcProvider("https://rpc-amoy.polygon.technology");
  
  // USDC contract address
  const USDC_ADDRESS = '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582';
  const USER_ADDRESS = '0x0A22E9D0Ce320490B9C3b44dc975Cb6086a4d3b0';
  
  const USDC_ABI = [
    'function balanceOf(address owner) view returns (uint256)',
    'function decimals() view returns (uint8)',
    'function symbol() view returns (string)'
  ];
  
  const usdcContract = new hre.ethers.Contract(USDC_ADDRESS, USDC_ABI, provider);
  
  try {
    const balance = await usdcContract.balanceOf(USER_ADDRESS);
    const decimals = await usdcContract.decimals();
    const symbol = await usdcContract.symbol();
    
    console.log('USDC Contract:', USDC_ADDRESS);
    console.log('User Address:', USER_ADDRESS);
    console.log('Symbol:', symbol);
    console.log('Decimals:', decimals);
    console.log('Raw Balance:', balance.toString());
    console.log('Formatted Balance:', hre.ethers.formatUnits(balance, decimals));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main().catch(console.error);



