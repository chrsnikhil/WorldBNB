import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

// Contract ABI for PropertyHosting
const PROPERTY_HOSTING_ABI = [
  "function listProperty(string memory _name, string memory _description, string memory _location, uint256 _pricePerNight, string memory _imageHash) external returns (uint256)",
  "function getProperty(uint256 _propertyId) external view returns (tuple(uint256 id, address host, string name, string description, string location, uint256 pricePerNight, bool isActive, uint256 createdAt, string imageHash))"
];

export async function POST(req: NextRequest) {
  try {
    console.log('🏠 Property listing request received');
    const { name, description, location, pricePerNight, imageHash } = await req.json();
    console.log('📝 Property details:', { name, description, location, pricePerNight, imageHash });

    if (!process.env.PRIVATE_KEY || !process.env.WORLDCHAIN_RPC_URL || !process.env.PROPERTY_HOSTING_ADDRESS) {
      console.log('❌ Missing environment variables');
      return NextResponse.json({ 
        success: false, 
        error: 'Server not configured for property listing' 
      }, { status: 500 });
    }

    // Connect to local Hardhat network
    const provider = new ethers.JsonRpcProvider(process.env.WORLDCHAIN_RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    // DEBUG: Check wallet address and balance
    console.log('🔍 DEBUG: Wallet Address:', wallet.address);
    console.log('🔍 DEBUG: Expected Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
    console.log('🔍 DEBUG: Address Match:', wallet.address === '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
    
    const balance = await provider.getBalance(wallet.address);
    console.log('🔍 DEBUG: Wallet Balance:', ethers.formatEther(balance), 'ETH');
    console.log('🔍 DEBUG: Balance (wei):', balance.toString());
    const propertyHosting = new ethers.Contract(
      process.env.PROPERTY_HOSTING_ADDRESS,
      PROPERTY_HOSTING_ABI,
      wallet
    );

    console.log('🔗 Connecting to blockchain...');
    console.log('📍 Contract address:', process.env.PROPERTY_HOSTING_ADDRESS);
    console.log('🌐 RPC URL:', process.env.WORLDCHAIN_RPC_URL);
    
    console.log('📤 Listing property on-chain...');
    const tx = await propertyHosting.listProperty(
      name,
      description,
      location,
      ethers.parseUnits(pricePerNight.toString(), 18), // Convert to wei
      imageHash
    );
    
    console.log('⏳ Waiting for transaction confirmation...');
    const receipt = await tx.wait();
    console.log('✅ Property listed successfully!');
    console.log('📄 Transaction hash:', receipt.hash);
    console.log('🔗 Transaction URL: http://localhost:8545 (Hardhat node)');

    // Get the property ID from the transaction logs
    const propertyId = receipt.logs[0]?.args?.[0] || 1; // Fallback to 1 if not found

    console.log('🎉 Property listing completed successfully!');
    console.log('🆔 Property ID:', Number(propertyId));
    
    return NextResponse.json({ 
      success: true, 
      propertyId: Number(propertyId),
      transactionHash: receipt.hash
    });
  } catch (error: any) {
    console.error('❌ Error listing property:', error);
    console.error('📋 Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to list property' },
      { status: 500 }
    );
  }
}
