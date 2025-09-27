// Debug script to check wallet configuration
const { ethers } = require('ethers');

console.log('=== Wallet Debug ===');
console.log('PRIVATE_KEY:', process.env.PRIVATE_KEY ? 'SET' : 'NOT SET');

if (process.env.PRIVATE_KEY) {
  try {
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
    console.log('Wallet Address:', wallet.address);
    console.log('Expected Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
    console.log('Address Match:', wallet.address === '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
    
    // Test connection to local Hardhat node
    const provider = new ethers.JsonRpcProvider('http://localhost:8545');
    const connectedWallet = wallet.connect(provider);
    
    console.log('\n=== Testing Connection ===');
    console.log('Provider URL: http://localhost:8545');
    
    // Check balance
    provider.getBalance(wallet.address).then(balance => {
      console.log('Balance:', ethers.formatEther(balance), 'ETH');
      console.log('Balance (wei):', balance.toString());
    }).catch(error => {
      console.error('Error checking balance:', error.message);
    });
    
  } catch (error) {
    console.error('Error creating wallet:', error.message);
  }
} else {
  console.log('❌ PRIVATE_KEY not set');
}
