const { ethers } = require("hardhat");

async function main() {
  const PAYMENT_CONTRACT_ADDRESS = "0x8E0C155cB0bCef0B54b34368d5271237c7c841F8";
  const USDC_ADDRESS = "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582";
  const USER_ADDRESS = "0x0A22E9D0Ce320490B9C3b44dc975Cb6086a4d3b0";

  console.log("🔍 Checking contract balances...");
  
  // Get contract instances
  const paymentContract = await ethers.getContractAt("PaymentProcessor", PAYMENT_CONTRACT_ADDRESS);
  const usdcContract = await ethers.getContractAt("IERC20", USDC_ADDRESS);
  
  // Check user's coin balance in contract
  const userCoins = await paymentContract.getUserCoinBalance(USER_ADDRESS);
  console.log("💰 User coins in contract:", userCoins.toString());
  
  // Check contract's USDC balance
  const contractUSDC = await paymentContract.getContractUSDTBalance();
  console.log("💵 Contract USDC balance:", contractUSDC.toString());
  
  // Check user's USDC balance
  const userUSDC = await usdcContract.balanceOf(USER_ADDRESS);
  console.log("💳 User USDC balance:", userUSDC.toString());
  
  // Calculate what user should get for 100 coins
  const coinsToWithdraw = 100;
  const usdcToReceive = coinsToWithdraw / 100; // 100 coins = 1 USDC
  const usdcUnits = usdcToReceive * 1000000; // USDC has 6 decimals
  
  console.log("\n📊 Withdrawal calculation:");
  console.log("Coins to withdraw:", coinsToWithdraw);
  console.log("USDC to receive:", usdcToReceive);
  console.log("USDC units needed:", usdcUnits);
  console.log("Contract has enough USDC?", contractUSDC >= usdcUnits);
}



