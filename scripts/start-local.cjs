const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting local development environment...\n');

// Start Hardhat node in the background
console.log('1. Starting Hardhat node...');
const hardhatNode = spawn('npx', ['hardhat', 'node'], {
  stdio: 'pipe',
  cwd: process.cwd()
});

hardhatNode.stdout.on('data', (data) => {
  const output = data.toString();
  if (output.includes('Started HTTP and WebSocket JSON-RPC server')) {
    console.log('✅ Hardhat node started successfully!');
    console.log('   RPC URL: http://localhost:8545');
    console.log('   Chain ID: 31337\n');
    
    // Deploy contracts after node is ready
    setTimeout(() => {
      console.log('2. Deploying contracts...');
      const deploy = spawn('npx', ['hardhat', 'run', 'scripts/deploy.cjs', '--network', 'localhost'], {
        stdio: 'inherit',
        cwd: process.cwd()
      });
      
      deploy.on('close', (code) => {
        if (code === 0) {
          console.log('\n✅ Contracts deployed successfully!');
          console.log('\n📋 Contract Addresses:');
          console.log('   PropertyHosting: 0x5FbDB2315678afecb367f032d93F642f64180aa3');
          console.log('   PropertyBooking: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512');
          console.log('\n🎯 Your Mini App is ready to use these contracts!');
          console.log('\n💡 To stop the local node, press Ctrl+C');
        } else {
          console.log('❌ Contract deployment failed');
        }
      });
    }, 3000); // Wait 3 seconds for node to be ready
  }
});

hardhatNode.stderr.on('data', (data) => {
  console.error('Hardhat node error:', data.toString());
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping local development environment...');
  hardhatNode.kill();
  process.exit(0);
});

console.log('⏳ Waiting for Hardhat node to start...');
