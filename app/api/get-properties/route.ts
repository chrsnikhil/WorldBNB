import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

// Contract ABI for PropertyHosting
const PROPERTY_HOSTING_ABI = [
  "function getActiveProperties() external view returns (uint256[])",
  "function getProperty(uint256 _propertyId) external view returns (tuple(uint256 id, address host, string name, string description, string location, uint256 pricePerNight, bool isActive, uint256 createdAt, string imageHash))"
];

export async function GET(req: NextRequest) {
  try {
    console.log('📋 Fetching properties request received');
    
    if (!process.env.WORLDCHAIN_RPC_URL || !process.env.PROPERTY_HOSTING_ADDRESS) {
      console.log('❌ Missing environment variables for property fetching');
      return NextResponse.json({ 
        success: false, 
        error: 'Server not configured for property fetching' 
      }, { status: 500 });
    }

    // Connect to local Hardhat network
    const provider = new ethers.JsonRpcProvider(process.env.WORLDCHAIN_RPC_URL);
    const propertyHosting = new ethers.Contract(
      process.env.PROPERTY_HOSTING_ADDRESS,
      PROPERTY_HOSTING_ABI,
      provider
    );

    console.log('🔗 Connecting to blockchain...');
    console.log('📍 Contract address:', process.env.PROPERTY_HOSTING_ADDRESS);
    
    console.log('📤 Fetching active properties...');
    
    // Get all active property IDs
    let propertyIds;
    try {
      propertyIds = await propertyHosting.getActiveProperties();
      console.log('📋 Found property IDs:', propertyIds.map(id => Number(id)));
    } catch (error: any) {
      if (error.code === 'BAD_DATA' && error.value === '0x') {
        console.log('Error:', error);
        console.log('📋 No properties found (empty contract)');
        propertyIds = [];
      } else {
        throw error;
      }
    }

    // Fetch details for each property
    const properties = propertyIds.length > 0 ? await Promise.all(
      propertyIds.map(async (id: any) => {
        try {
          const property = await propertyHosting.getProperty(id);
          return {
            id: Number(property.id),
            host: property.host,
            name: property.name,
            description: property.description,
            location: property.location,
            pricePerNight: Number(ethers.formatUnits(property.pricePerNight, 18)),
            isActive: property.isActive,
            createdAt: Number(property.createdAt),
            imageHash: property.imageHash
          };
        } catch (error) {
          console.error(`Error fetching property ${id}:`, error);
          return null;
        }
      })
    ) : [];

    // Filter out null results
    const validProperties = properties.filter(property => property !== null);
    
    console.log('✅ Properties fetched successfully!');
    console.log('🏠 Total properties:', validProperties.length);
    validProperties.forEach((property, index) => {
      console.log(`   ${index + 1}. ${property.name} - ${property.location} (${property.pricePerNight} WLD/night)`);
    });

    return NextResponse.json({ 
      success: true, 
      properties: validProperties
    });
  } catch (error: any) {
    console.error('❌ Error fetching properties:', error);
    console.error('📋 Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}
