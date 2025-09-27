"use client";

import { useState } from 'react';
import { MiniKit } from '@worldcoin/minikit-js';
import PropertyHostingABI from '../abi/PropertyHosting.json';

interface DirectPropertyListingFormProps {
  onPropertyListed: (propertyId: string) => void;
  onClose: () => void;
}

export default function DirectPropertyListingForm({ onPropertyListed, onClose }: DirectPropertyListingFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    pricePerNight: '',
    imageHash: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Get user's wallet address
      const userAddress = MiniKit.walletAddress;
      if (!userAddress) {
        throw new Error('Wallet address not available');
      }

      // Convert price to wei (assuming price is in WLD, 18 decimals)
      const priceInWei = (parseFloat(formData.pricePerNight) * 10**18).toString();

      // Send transaction directly to smart contract
      const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: process.env.NEXT_PUBLIC_PROPERTY_HOSTING_ADDRESS!, // Your contract address
            abi: PropertyHostingABI,
            functionName: 'listPropertyForHost',
            args: [
              userAddress, // _host (user's wallet address)
              formData.name,
              formData.description,
              formData.location,
              priceInWei, // _pricePerNight in wei
              formData.imageHash
            ],
          },
        ],
      });

      if (finalPayload.status === 'error') {
        throw new Error(finalPayload.error || 'Transaction failed');
      }

      // Extract property ID from transaction result
      // Note: You might need to parse the transaction receipt to get the actual property ID
      const propertyId = "1"; // This would come from parsing the transaction receipt
      
      onPropertyListed(propertyId);
      
    } catch (error: any) {
      console.error('Error listing property:', error);
      setError(error.message || 'Failed to list property');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">List Your Property (Direct Transaction)</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Property Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price per Night (WLD)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.pricePerNight}
              onChange={(e) => setFormData({...formData, pricePerNight: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image Hash (IPFS)
            </label>
            <input
              type="text"
              value={formData.imageHash}
              onChange={(e) => setFormData({...formData, imageHash: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              placeholder="Qm..."
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Listing...' : 'List Property'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
