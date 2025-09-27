const { ethers } = require('ethers');

async function debugWallet() {
  console.log('=== Wallet Debug ===');
  
  // Check environment variables
  console.log('PRIVATE_KEY from env:', process.env.PRIVATE_KEY ? 'SET' : 'NOT SET');
  console.log('WORLDCHAIN_RPC_URL from env:', process.env.WORLDCHAIN_RPC_URL || 'NOT SET');
  
  if (!process.env.PRIVATE_KEY) {
    console.log('❌ PRIVATE_KEY not found in environment');
    return;
  }
  
  try {
    // Create wallet from environment
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
    console.log('Wallet Address:', wallet.address);
    console.log('Expected Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
    console.log('Address Match:', wallet.address === '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
    
    // Connect to local Hardhat node
    const provider = new ethers.JsonRpcProvider('http://localhost:8545');
    const connectedWallet = wallet.connect(provider);
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log('Balance:', ethers.formatEther(balance), 'ETH');
    console.log('Balance (wei):', balance.toString());
    
    if (balance.isZero()) {
      console.log('❌ Wallet has 0 ETH!');
      console.log('This means the wallet address in your .env.local does not match any account with ETH on the Hardhat node.');
    } else {
      console.log('✅ Wallet has ETH!');
    }
    
    // Test a simple transaction
    console.log('\n=== Testing Transaction ===');
    try {
      const tx = await connectedWallet.sendTransaction({
        to: wallet.address,
        value: ethers.parseEther('0.001')
      });
      console.log('✅ Transaction successful:', tx.hash);
    } catch (error) {
      console.log('❌ Transaction failed:', error.message);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugWallet();
