const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying PaymentProcessor...");
  
  // USDC token address on Polygon Amoy
  const USDC_ADDRESS = "0x41E94Eb019C0762f9Bf6889F5F4d4e0B18f54d0F"; // USDC on Polygon Amoy
  
  // Get the contract factory
  const PaymentProcessor = await ethers.getContractFactory("PaymentProcessor");
  
  // Deploy the contract
  const paymentProcessor = await PaymentProcessor.deploy(USDC_ADDRESS);
  
  await paymentProcessor.deployed();
  
  console.log("PaymentProcessor deployed to:", paymentProcessor.address);
  console.log("USDC Token address:", USDC_ADDRESS);
  
  // Save deployment info
  const deploymentInfo = {
    contractAddress: paymentProcessor.address,
    usdcTokenAddress: USDC_ADDRESS,
    network: "polygon-amoy",
    deployer: await paymentProcessor.signer.getAddress()
  };
  
  console.log("Deployment info:", JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });