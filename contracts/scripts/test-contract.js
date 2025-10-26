const { ethers } = require("hardhat");

async function main() {
  console.log("Testing PaymentProcessor...");
  
  // Contract address (update after deployment)
  const CONTRACT_ADDRESS = "0x..."; // Update with deployed address
  
  // USDC token address on Polygon Amoy
  const USDC_ADDRESS = "0x41E94Eb019C0762f9Bf6889F5F4d4e0B18f54d0F";
  
  // Get contract instance
  const paymentProcessor = await ethers.getContractAt("PaymentProcessor", CONTRACT_ADDRESS);
  
  // Get USDC token instance
  const usdcToken = await ethers.getContractAt("IERC20", USDC_ADDRESS);
  
  // Test data
  const testUSDCAmount = ethers.utils.parseUnits("1", 6); // 1 USDC (6 decimals)
  const testCoinsAmount = 100; // 100 coins
  
  console.log("Testing with 1 USDC...");
  
  try {
    // Test purchase coins
    console.log("1. Testing purchaseCoins...");
    const tx1 = await paymentProcessor.purchaseCoins(testUSDCAmount);
    await tx1.wait();
    console.log("✅ purchaseCoins successful");
    
    // Test withdraw USDC
    console.log("2. Testing withdrawUSDC...");
    const tx2 = await paymentProcessor.withdrawUSDC(testCoinsAmount);
    await tx2.wait();
    console.log("✅ withdrawUSDC successful");
    
    // Check contract balance
    const balance = await paymentProcessor.getUSDCBalance();
    console.log("Contract USDC balance:", ethers.utils.formatUnits(balance, 6));
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


