"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MiniKit } from '@worldcoin/minikit-js'
import WorldBNBStakingABI from '../abi/WorldBNBStaking.json'

interface StakingCheckProps {
  userAddress?: string
  onStakingComplete: () => void
}

export default function StakingCheck({ userAddress, onStakingComplete }: StakingCheckProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isStaked, setIsStaked] = useState(false)
  const [needsStaking, setNeedsStaking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check staking status
  useEffect(() => {
    const checkStakingStatus = async () => {
      if (!userAddress) {
        setIsLoading(false)
        return
      }

      try {
        // For now, we'll default to showing staking screen
        // In a real implementation, you'd call a view function to check staking status
        // This could be done via a backend API or direct contract call
        console.log('Checking staking status for:', userAddress)
        
        // Default to showing staking screen for now
        setNeedsStaking(true)
      } catch (err) {
        console.error('Error checking staking status:', err)
        setNeedsStaking(true) // Default to showing staking screen if check fails
      } finally {
        setIsLoading(false)
      }
    }

    checkStakingStatus()
  }, [userAddress, onStakingComplete])

  const stake = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const {commandPayload, finalPayload} = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: '0x66E38bC498Ca544216D789c61991CF5058313107', // WorldBNBStaking contract
            abi: WorldBNBStakingABI,
            functionName: 'stake',
            args: [],
            value: '0x16345785d8a0000', // 0.1 WLD = 100000000000000000 wei = 0x16345785d8a0000
          },
        ],
        formatPayload: false, // Set to false as per docs when experiencing issues
      })

      if (finalPayload.status === 'error') {
        setError(finalPayload.error || 'Staking failed')
        return
      }

      console.log('Staking transaction successful:', finalPayload)
      setIsStaked(true)
      onStakingComplete()
      
    } catch (err: any) {
      console.error('Staking error:', err)
      setError(err.message || 'Staking failed')
    } finally {
      setIsLoading(false)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-black flex items-center justify-center"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Checking Staking Status</h2>
          <p className="text-gray-400">Verifying your staking status...</p>
        </div>
      </motion.div>
    )
  }

  // Already staked - proceed to app
  if (isStaked) {
    return null // This will be handled by parent component
  }

  // Needs staking - show staking screen
  if (needsStaking) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-black flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-neutral-900 border border-neutral-700 rounded-2xl p-8 text-white max-w-md w-full shadow-2xl shadow-orange-500/10"
        >
          <div className="text-center mb-8">
            <motion.div 
              className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4"
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </motion.div>
            <h1 className="text-3xl font-bold mb-2 text-white">🔒 Staking Required</h1>
            <p className="text-gray-400">
              Stake 0.10 WLD to use WorldBNB. This ensures trust and enables dispute resolution.
            </p>
          </div>

          <div className="space-y-4">
            {/* Single Staking */}
            <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2 text-white">🔒 Stake to Use WorldBNB</h3>
              <p className="text-sm text-gray-400 mb-4">
                Stake 0.10 WLD to access the platform. Get reimbursed if you're scammed or if guests damage your property.
              </p>
              <motion.button
                onClick={stake}
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-lg disabled:opacity-50 transition-colors font-medium"
              >
                {isLoading ? 'Staking...' : 'Stake 0.10 WLD'}
              </motion.button>
            </div>
          </div>

          {/* Benefits */}
          <div className="mt-6 bg-neutral-800 border border-neutral-700 rounded-lg p-4">
            <h4 className="font-semibold mb-2 text-white">🛡️ Staking Benefits:</h4>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• <strong className="text-orange-400">Full Protection:</strong> Get reimbursed if you're scammed</li>
              <li>• <strong className="text-orange-400">Property Protection:</strong> Get reimbursed if guests damage your property</li>
              <li>• <strong className="text-orange-400">Dispute Resolution:</strong> Fair arbitration system</li>
              <li>• <strong className="text-orange-400">Trust & Security:</strong> Only serious users participate</li>
              <li>• <strong className="text-orange-400">One-Time Setup:</strong> Stake once, use forever</li>
            </ul>
          </div>

          {error && (
            <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
        </motion.div>
      </motion.div>
    )
  }

  return null
}
