const { ethers } = require("hardhat");

async function main() {
  console.log("Generating a new wallet for testing...");
  
  // Generate a new random wallet
  const wallet = ethers.Wallet.createRandom();
  
  console.log("\n=== New Wallet Generated ===");
  console.log("Address:", wallet.address);
  console.log("Private Key:", wallet.privateKey);
  console.log("\n⚠️  IMPORTANT: This is for testing only!");
  console.log("⚠️  Never use this private key for real funds!");
  console.log("\nTo use this wallet:");
  console.log("1. Add this private key to your .env file:");
  console.log(`   PRIVATE_KEY=${wallet.privateKey}`);
  console.log("2. Send some ETH to this address for gas fees");
  console.log("3. Then deploy with: npx hardhat run scripts/deploy.cjs --network worldchain");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
