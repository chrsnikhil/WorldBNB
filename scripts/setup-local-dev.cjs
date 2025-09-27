const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up local development environment...\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log('✅ .env.local already exists');
} else {
  console.log('📝 Creating .env.local file...');
  
  const envContent = `# WorldCoin MiniKit Configuration
APP_ID=your_app_id_here
DEV_PORTAL_API_KEY=your_dev_portal_api_key_here

# World Chain Configuration
WORLDCHAIN_RPC_URL=http://localhost:8545
WORLDCHAIN_SEPOLIA_RPC_URL=https://worldchain-sepolia.g.alchemy.com/public

# Wallet Configuration (for local development)
PRIVATE_KEY=your_private_key_here

# Contract Addresses (will be set after deployment)
PROPERTY_HOSTING_ADDRESS=0x0000000000000000000000000000000000000000
PROPERTY_BOOKING_ADDRESS=0x0000000000000000000000000000000000000000

# Public contract addresses (for frontend)
NEXT_PUBLIC_PROPERTY_HOSTING_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_PROPERTY_BOOKING_ADDRESS=0x0000000000000000000000000000000000000000

# Development settings
SKIP_SIWE_VERIFICATION=true
NODE_ENV=development`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env.local created');
}

console.log('\n📋 Next steps:');
console.log('1. Start Hardhat node: npx hardhat node');
console.log('2. Deploy contracts: npx hardhat run scripts/deploy.cjs --network localhost');
console.log('3. Copy contract addresses to .env.local');
console.log('4. Generate test wallet: node scripts/generate-key.cjs');
console.log('5. Start the app: npm run dev');
console.log('\n🎉 Ready for local development!');
