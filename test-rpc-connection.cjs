require('dotenv').config({ path: '.env.local' });

const { ethers } = require('ethers');

async function testRPCConnection() {
  console.log('=== RPC Connection Test ===');
  console.log('RPC URL:', process.env.WORLDCHAIN_RPC_URL);
  
  const provider = new ethers.JsonRpcProvider(process.env.WORLDCHAIN_RPC_URL);
  
  try {
    // Test basic connection
    const blockNumber = await provider.getBlockNumber();
    console.log('✅ RPC connected - Latest block:', blockNumber);
    
    // Test getting a specific block
    const block = await provider.getBlock(blockNumber);
    console.log('✅ Block data retrieved - Block hash:', block.hash);
    
    // Test getting balance of a known address
    const balance = await provider.getBalance('0x33450c70dA7CD8815649bA02F6F7D9814F92f154');
    console.log('✅ Balance check - Balance:', ethers.formatEther(balance), 'ETH');
    
    // Test contract existence by checking if it has code
    const code = await provider.getCode('0x3Db0ef438a0F8D2Ef39D32aF1fdF42C06e664BF8');
    console.log('Contract code length:', code.length);
    if (code === '0x') {
      console.log('❌ Contract has no code - not deployed or wrong address');
    } else {
      console.log('✅ Contract has code - is deployed');
    }
    
  } catch (error) {
    console.error('❌ RPC connection failed:', error.message);
  }
}

testRPCConnection().catch(console.error);
