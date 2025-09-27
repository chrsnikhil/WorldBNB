"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MiniKit } from '@worldcoin/minikit-js'

interface Dispute {
  id: number
  bookingId: number
  initiator: string
  reason: string
  status: 'Pending' | 'Resolved' | 'Cancelled'
  createdAt: number
}

interface DisputeManagerProps {
  userAddress?: string
  bookings: any[]
  onDisputeCreated: () => void
}

export default function DisputeManager({ userAddress, bookings, onDisputeCreated }: DisputeManagerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showCreateDispute, setShowCreateDispute] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<any>(null)
  const [disputeReason, setDisputeReason] = useState('')
  const [disputeEvidence, setDisputeEvidence] = useState('')

  const createDispute = async (bookingId: number, isGuestDispute: boolean) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: process.env.NEXT_PUBLIC_DISPUTE_ADDRESS!,
            abi: [
              {
                "inputs": [
                  {"internalType": "uint256", "name": "_bookingId", "type": "uint256"},
                  {"internalType": "bool", "name": "_isGuestDispute", "type": "bool"},
                  {"internalType": "string", "name": "_reason", "type": "string"},
                  {"internalType": "string", "name": "_evidence", "type": "string"}
                ],
                "name": "createDispute",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
              }
            ],
            functionName: 'createDispute',
            args: [
              bookingId.toString(),
              isGuestDispute,
              disputeReason,
              disputeEvidence
            ],
          },
        ],
        formatPayload: false,
      })

      if (finalPayload.status === 'error') {
        throw new Error(finalPayload.error || 'Dispute creation failed')
      }

      setSuccess('Dispute created successfully! Platform will review and resolve.')
      setShowCreateDispute(false)
      setSelectedBooking(null)
      setDisputeReason('')
      setDisputeEvidence('')
      onDisputeCreated()
      
    } catch (err: any) {
      setError(err.message || 'Dispute creation failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateDispute = (booking: any, isGuestDispute: boolean) => {
    setSelectedBooking(booking)
    setShowCreateDispute(true)
  }

  const submitDispute = () => {
    if (!selectedBooking || !disputeReason.trim()) {
      setError('Please provide a reason for the dispute')
      return
    }

    const isGuestDispute = selectedBooking.guest === userAddress
    createDispute(selectedBooking.id, isGuestDispute)
  }

  return (
    <div className="space-y-6">
      {/* Dispute Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-red-500 to-orange-600 rounded-xl p-6 text-white"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">⚖️ Dispute Resolution</h2>
          <p className="text-red-100">
            Create disputes for unfair treatment. Get reimbursed if you're the victim.
          </p>
        </div>
      </motion.div>

      {/* Your Bookings - Can Create Disputes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl p-6 shadow-lg"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Bookings</h3>
        
        {bookings.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No bookings found</p>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">Booking #{booking.id}</h4>
                    <p className="text-sm text-gray-600">
                      {new Date(booking.checkInDate * 1000).toLocaleDateString()} - 
                      {new Date(booking.checkOutDate * 1000).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">Amount: {booking.totalAmount} WLD</p>
                  </div>
                  
                  <div className="flex space-x-2">
                    {booking.guest === userAddress && (
                      <button
                        onClick={() => handleCreateDispute(booking, true)}
                        className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                      >
                        Dispute as Guest
                      </button>
                    )}
                    
                    {booking.host === userAddress && (
                      <button
                        onClick={() => handleCreateDispute(booking, false)}
                        className="px-3 py-1 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 transition-colors"
                      >
                        Dispute as Host
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Create Dispute Modal */}
      {showCreateDispute && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Create Dispute for Booking #{selectedBooking?.id}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Dispute
                </label>
                <textarea
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="Describe the issue (e.g., property not as described, guest damaged property, etc.)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Evidence (Optional)
                </label>
                <textarea
                  value={disputeEvidence}
                  onChange={(e) => setDisputeEvidence(e.target.value)}
                  placeholder="Provide evidence (photos, messages, receipts, etc.)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
                  rows={2}
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCreateDispute(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitDispute}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Creating...' : 'Create Dispute'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-green-800 text-sm">{success}</p>
        </div>
      )}
    </div>
  )
}
