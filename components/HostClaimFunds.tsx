"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'

interface Booking {
  id: number
  propertyId: number
  guest: string
  host: string
  checkInDate: number
  checkOutDate: number
  totalAmount: number
  platformFee: number
  hostAmount: number
  isConfirmed: boolean
  isCancelled: boolean
  fundsReleased: boolean
  createdAt: number
  paymentReference: string
}

interface HostClaimFundsProps {
  bookings: Booking[]
  onClaimFunds: (bookingId: number) => void
}

export default function HostClaimFunds({ bookings, onClaimFunds }: HostClaimFundsProps) {
  const [isLoading, setIsLoading] = useState<number | null>(null)

  const handleClaimFunds = async (bookingId: number) => {
    setIsLoading(bookingId)
    try {
      await onClaimFunds(bookingId)
    } catch (error) {
      console.error('Error claiming funds:', error)
    } finally {
      setIsLoading(null)
    }
  }

  const canClaimFunds = (booking: Booking) => {
    return (
      booking.isConfirmed &&
      !booking.fundsReleased &&
      !booking.isCancelled &&
      Date.now() / 1000 >= booking.checkInDate
    )
  }

  const claimableBookings = bookings.filter(canClaimFunds)

  if (claimableBookings.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">💰 Claim Funds</h3>
        <p className="text-gray-600">No funds available to claim at the moment.</p>
      </div>
    )
  }

  return (
    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
      <h3 className="text-lg font-semibold text-green-800 mb-4">💰 Claim Your Funds</h3>
      
      <div className="space-y-3">
        {claimableBookings.map((booking) => (
          <motion.div
            key={booking.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-4 rounded-lg border border-green-200"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-900">Booking #{booking.id}</span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    Ready to claim
                  </span>
                </div>
                
                <div className="text-sm text-gray-600 mb-2">
                  <div>Check-in: {new Date(booking.checkInDate * 1000).toLocaleDateString()}</div>
                  <div>Total paid: {booking.totalAmount} WLD</div>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Platform fee (3%):</span>
                  <span className="text-red-600">-{booking.platformFee} WLD</span>
                </div>
                
                <div className="flex justify-between text-sm font-semibold border-t pt-1 mt-1">
                  <span className="text-green-700">You receive:</span>
                  <span className="text-green-700">{booking.hostAmount} WLD</span>
                </div>
              </div>
              
              <button
                onClick={() => handleClaimFunds(booking.id)}
                disabled={isLoading === booking.id}
                className="ml-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading === booking.id ? 'Claiming...' : 'Claim Funds'}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="text-sm text-blue-800">
          <strong>How it works:</strong>
          <ul className="mt-1 ml-4 list-disc">
            <li>Guests pay into escrow when booking</li>
            <li>You can claim funds after check-in date</li>
            <li>Platform takes 3% fee automatically</li>
            <li>You receive 97% of the booking amount</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
