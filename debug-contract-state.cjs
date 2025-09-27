require('dotenv').config({ path: '.env.local' });

const { ethers } = require('ethers');

async function debugContractState() {
  console.log('=== Debug Contract State ===');
  console.log('RPC URL:', process.env.WORLDCHAIN_RPC_URL);
  console.log('Contract Address:', process.env.PROPERTY_HOSTING_ADDRESS);
  
  const provider = new ethers.JsonRpcProvider(process.env.WORLDCHAIN_RPC_URL);
  
  const contract = new ethers.Contract(
    process.env.PROPERTY_HOSTING_ADDRESS,
    [
      "function nextPropertyId() external view returns (uint256)",
      "function getPropertiesCount() external view returns (uint256)",
      "function getActivePropertiesCount() external view returns (uint256)",
      "function getActiveProperties() external view returns (uint256[])"
    ],
    provider
  );
  
  try {
    console.log('\n=== Contract State ===');
    
    const nextId = await contract.nextPropertyId();
    const totalCount = await contract.getPropertiesCount();
    const activeCount = await contract.getActivePropertiesCount();
    const activeProperties = await contract.getActiveProperties();
    
    console.log('Next Property ID:', Number(nextId));
    console.log('Total Properties:', Number(totalCount));
    console.log('Active Properties Count:', Number(activeCount));
    console.log('Active Property IDs:', activeProperties.map(id => Number(id)));
    
    if (Number(nextId) > 1) {
      console.log('\n=== Individual Properties ===');
      for (let i = 1; i < Number(nextId); i++) {
        try {
          const property = await contract.getProperty(i);
          console.log(`Property ${i}:`, {
            name: property.name,
            location: property.location,
            isActive: property.isActive,
            host: property.host
          });
        } catch (error) {
          console.log(`Property ${i}: Error - ${error.message}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Contract call error:', error.message);
    console.error('Code:', error.code);
    console.error('Value:', error.value);
  }
}

debugContractState().catch(console.error);
