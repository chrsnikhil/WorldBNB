const { ethers } = require("hardhat");

async function main() {
  console.log("Checking wallet configuration...");
  
  // Get the signer (wallet)
  const [signer] = await ethers.getSigners();
  const address = await signer.getAddress();
  const balance = await ethers.provider.getBalance(address);
  
  console.log("\n=== Wallet Information ===");
  console.log("Address:", address);
  console.log("Balance:", ethers.formatEther(balance), "ETH");
  console.log("Balance (wei):", balance.toString());
  
  if (balance === 0n) {
    console.log("\n⚠️  WARNING: Wallet has 0 ETH!");
    console.log("You need to get testnet ETH for this address:", address);
    console.log("Try a World Chain Sepolia faucet or bridge from Ethereum Sepolia.");
  } else {
    console.log("\n✅ Wallet has ETH! Ready to deploy.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
