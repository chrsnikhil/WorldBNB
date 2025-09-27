// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  console.log("Deploying contracts...");
  console.log("Network:", hre.network.name);
  console.log("Chain ID:", hre.network.config.chainId);
  console.log("PRIVATE_KEY1 available:", !!process.env.PRIVATE_KEY1);
  console.log("WORLDCHAIN_SEPOLIA_RPC_URL available:", !!process.env.WORLDCHAIN_SEPOLIA_RPC_URL);

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

  // Deploy PropertyHosting contract
  console.log("Deploying PropertyHosting contract...");
  const PropertyHosting = await ethers.getContractFactory("PropertyHosting");
  const propertyHosting = await PropertyHosting.connect(deployer).deploy();
  
  console.log("Waiting for deployment confirmation...");
  const deploymentTx = propertyHosting.deploymentTransaction();
  console.log("Deployment transaction hash:", deploymentTx?.hash);
  
  await propertyHosting.waitForDeployment();
  
  const propertyHostingAddress = await propertyHosting.getAddress();
  console.log("PropertyHosting deployed to:", propertyHostingAddress);
  
  // Verify deployment by calling a function
  try {
    const nextId = await propertyHosting.nextPropertyId();
    console.log("✅ Contract verified - Next Property ID:", Number(nextId));
  } catch (error) {
    console.error("❌ Contract verification failed:", error.message);
  }

  // Deploy PropertyBooking contract with platform wallet
  const PropertyBooking = await ethers.getContractFactory("PropertyBooking");
  const propertyBooking = await PropertyBooking.connect(deployer).deploy(propertyHostingAddress, deployer.address);
  await propertyBooking.waitForDeployment();
  
  const propertyBookingAddress = await propertyBooking.getAddress();
  console.log("PropertyBooking deployed to:", propertyBookingAddress);

  // Deploy WorldBNBStaking contract
  console.log("Deploying WorldBNBStaking contract...");
  const WorldBNBStaking = await ethers.getContractFactory("WorldBNBStaking");
  const stakingContract = await WorldBNBStaking.connect(deployer).deploy();
  await stakingContract.waitForDeployment();
  
  const stakingAddress = await stakingContract.getAddress();
  console.log("WorldBNBStaking deployed to:", stakingAddress);

  // Deploy DisputeResolution contract
  console.log("Deploying DisputeResolution contract...");
  const DisputeResolution = await ethers.getContractFactory("DisputeResolution");
  const disputeContract = await DisputeResolution.connect(deployer).deploy(stakingAddress);
  await disputeContract.waitForDeployment();
  
  const disputeAddress = await disputeContract.getAddress();
  console.log("DisputeResolution deployed to:", disputeAddress);

  // Deploy SimpleStaking contract
  console.log("Deploying SimpleStaking contract...");
  const SimpleStaking = await ethers.getContractFactory("SimpleStaking");
  const simpleStaking = await SimpleStaking.connect(deployer).deploy();
  await simpleStaking.waitForDeployment();
  
  const simpleStakingAddress = await simpleStaking.getAddress();
  console.log("SimpleStaking deployed to:", simpleStakingAddress);

  // Save deployment addresses
  const deploymentInfo = {
    network: "worldchain",
    propertyHosting: propertyHostingAddress,
    propertyBooking: propertyBookingAddress,
    staking: stakingAddress,
    disputeResolution: disputeAddress,
    simpleStaking: simpleStakingAddress,
    deployedAt: new Date().toISOString()
  };

  console.log("\n=== Deployment Complete ===");
  console.log("PropertyHosting:", propertyHostingAddress);
  console.log("PropertyBooking:", propertyBookingAddress);
  console.log("WorldBNBStaking:", stakingAddress);
  console.log("DisputeResolution:", disputeAddress);
  console.log("SimpleStaking:", simpleStakingAddress);
  console.log("\nSave these addresses for your frontend integration!");

  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });