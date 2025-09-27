import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

export async function GET(req: NextRequest) {
  try {
    console.log('=== SERVER ENVIRONMENT DEBUG ===');
    console.log('PRIVATE_KEY from server env:', process.env.PRIVATE_KEY ? 'SET' : 'NOT SET');
    console.log('WORLDCHAIN_RPC_URL from server env:', process.env.WORLDCHAIN_RPC_URL);
    console.log('PROPERTY_HOSTING_ADDRESS from server env:', process.env.PROPERTY_HOSTING_ADDRESS);

    if (process.env.PRIVATE_KEY) {
      const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
      console.log('Wallet address from server PRIVATE_KEY:', wallet.address);
      console.log('Expected address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
      console.log('Address match:', wallet.address === '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');

      // Test balance
      const provider = new ethers.JsonRpcProvider(process.env.WORLDCHAIN_RPC_URL);
      const balance = await provider.getBalance(wallet.address);
      console.log('Wallet balance:', ethers.formatEther(balance), 'ETH');
      console.log('Balance (wei):', balance.toString());

      return NextResponse.json({
        success: true,
        debug: {
          privateKeySet: !!process.env.PRIVATE_KEY,
          walletAddress: wallet.address,
          expectedAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
          addressMatch: wallet.address === '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
          balance: ethers.formatEther(balance),
          rpcUrl: process.env.WORLDCHAIN_RPC_URL,
          contractAddress: process.env.PROPERTY_HOSTING_ADDRESS
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'PRIVATE_KEY not set in server environment'
      });
    }
  } catch (error: any) {
    console.error('Debug error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    });
  }
}
