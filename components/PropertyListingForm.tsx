"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MiniKit, VerifyCommandInput, VerificationLevel, ISuccessResult } from '@worldcoin/minikit-js'

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
}

export default function PropertyListingForm({ onPropertyListed, onClose }: PropertyListingFormProps) {
  console.log('🏠 PropertyListingForm component rendered!');
  const [formData, setFormData] = useState<PropertyFormData>({
    name: '',
    description: '',
    location: '',
    pricePerNight: '',
    imageHash: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isVerified, setIsVerified] = useState(false)

  const handleWorldIDVerification = async () => {
    if (!MiniKit.isInstalled()) {
      setError('World App is not available. Please open this app in World App.')
      return false
    }

    setIsVerifying(true)
    setError(null)

    try {
      const verifyPayload: VerifyCommandInput = {
        action: 'verifyuser', // Match your actual incognito action
        signal: '0x1234567890abcdef', // Use hex string like in docs
        verification_level: VerificationLevel.Orb, // Orb | Device
      }

      console.log('🔐 Starting World ID verification...')
      console.log('Verify payload:', verifyPayload)
      const { finalPayload } = await MiniKit.commandsAsync.verify(verifyPayload)
      
      console.log('Final payload:', finalPayload)
      
      if (finalPayload.status === 'error') {
        console.error('❌ Verification error:', finalPayload)
        setError(`Verification failed: ${finalPayload.error || 'Unknown error'}`)
        return false
      }

      // Verify the proof in the backend
      console.log('🔐 Verifying proof with backend...')
      const verifyResponse = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payload: finalPayload as ISuccessResult,
          action: 'verifyuser', // Match your actual incognito action
          signal: '0x1234567890abcdef',
        }),
      })

      const verifyResponseJson = await verifyResponse.json()
      console.log('Backend verification response:', verifyResponseJson)
      
      if (verifyResponseJson.status === 200) {
        console.log('✅ World ID verification successful!')
        setIsVerified(true)
        return true
      } else {
        console.error('❌ Backend verification failed:', verifyResponseJson)
        setError(`Verification failed: ${verifyResponseJson.message || 'Unknown error'}`)
        return false
      }
    } catch (error: any) {
      console.error('❌ Verification error:', error)
      setError('Verification failed. Please try again.')
      return false
    } finally {
      setIsVerifying(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // First, verify with World ID if not already verified
    if (!isVerified) {
      const verified = await handleWorldIDVerification()
      if (!verified) {
        return
      }
    }
    
    setIsLoading(true)
    setError(null)

    try {
      // Call the API to list property
      const response = await fetch('/api/list-property', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          location: formData.location,
          pricePerNight: parseFloat(formData.pricePerNight),
          imageHash: formData.imageHash || 'QmDefaultImageHash' // Default IPFS hash
        }),
      })

      const result = await response.json()

      if (result.success) {
        onPropertyListed(result.propertyId)
        onClose()
      } else {
        setError(result.error || 'Failed to list property')
      }
    } catch (err) {
      setError('Network error. Please try again.')
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-red-500/80 flex items-center justify-center p-4 z-[99999]"
      onClick={onClose}
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
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
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
              Image Hash (IPFS)
            </label>
            <input
              type="text"
              name="imageHash"
              value={formData.imageHash}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
              placeholder="QmYourImageHash (optional)"
            />
          </div>

          {/* World ID Verification Status */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">World ID Verification</span>
              {isVerified ? (
                <div className="flex items-center text-green-600">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm font-medium">Verified</span>
                </div>
              ) : (
                <div className="flex items-center text-orange-600">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="text-sm font-medium">Not Verified</span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-600 mb-3">
              You need to verify your identity with World ID to list a property. This helps prevent spam and ensures only verified humans can list properties.
            </p>
            {!isVerified && (
              <button
                type="button"
                onClick={handleWorldIDVerification}
                disabled={isVerifying}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {isVerifying ? 'Verifying...' : 'Verify with World ID'}
              </button>
            )}
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
              disabled={isLoading || !isVerified}
              className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Listing...' : isVerified ? 'List Property' : 'Verify First'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
