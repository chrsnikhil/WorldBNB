// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  console.log("Deploying SimpleStaking contract only...");
  console.log("Network:", hre.network.name);
  console.log("Chain ID:", hre.network.config.chainId);

  // Get the signer
  const signers = await ethers.getSigners();
  console.log("Available signers:", signers.length);
  
  let deployer;
  if (signers.length === 0) {
    console.log("No signers from getSigners(), creating manual signer...");
    const privateKey = hre.network.name === 'worldchain' 
      ? process.env.PRIVATE_KEY 
      : process.env.PRIVATE_KEY1;
    if (!privateKey) {
      throw new Error(`Private key not found for network: ${hre.network.name}`);
    }
    
    // Create a provider and wallet manually
    const rpcUrl = hre.network.name === 'worldchain' 
      ? process.env.WORLDCHAIN_RPC_URL 
      : process.env.WORLDCHAIN_SEPOLIA_RPC_URL;
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    deployer = new ethers.Wallet(privateKey, provider);
    console.log("Manual signer created with address:", deployer.address);
  } else {
    deployer = signers[0];
    console.log("Using signer from getSigners():", deployer.address);
  }
  
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  // Deploy SimpleStaking contract
  console.log("Deploying SimpleStaking contract...");
  const SimpleStaking = await ethers.getContractFactory("SimpleStaking");
  const simpleStaking = await SimpleStaking.connect(deployer).deploy();
  
  console.log("Waiting for deployment confirmation...");
  const deploymentTx = simpleStaking.deploymentTransaction();
  console.log("Deployment transaction hash:", deploymentTx?.hash);
  
  await simpleStaking.waitForDeployment();
  
  const simpleStakingAddress = await simpleStaking.getAddress();
  console.log("SimpleStaking deployed to:", simpleStakingAddress);
  
  // Verify deployment by calling a function
  try {
    const requiredStake = await simpleStaking.REQUIRED_STAKE();
    console.log("✅ Contract verified - Required stake:", ethers.formatEther(requiredStake), "WLD");
  } catch (error) {
    console.error("❌ Contract verification failed:", error.message);
  }

  console.log("\n=== SimpleStaking Deployment Complete ===");
  console.log("SimpleStaking Address:", simpleStakingAddress);
  console.log("\nAdd this to your .env.local file:");
  console.log(`NEXT_PUBLIC_SIMPLE_STAKING_ADDRESS=${simpleStakingAddress}`);
  console.log("\nAlso add this contract address to your World ID Developer Portal!");

  return {
    network: hre.network.name,
    simpleStaking: simpleStakingAddress,
    deployedAt: new Date().toISOString()
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
