const fs = require('fs');
const path = require('path');

// Contract addresses from local deployment
const contractAddresses = {
  PROPERTY_HOSTING_ADDRESS: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  PROPERTY_BOOKING_ADDRESS: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  NEXT_PUBLIC_PROPERTY_HOSTING_ADDRESS: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  NEXT_PUBLIC_PROPERTY_BOOKING_ADDRESS: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  WORLDCHAIN_RPC_URL: 'http://localhost:8545',
  PRIVATE_KEY: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  SKIP_SIWE_VERIFICATION: 'true'
};

// Create .env.local file
const envContent = Object.entries(contractAddresses)
  .map(([key, value]) => `${key}=${value}`)
  .join('\n');

const envPath = path.join(process.cwd(), '.env.local');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Environment variables created in .env.local');
  console.log('\n📋 Contract Addresses:');
  console.log(`   PropertyHosting: ${contractAddresses.PROPERTY_HOSTING_ADDRESS}`);
  console.log(`   PropertyBooking: ${contractAddresses.PROPERTY_BOOKING_ADDRESS}`);
  console.log('\n🚀 Your Mini App is ready to test!');
} catch (error) {
  console.error('❌ Error creating .env.local:', error.message);
}
