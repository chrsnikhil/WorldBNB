"use client";

import { useState } from 'react';
import { MiniKit } from '@worldcoin/minikit-js';

interface ContractConnectionTestProps {
  walletAddress?: string;
}

export default function ContractConnectionTest({ walletAddress: propWalletAddress }: ContractConnectionTestProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  const testContractConnection = async () => {
    setIsLoading(true);
    setError('');
    setResult('');

    try {
      let walletAddress = propWalletAddress;
      
      if (!walletAddress && typeof window !== 'undefined' && (window as any).MiniKit?.walletAddress) {
        walletAddress = (window as any).MiniKit.walletAddress;
      }

      if (!walletAddress) {
        throw new Error('Wallet address not available');
      }

      console.log('Testing contract connection with wallet:', walletAddress);
      console.log('Contract address:', process.env.NEXT_PUBLIC_PROPERTY_HOSTING_ADDRESS);

      // First, let's try to call a simple view function
      // We'll use a minimal ABI for nextPropertyId
      const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: process.env.NEXT_PUBLIC_PROPERTY_HOSTING_ADDRESS!,
            abi: [
              {
                "inputs": [],
                "name": "nextPropertyId",
                "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
              }
            ],
            functionName: 'nextPropertyId',
            args: [],
          },
        ],
        formatPayload: false,
      });

      console.log('Transaction result:', finalPayload);

      if (finalPayload.status === 'error') {
        console.error('Contract connection failed:', finalPayload);
        
        if (finalPayload.debug_url) {
          console.log('Debug URL:', finalPayload.debug_url);
          throw new Error(`Contract connection failed. Debug URL: ${finalPayload.debug_url}`);
        }
        
        throw new Error(finalPayload.error || 'Contract connection failed');
      }

      setResult(`Contract connection successful! Transaction ID: ${finalPayload.transaction_id}`);
      
    } catch (err: any) {
      setError(err.message || 'Contract connection failed');
      console.error('Contract connection error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
      <h4 className="text-sm font-bold text-blue-800 mb-2">Contract Connection Test</h4>
      
      <div className="space-y-2">
        <div className="text-xs text-blue-700">
          <p><strong>Contract Address:</strong> {process.env.NEXT_PUBLIC_PROPERTY_HOSTING_ADDRESS || 'Not set'}</p>
          <p><strong>Wallet Address:</strong> {propWalletAddress || 'Not available'}</p>
        </div>

        <button
          onClick={testContractConnection}
          disabled={isLoading || !process.env.NEXT_PUBLIC_PROPERTY_HOSTING_ADDRESS}
          className="w-full px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Testing...' : 'Test Contract Connection'}
        </button>

        {result && (
          <div className="p-2 bg-green-50 text-green-800 rounded text-xs">
            ✅ {result}
          </div>
        )}

        {error && (
          <div className="p-2 bg-red-50 text-red-800 rounded text-xs">
            ❌ {error}
          </div>
        )}
      </div>
    </div>
  );
}
