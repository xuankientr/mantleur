const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Testing withdrawal with high gas...");
  
  const PAYMENT_CONTRACT_ADDRESS = "0x8E0C155cB0bCef0B54b34368d5271237c7c841F8";
  const USER_ADDRESS = "0x0A22E9D0Ce320490B9C3b44dc975Cb6086a4d3b0";

  try {
    // Get contract instance
    const paymentContract = await ethers.getContractAt("PaymentProcessor", PAYMENT_CONTRACT_ADDRESS);
    
    console.log("✅ Contract loaded");
    
    // Test withdrawal with 100 raw coins (100 * 1,000,000 = 100,000,000)
    const rawCoins = BigInt(100) * BigInt(1000000);
    console.log("🎯 Testing withdrawal of", rawCoins.toString(), "raw coins");
    
    // Try withdrawal with high gas limit
    const tx = await paymentContract.withdrawUSDT(rawCoins, {
      gasLimit: 200000
    });
    
    console.log("📄 Transaction hash:", tx.hash);
    
    // Wait for confirmation
    const receipt = await tx.wait();
    console.log("✅ Withdrawal successful!");
    console.log("Gas used:", receipt.gasUsed.toString());
    
  } catch (error) {
    console.error("❌ Withdrawal failed:", error.message);
    
    // Try to get more details about the error
    if (error.reason) {
      console.error("Reason:", error.reason);
    }
    if (error.data) {
      console.error("Data:", error.data);
    }
  }
}

main().catch(console.error);



