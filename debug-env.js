// Debug script to check environment variables
console.log('=== Environment Variables Debug ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('WORLDCHAIN_RPC_URL:', process.env.WORLDCHAIN_RPC_URL);
console.log('PRIVATE_KEY:', process.env.PRIVATE_KEY ? 'SET' : 'NOT SET');
console.log('PROPERTY_HOSTING_ADDRESS:', process.env.PROPERTY_HOSTING_ADDRESS);

// Test wallet creation
const { ethers } = require('ethers');

if (process.env.PRIVATE_KEY) {
  try {
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
    console.log('Wallet Address:', wallet.address);
    console.log('Expected Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
    console.log('Address Match:', wallet.address === '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
  } catch (error) {
    console.error('Error creating wallet:', error.message);
  }
} else {
  console.log('❌ PRIVATE_KEY not set');
}
