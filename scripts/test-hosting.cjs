const { ethers } = require('ethers');

async function testPropertyHosting() {
  console.log('🧪 Testing Property Hosting System...\n');

  // Contract addresses from local deployment
  const PROPERTY_HOSTING_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
  const RPC_URL = 'http://localhost:8545';

  try {
    // Connect to local Hardhat network
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', provider);

    console.log('📡 Connected to local Hardhat network');
    console.log('👤 Wallet address:', wallet.address);

    // Contract ABI for PropertyHosting
    const PROPERTY_HOSTING_ABI = [
      "function listProperty(string memory _name, string memory _description, string memory _location, uint256 _pricePerNight, string memory _imageHash) external returns (uint256)",
      "function getActiveProperties() external view returns (uint256[])",
      "function getProperty(uint256 _propertyId) external view returns (tuple(uint256 id, address host, string name, string description, string location, uint256 pricePerNight, bool isActive, uint256 createdAt, string imageHash))"
    ];

    const propertyHosting = new ethers.Contract(
      PROPERTY_HOSTING_ADDRESS,
      PROPERTY_HOSTING_ABI,
      wallet
    );

    console.log('\n🏠 Contract connected:', PROPERTY_HOSTING_ADDRESS);

    // Test 1: List a property
    console.log('\n📝 Test 1: Listing a property...');
    const tx = await propertyHosting.listProperty(
      'Beautiful Beach House',
      'Amazing ocean view with private beach access',
      'Miami, FL',
      ethers.parseUnits('0.5', 18), // 0.5 WLD
      'QmTestImageHash'
    );
    
    const receipt = await tx.wait();
    console.log('✅ Property listed successfully!');
    console.log('📄 Transaction hash:', receipt.hash);

    // Test 2: Get active properties
    console.log('\n📋 Test 2: Fetching active properties...');
    const propertyIds = await propertyHosting.getActiveProperties();
    console.log('🏠 Active property IDs:', propertyIds.map(id => Number(id)));

    // Test 3: Get property details
    if (propertyIds.length > 0) {
      console.log('\n🔍 Test 3: Getting property details...');
      const propertyId = propertyIds[0];
      const property = await propertyHosting.getProperty(propertyId);
      
      console.log('📋 Property Details:');
      console.log('   ID:', Number(property.id));
      console.log('   Name:', property.name);
      console.log('   Description:', property.description);
      console.log('   Location:', property.location);
      console.log('   Price per night:', ethers.formatUnits(property.pricePerNight, 18), 'WLD');
      console.log('   Host:', property.host);
      console.log('   Active:', property.isActive);
      console.log('   Created at:', new Date(Number(property.createdAt) * 1000).toLocaleString());
    }

    console.log('\n🎉 All tests passed! Your property hosting system is working correctly.');
    console.log('\n📱 Next steps:');
    console.log('1. Start your app: npm run dev');
    console.log('2. Open in World App');
    console.log('3. Test the "Host" tab to list properties');
    console.log('4. Test the "Properties" tab to view all properties');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure Hardhat node is running: npx hardhat node');
    console.log('2. Check that contracts are deployed');
    console.log('3. Verify the contract addresses are correct');
  }
}

testPropertyHosting();
