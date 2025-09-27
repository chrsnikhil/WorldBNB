const { ethers } = require('ethers');

async function checkBalance() {
  console.log('=== Checking Wallet Balance ===');
  
  // Your environment private key
  const privateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
  const provider = new ethers.JsonRpcProvider('http://localhost:8545');
  const wallet = new ethers.Wallet(privateKey, provider);
  
  console.log('Wallet Address:', wallet.address);
  console.log('Expected Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
  console.log('Address Match:', wallet.address === '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
  
  try {
    const balance = await provider.getBalance(wallet.address);
    console.log('Balance:', ethers.formatEther(balance), 'ETH');
    console.log('Balance (wei):', balance.toString());
    
    if (balance.isZero()) {
      console.log('❌ Wallet has 0 ETH!');
      console.log('This means the Hardhat node was restarted and lost all balances.');
    } else {
      console.log('✅ Wallet has ETH!');
    }
  } catch (error) {
    console.error('Error checking balance:', error.message);
  }
}

checkBalance();
