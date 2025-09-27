"use client";

import { useState } from 'react';
import { MiniKit } from '@worldcoin/minikit-js';
import PropertyHostingABI from '../abi/PropertyHosting.json';

interface DirectTransactionTestProps {
  walletAddress?: string;
}

export default function DirectTransactionTest({ walletAddress: propWalletAddress }: DirectTransactionTestProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  const testPropertyListing = async () => {
    setIsLoading(true);
    setError('');
    setResult('');

    try {
      // Try multiple ways to get the wallet address
      let walletAddress = propWalletAddress; // Start with prop
      
      // Method 1: Try prop first
      if (walletAddress) {
        console.log('Using wallet address from prop:', walletAddress);
      }
      
      // Method 2: Try MiniKit.walletAddress
      if (!walletAddress && typeof window !== 'undefined' && (window as any).MiniKit?.walletAddress) {
        walletAddress = (window as any).MiniKit.walletAddress;
        console.log('Found wallet address via MiniKit.walletAddress:', walletAddress);
      }
      
      // Method 3: Try to get from authentication payload (if stored)
      if (!walletAddress && typeof window !== 'undefined') {
        const authData = localStorage.getItem('worldbnb_auth');
        if (authData) {
          try {
            const parsed = JSON.parse(authData);
            if (parsed.walletAddress) {
              walletAddress = parsed.walletAddress;
              console.log('Found wallet address via localStorage:', walletAddress);
            }
          } catch (e) {
            console.log('Error parsing auth data:', e);
          }
        }
      }
      
      // Method 4: Try to get from window object (if set elsewhere)
      if (!walletAddress && typeof window !== 'undefined' && (window as any).userWalletAddress) {
        walletAddress = (window as any).userWalletAddress;
        console.log('Found wallet address via window.userWalletAddress:', walletAddress);
      }

      if (!walletAddress) {
        throw new Error('Wallet address not available. Please ensure you are connected to World App and try refreshing the page.');
      }

      console.log('Testing direct transaction with wallet:', walletAddress);

      // Test transaction with minimal data
      const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: process.env.NEXT_PUBLIC_PROPERTY_HOSTING_ADDRESS!,
            abi: PropertyHostingABI,
            functionName: 'listPropertyForHost',
            args: [
              walletAddress, // _host
              'Test Property', // _name
              'Test Description', // _description
              'Test Location', // _location
              '1000000000000000000', // _pricePerNight (1 WLD in wei)
              'QmTestHash' // _imageHash
            ],
          },
        ],
        formatPayload: false, // Try without formatting as suggested in docs
      });

      if (finalPayload.status === 'error') {
        console.error('Transaction failed:', finalPayload);
        
        // Check if there's a debug URL
        if (finalPayload.debug_url) {
          console.log('Debug URL:', finalPayload.debug_url);
          throw new Error(`Transaction simulation failed. Check debug URL: ${finalPayload.debug_url}`);
        }
        
        throw new Error(finalPayload.error || 'Transaction simulation failed');
      }

      setResult(`Transaction successful! ID: ${finalPayload.transaction_id}`);
      
    } catch (err: any) {
      setError(err.message || 'Transaction failed');
      console.error('Test transaction error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto">
      <h3 className="text-lg font-bold mb-4">Direct Transaction Test</h3>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-2">
            This will test a direct transaction to list a property on the blockchain.
          </p>
          <div className="text-xs text-gray-500 mb-2">
            <p>Debug Info:</p>
            <p>• Prop wallet: {propWalletAddress ? 'Available' : 'Not available'}</p>
            <p>• MiniKit available: {typeof window !== 'undefined' && (window as any).MiniKit ? 'Yes' : 'No'}</p>
            <p>• MiniKit wallet: {typeof window !== 'undefined' && (window as any).MiniKit?.walletAddress ? 'Available' : 'Not available'}</p>
            <p>• Contract address: {process.env.NEXT_PUBLIC_PROPERTY_HOSTING_ADDRESS || 'Not set'}</p>
          </div>
        </div>

        <button
          onClick={testPropertyListing}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Testing...' : 'Test Property Listing'}
        </button>

        {result && (
          <div className="p-3 bg-green-50 text-green-800 rounded-lg text-sm">
            ✅ {result}
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 text-red-800 rounded-lg text-sm">
            ❌ {error}
          </div>
        )}
      </div>
    </div>
  );
}
