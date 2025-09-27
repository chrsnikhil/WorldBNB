"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MiniKit } from '@worldcoin/minikit-js'
import PropertyHostingABI from '../abi/PropertyHosting.json'
import SimpleFileUpload from './SimpleFileUpload'

interface PropertyFormData {
  name: string
  description: string
  location: string
  pricePerNight: string
  imageHash: string
}

interface PropertyListingFormProps {
  onPropertyListed: (propertyId: number) => void
  onClose: () => void
  hostAddress?: string
}

export default function PropertyListingForm({ onPropertyListed, onClose, hostAddress }: PropertyListingFormProps) {
  
  // Simple close handler
  const handleClose = () => {
    onClose();
  };
  console.log('🏠 PropertyListingForm component rendered!');
  console.log('🏠 hostAddress prop:', hostAddress);
  
  // Fallback to World App wallet address if hostAddress is not provided
  const userAddress = hostAddress || (typeof window !== 'undefined' && (window as any).MiniKit?.walletAddress) || "0x0000000000000000000000000000000000000000";
  console.log('🏠 Final userAddress for Filecoin:', userAddress);
  const [formData, setFormData] = useState<PropertyFormData>({
    name: '',
    description: '',
    location: '',
    pricePerNight: '',
    imageHash: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showFileUpload, setShowFileUpload] = useState(false)

  // Get wallet address from MiniKit or use provided hostAddress
  const getWalletAddress = () => {
    if (hostAddress) {
      return hostAddress
    }
    
    // Try multiple ways to get the wallet address
    if (typeof window !== 'undefined') {
      // Method 1: Try MiniKit.walletAddress
      if ((window as any).MiniKit?.walletAddress) {
        console.log('Found wallet address via MiniKit.walletAddress:', (window as any).MiniKit.walletAddress)
        return (window as any).MiniKit.walletAddress
      }
      
      // Method 2: Try to get from authentication payload (if stored)
      const authData = localStorage.getItem('worldbnb_auth')
      if (authData) {
        try {
          const parsed = JSON.parse(authData)
          if (parsed.walletAddress) {
            console.log('Found wallet address via localStorage:', parsed.walletAddress)
            return parsed.walletAddress
          }
        } catch (e) {
          console.log('Error parsing auth data:', e)
        }
      }
      
      // Method 3: Try to get from window object (if set elsewhere)
      if ((window as any).userWalletAddress) {
        console.log('Found wallet address via window.userWalletAddress:', (window as any).userWalletAddress)
        return (window as any).userWalletAddress
      }
    }
    
    console.log('No wallet address found')
    return null
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setIsLoading(true)
    setError(null)

    try {
      // Get the wallet address
      const walletAddress = getWalletAddress()
      if (!walletAddress) {
        setError('Wallet address not available. Please ensure you are connected to World App and try refreshing the page.')
        setIsLoading(false)
        return
      }

      console.log('Using wallet address for host:', walletAddress)

      // Convert price to wei (assuming price is in WLD, 18 decimals)
      const priceInWei = (parseFloat(formData.pricePerNight) * 10**18).toString()

      // Send transaction directly to smart contract
      const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: process.env.NEXT_PUBLIC_PROPERTY_HOSTING_ADDRESS!,
            abi: PropertyHostingABI,
            functionName: 'listPropertyForHost',
            args: [
              walletAddress, // _host (user's wallet address)
              formData.name,
              formData.description,
              formData.location,
              priceInWei, // _pricePerNight in wei
              'QmDefaultImageHash' // Always use default hash, ignore uploaded image
            ],
          },
        ],
        formatPayload: false, // Use false as per docs when issues occur
      })

      if (finalPayload.status === 'error') {
        console.error('Transaction failed:', finalPayload);
        
        // Check if there's a debug URL
        if (finalPayload.debug_url) {
          console.log('Debug URL:', finalPayload.debug_url);
          setError(`Transaction simulation failed. Check debug URL: ${finalPayload.debug_url}`);
          return;
        }
        
        setError(finalPayload.error || 'Transaction simulation failed');
        return;
      }

      // For now, we'll use a placeholder property ID
      // In a real implementation, you'd parse the transaction receipt to get the actual property ID
      const propertyId = 1 // This would come from parsing the transaction receipt
      
      onPropertyListed(propertyId)
      onClose()
      
    } catch (err: any) {
      setError(err.message || 'Transaction failed. Please try again.')
      console.error('Property listing error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleImageUploaded = (imageUrl: string) => {
    console.log("🖼️ Image uploaded to form! URL length:", imageUrl.length);
    setFormData(prev => ({
      ...prev,
      imageHash: imageUrl
    }))
    setShowFileUpload(false)
  }


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[99999]"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">List Your Property</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Property Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
              placeholder="Beautiful Beach House"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
              placeholder="Describe your property..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
              placeholder="Miami, FL"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price per Night (WLD)
            </label>
            <input
              type="number"
              name="pricePerNight"
              value={formData.pricePerNight}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
              placeholder="0.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Property Image
            </label>
            <div className="space-y-2">
              {formData.imageHash ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-green-700">Image stored on Filecoin (mock)</span>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, imageHash: '' }))}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  {/* Show uploaded image preview */}
                  <div>
                    <img 
                      src={formData.imageHash} 
                      alt="Uploaded property" 
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowFileUpload(true)}
                  className="w-full p-3 sm:p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 transition-colors text-left"
                >
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm sm:text-base text-gray-700 font-medium">Upload to Filecoin</p>
                      <p className="text-xs sm:text-sm text-gray-500">Decentralized, permanent storage</p>
                    </div>
                  </div>
                </button>
              )}
            </div>
          </div>


          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Listing...' : 'List Property'}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Simple File Upload Modal */}
      {showFileUpload && (
        <SimpleFileUpload
          onImageUploaded={handleImageUploaded}
          onClose={() => setShowFileUpload(false)}
        />
      )}
    </motion.div>
  )
}
