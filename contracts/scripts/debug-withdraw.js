const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Debugging withdrawal issue...");
  
  const PAYMENT_CONTRACT_ADDRESS = "0x8E0C155cB0bCef0B54b34368d5271237c7c841F8";
  const USDC_ADDRESS = "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582";
  const USER_ADDRESS = "0x0A22E9D0Ce320490B9C3b44dc975Cb6086a4d3b0";

  try {
    // Get contract instances
    const paymentContract = await ethers.getContractAt("PaymentProcessor", PAYMENT_CONTRACT_ADDRESS);
    const usdcContract = await ethers.getContractAt("IERC20", USDC_ADDRESS);
    
    console.log("✅ Contracts loaded");
    
    // Check user's coin balance
    const userCoins = await paymentContract.getUserCoinBalance(USER_ADDRESS);
    console.log("💰 User coins:", userCoins.toString());
    
    // Check contract USDC balance
    const contractUSDC = await paymentContract.getContractUSDTBalance();
    console.log("💵 Contract USDC:", contractUSDC.toString());
    
    // Check if user has enough coins for 100
    const coinsToWithdraw = 100;
    console.log("🎯 Coins to withdraw:", coinsToWithdraw);
    console.log("✅ Has enough coins?", userCoins >= coinsToWithdraw);
    
    // Calculate USDC needed (100 coins = 1 USDC = 1000000 units)
    const usdcNeeded = coinsToWithdraw / 100; // 1 USDC
    const usdcUnits = usdcNeeded * 1000000; // 1000000 units
    console.log("💸 USDC needed:", usdcNeeded);
    console.log("💸 USDC units needed:", usdcUnits);
    console.log("✅ Contract has enough USDC?", contractUSDC >= usdcUnits);
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

main().catch(console.error);



