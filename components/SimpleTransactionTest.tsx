"use client";

import { useState } from 'react';
import { MiniKit } from '@worldcoin/minikit-js';

interface SimpleTransactionTestProps {
  walletAddress?: string;
}

export default function SimpleTransactionTest({ walletAddress: propWalletAddress }: SimpleTransactionTestProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  const testSimpleTransaction = async () => {
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

      console.log('Testing simple transaction with wallet:', walletAddress);

      // Try a very simple transaction first - just call a view function
      // Let's try calling nextPropertyId() which is a view function
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

      if (finalPayload.status === 'error') {
        console.error('Simple transaction failed:', finalPayload);
        
        if (finalPayload.debug_url) {
          console.log('Debug URL:', finalPayload.debug_url);
          throw new Error(`Transaction simulation failed. Check debug URL: ${finalPayload.debug_url}`);
        }
        
        throw new Error(finalPayload.error || 'Transaction simulation failed');
      }

      setResult(`Simple transaction successful! ID: ${finalPayload.transaction_id}`);
      
    } catch (err: any) {
      setError(err.message || 'Transaction failed');
      console.error('Simple transaction error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
      <h4 className="text-sm font-bold text-yellow-800 mb-2">Simple Transaction Test</h4>
      
      <div className="space-y-2">
        <p className="text-xs text-yellow-700">
          This tests a simple view function call to verify the contract connection.
        </p>

        <button
          onClick={testSimpleTransaction}
          disabled={isLoading}
          className="w-full px-3 py-2 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 disabled:opacity-50"
        >
          {isLoading ? 'Testing...' : 'Test Simple Call'}
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
