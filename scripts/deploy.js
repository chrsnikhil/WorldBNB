const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying PropertyManager contract...");
  
  // Get the contract factory
  const PropertyManager = await ethers.getContractFactory("PropertyManager");
  
  // Deploy the contract
  // Replace with your fee recipient address
  const feeRecipient = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"; // Example address
  const propertyManager = await PropertyManager.deploy(feeRecipient);
  
  await propertyManager.deployed();
  
  console.log("PropertyManager deployed to:", propertyManager.address);
  console.log("Fee recipient:", feeRecipient);
  
  // Verify contract on World Chain explorer
  console.log("\nTo verify the contract, run:");
  console.log(`npx hardhat verify --network world ${propertyManager.address} "${feeRecipient}"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
