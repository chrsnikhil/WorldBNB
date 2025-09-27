"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MiniKit } from '@worldcoin/minikit-js'

interface StakingInterfaceProps {
  userAddress?: string
  onStakeSuccess: () => void
}

export default function StakingInterface({ userAddress, onStakeSuccess }: StakingInterfaceProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const stakeAsUser = async () => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: process.env.NEXT_PUBLIC_STAKING_ADDRESS!,
            abi: [
              {
                "inputs": [],
                "name": "stakeAsUser",
                "outputs": [],
                "stateMutability": "payable",
                "type": "function"
              }
            ],
            functionName: 'stakeAsUser',
            args: [],
            value: '100000000000000000', // 0.1 WLD in wei
          },
        ],
        formatPayload: false,
      })

      if (finalPayload.status === 'error') {
        throw new Error(finalPayload.error || 'Staking failed')
      }

      setSuccess('Successfully staked as user! You can now book properties.')
      onStakeSuccess()
      
    } catch (err: any) {
      setError(err.message || 'Staking failed')
    } finally {
      setIsLoading(false)
    }
  }

  const stakeAsHost = async () => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: process.env.NEXT_PUBLIC_STAKING_ADDRESS!,
            abi: [
              {
                "inputs": [],
                "name": "stakeAsHost",
                "outputs": [],
                "stateMutability": "payable",
                "type": "function"
              }
            ],
            functionName: 'stakeAsHost',
            args: [],
            value: '100000000000000000', // 0.1 WLD in wei
          },
        ],
        formatPayload: false,
      })

      if (finalPayload.status === 'error') {
        throw new Error(finalPayload.error || 'Staking failed')
      }

      setSuccess('Successfully staked as host! You can now list properties.')
      onStakeSuccess()
      
    } catch (err: any) {
      setError(err.message || 'Staking failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl p-6 text-white"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">🔒 Staking Required</h2>
        <p className="text-purple-100">
          Stake 0.10 WLD to use WorldBNB. This ensures trust and enables dispute resolution.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* User Staking */}
        <div className="bg-white/10 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">👤 Stake as User</h3>
          <p className="text-sm text-purple-100 mb-4">
            Required to book properties. Get reimbursed if hosts scam you.
          </p>
          <button
            onClick={stakeAsUser}
            disabled={isLoading}
            className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Staking...' : 'Stake 0.10 WLD as User'}
          </button>
        </div>

        {/* Host Staking */}
        <div className="bg-white/10 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">🏠 Stake as Host</h3>
          <p className="text-sm text-purple-100 mb-4">
            Required to list properties. Get reimbursed if guests damage your property.
          </p>
          <button
            onClick={stakeAsHost}
            disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Staking...' : 'Stake 0.10 WLD as Host'}
          </button>
        </div>
      </div>

      {/* Benefits */}
      <div className="mt-6 bg-white/10 rounded-lg p-4">
        <h4 className="font-semibold mb-2">🛡️ Staking Benefits:</h4>
        <ul className="text-sm text-purple-100 space-y-1">
          <li>• <strong>User Protection:</strong> Get reimbursed if hosts scam you</li>
          <li>• <strong>Host Protection:</strong> Get reimbursed if guests damage property</li>
          <li>• <strong>Dispute Resolution:</strong> Fair arbitration system</li>
          <li>• <strong>Trust & Security:</strong> Only serious users participate</li>
        </ul>
      </div>

      {error && (
        <div className="mt-4 bg-red-500/20 border border-red-500/50 rounded-lg p-3">
          <p className="text-red-100 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mt-4 bg-green-500/20 border border-green-500/50 rounded-lg p-3">
          <p className="text-green-100 text-sm">{success}</p>
        </div>
      )}
    </motion.div>
  )
}
