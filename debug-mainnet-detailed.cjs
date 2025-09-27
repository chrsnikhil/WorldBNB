require('dotenv').config({ path: '.env.local' });

const { ethers } = require('ethers');

async function debugMainnetDetailed() {
  console.log('=== Detailed Mainnet Debug ===');
  console.log('Contract:', process.env.PROPERTY_HOSTING_ADDRESS);
  console.log('RPC:', process.env.WORLDCHAIN_RPC_URL);
  
  const provider = new ethers.JsonRpcProvider(process.env.WORLDCHAIN_RPC_URL);
  
  // Get latest block
  const latestBlock = await provider.getBlockNumber();
  console.log('Latest block:', latestBlock);
  
  const contract = new ethers.Contract(
    process.env.PROPERTY_HOSTING_ADDRESS,
    [
      "function getActiveProperties() external view returns (uint256[])",
      "function getPropertiesCount() external view returns (uint256)",
      "function nextPropertyId() external view returns (uint256)",
      "function getProperty(uint256 _propertyId) external view returns (tuple(uint256 id, address host, string name, string description, string location, uint256 pricePerNight, bool isActive, uint256 createdAt, string imageHash))",
      "function allPropertyIds(uint256) external view returns (uint256)"
    ],
    provider
  );
  
  try {
    console.log('\n=== Basic Contract State ===');
    const nextId = await contract.nextPropertyId();
    const totalCount = await contract.getPropertiesCount();
    const activeIds = await contract.getActiveProperties();
    
    console.log('Next Property ID:', Number(nextId));
    console.log('Total Properties:', Number(totalCount));
    console.log('Active Property IDs:', activeIds.map(id => Number(id)));
    
    // Check individual properties
    if (Number(nextId) > 1) {
      console.log('\n=== Individual Property Check ===');
      for (let i = 1; i < Number(nextId); i++) {
        try {
          const property = await contract.getProperty(i);
          console.log(`Property ${i}:`, {
            id: Number(property.id),
            name: property.name,
            isActive: property.isActive,
            host: property.host
          });
        } catch (error) {
          console.log(`Property ${i}: Error - ${error.message}`);
        }
      }
    }
    
    // Check allPropertyIds array
    console.log('\n=== allPropertyIds Array Check ===');
    try {
      for (let i = 0; i < Number(totalCount); i++) {
        const propertyId = await contract.allPropertyIds(i);
        console.log(`allPropertyIds[${i}]:`, Number(propertyId));
      }
    } catch (error) {
      console.log('Error reading allPropertyIds:', error.message);
    }
    
  } catch (error) {
    console.error('Contract call error:', error.message);
    console.error('Code:', error.code);
    console.error('Value:', error.value);
  }
}

debugMainnetDetailed().catch(console.error);
