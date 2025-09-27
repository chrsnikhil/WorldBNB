"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MiniKit } from '@worldcoin/minikit-js'
import PropertyBookingABI from '../abi/PropertyBooking.json'

interface Property {
  id: number
  name: string
  description: string
  location: string
  pricePerNight: number
  host: string
  imageHash: string
}

interface PropertyBookingFormProps {
  property: Property
  onBookingCreated: (bookingId: number) => void
  onClose: () => void
}

export default function PropertyBookingForm({ property, onBookingCreated, onClose }: PropertyBookingFormProps) {
  const [checkInDate, setCheckInDate] = useState('')
  const [checkOutDate, setCheckOutDate] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const calculateTotal = () => {
    if (!checkInDate || !checkOutDate) return 0
    const start = new Date(checkInDate)
    const end = new Date(checkOutDate)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    return days * property.pricePerNight
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const startTimestamp = Math.floor(new Date(checkInDate).getTime() / 1000)
      const endTimestamp = Math.floor(new Date(checkOutDate).getTime() / 1000)

      console.log('Booking dates debug:')
      console.log('Check-in date string:', checkInDate)
      console.log('Check-out date string:', checkOutDate)
      console.log('Start timestamp:', startTimestamp)
      console.log('End timestamp:', endTimestamp)
      console.log('Start date:', new Date(startTimestamp * 1000))
      console.log('End date:', new Date(endTimestamp * 1000))
      console.log('Current time:', Math.floor(Date.now() / 1000))

      // Generate a unique payment reference
      const paymentReference = `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Send transaction directly to smart contract
      const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: process.env.NEXT_PUBLIC_PROPERTY_BOOKING_ADDRESS!,
            abi: PropertyBookingABI,
            functionName: 'createBooking',
            args: [
              property.id.toString(), // _propertyId
              startTimestamp.toString(), // _checkInDate
              endTimestamp.toString(), // _checkOutDate
              paymentReference // _paymentReference
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

      // For now, we'll use a placeholder booking ID
      // In a real implementation, you'd parse the transaction receipt to get the actual booking ID
      const bookingId = 1 // This would come from parsing the transaction receipt
      
      onBookingCreated(bookingId)
      onClose()
      
    } catch (err: any) {
      setError(err.message || 'Transaction failed. Please try again.')
      console.error('Booking error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
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
          <h2 className="text-xl font-bold text-gray-900">Book {property.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900">{property.name}</h3>
          <p className="text-sm text-gray-600">{property.location}</p>
          <p className="text-sm text-gray-600">{property.description}</p>
          <p className="text-lg font-bold text-orange-600 mt-2">
            {property.pricePerNight} WLD per night
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Check-in Date
            </label>
            <input
              type="date"
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)}
              min={today}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Check-out Date
            </label>
            <input
              type="date"
              value={checkOutDate}
              onChange={(e) => setCheckOutDate(e.target.value)}
              min={checkInDate || today}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
            />
          </div>

          {checkInDate && checkOutDate && (
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="flex justify-between text-sm text-gray-900">
                <span>Total nights:</span>
                <span>{Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24))}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-900">
                <span>Price per night:</span>
                <span>{property.pricePerNight} WLD</span>
              </div>
              <div className="flex justify-between text-sm text-gray-900">
                <span>Subtotal:</span>
                <span>{calculateTotal()} WLD</span>
              </div>
              <div className="flex justify-between text-sm text-gray-900">
                <span>Platform fee (3%):</span>
                <span className="text-red-600">-{(calculateTotal() * 0.03).toFixed(2)} WLD</span>
              </div>
              <div className="flex justify-between text-sm text-gray-900">
                <span>Host receives:</span>
                <span className="text-green-600">{(calculateTotal() * 0.97).toFixed(2)} WLD</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2 text-gray-900">
                <span>You pay:</span>
                <span className="text-orange-600">{calculateTotal()} WLD</span>
              </div>
              <div className="text-xs text-gray-600 mt-2">
                💡 Your payment goes to escrow. Host can claim funds after check-in.
              </div>
            </div>
          )}

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
              {isLoading ? 'Processing...' : 'Book Property'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
