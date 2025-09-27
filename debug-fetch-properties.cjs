require('dotenv').config({ path: '.env.local' });

const { ethers } = require('ethers');

async function debugFetchProperties() {
  console.log('=== Debug Fetch Properties ===');
  console.log('RPC URL:', process.env.WORLDCHAIN_RPC_URL);
  console.log('Contract Address:', process.env.PROPERTY_HOSTING_ADDRESS);
  
  const provider = new ethers.JsonRpcProvider(process.env.WORLDCHAIN_RPC_URL);
  
  // Contract ABI for PropertyHosting
  const PROPERTY_HOSTING_ABI = [
    "function getActiveProperties() external view returns (uint256[])",
    "function getProperty(uint256 _propertyId) external view returns (tuple(uint256 id, address host, string name, string description, string location, uint256 pricePerNight, bool isActive, uint256 createdAt, string imageHash))",
    "function nextPropertyId() external view returns (uint256)",
    "function getPropertiesCount() external view returns (uint256)"
  ];
  
  const propertyHosting = new ethers.Contract(
    process.env.PROPERTY_HOSTING_ADDRESS,
    PROPERTY_HOSTING_ABI,
    provider
  );
  
  try {
    console.log('\n=== Basic Contract Info ===');
    
    // Check if contract has code
    const code = await provider.getCode(process.env.PROPERTY_HOSTING_ADDRESS);
    console.log('Contract code length:', code.length);
    if (code === '0x') {
      console.log('❌ Contract has no code - not deployed');
      return;
    } else {
      console.log('✅ Contract has code - is deployed');
    }
    
    // Try to call basic functions
    console.log('\n=== Contract Function Calls ===');
    
    try {
      const nextId = await propertyHosting.nextPropertyId();
      console.log('✅ nextPropertyId():', Number(nextId));
    } catch (error) {
      console.log('❌ nextPropertyId() failed:', error.message);
    }
    
    try {
      const totalCount = await propertyHosting.getPropertiesCount();
      console.log('✅ getPropertiesCount():', Number(totalCount));
    } catch (error) {
      console.log('❌ getPropertiesCount() failed:', error.message);
    }
    
    try {
      const activeProperties = await propertyHosting.getActiveProperties();
      console.log('✅ getActiveProperties():', activeProperties.map(id => Number(id)));
      
      if (activeProperties.length > 0) {
        console.log('\n=== Property Details ===');
        for (const id of activeProperties) {
          try {
            const property = await propertyHosting.getProperty(id);
            console.log(`Property ${Number(id)}:`, {
              name: property.name,
              location: property.location,
              pricePerNight: ethers.formatUnits(property.pricePerNight, 18),
              isActive: property.isActive,
              host: property.host
            });
          } catch (error) {
            console.log(`❌ Error fetching property ${Number(id)}:`, error.message);
          }
        }
      } else {
        console.log('📋 No active properties found');
      }
    } catch (error) {
      console.log('❌ getActiveProperties() failed:', error.message);
      console.log('Error code:', error.code);
      console.log('Error value:', error.value);
    }
    
  } catch (error) {
    console.error('❌ General error:', error.message);
    console.error('Error code:', error.code);
    console.error('Error value:', error.value);
  }
}

debugFetchProperties().catch(console.error);
