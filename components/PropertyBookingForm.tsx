"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { usePayment } from '../hooks/usePayment'

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
  const { bookProperty, isProcessing } = usePayment()

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
      const totalAmount = calculateTotal()

      // Book property with payment
      const result = await bookProperty(
        property.id,
        startTimestamp,
        endTimestamp,
        property.host,
        totalAmount,
        'WLD' as any, // Using WLD token
        `Booking for ${property.name} from ${checkInDate} to ${checkOutDate}`
      )

      if (result.success) {
        onBookingCreated(result.bookingId)
        onClose()
      } else {
        setError('Booking failed. Please try again.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed')
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {checkInDate && checkOutDate && (
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="flex justify-between text-sm">
                <span>Total nights:</span>
                <span>{Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Price per night:</span>
                <span>{property.pricePerNight} WLD</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                <span>Total:</span>
                <span className="text-orange-600">{calculateTotal()} WLD</span>
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
              disabled={isLoading || isProcessing}
              className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading || isProcessing ? 'Processing...' : 'Book & Pay'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
