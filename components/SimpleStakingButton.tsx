"use client"

import { useState, useEffect } from 'react'
import { MiniKit } from '@worldcoin/minikit-js'
import SimpleStakingABI from '../abi/SimpleStaking.json'

interface SimpleStakingButtonProps {
  userAddress?: string
}

export default function SimpleStakingButton({ userAddress }: SimpleStakingButtonProps) {
  const [isStaked, setIsStaked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check staking status on mount
  useEffect(() => {
    checkStakeStatus()
  }, [userAddress])

  const checkStakeStatus = async () => {
    if (!userAddress) {
      setIsChecking(false)
      return
    }

    try {
      setIsChecking(true)
      
      // Check if contract address is configured
      if (!process.env.NEXT_PUBLIC_SIMPLE_STAKING_ADDRESS) {
        console.log('SimpleStaking contract address not configured, using mock status')
        setIsStaked(false)
        setIsChecking(false)
        return
      }
      
      // Try to stake if not already staked, or check status if already staked
      console.log('Checking stake status for user:', userAddress)
      
      try {
        // First try to call the isStaked function to check status
        const {commandPayload, finalPayload} = await MiniKit.commandsAsync.sendTransaction({
          transaction: [
            {
              address: process.env.NEXT_PUBLIC_SIMPLE_STAKING_ADDRESS!,
              abi: [
                {
                  "inputs": [{"internalType": "address", "name": "", "type": "address"}],
                  "name": "isStaked",
                  "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
                  "stateMutability": "view",
                  "type": "function"
                }
              ],
              functionName: 'isStaked',
              args: [userAddress],
            },
          ],
          formatPayload: false,
        })

        if (finalPayload.status === 'success') {
          // If we get a successful response, user is staked
          setIsStaked(true)
          console.log('User is already staked')
        } else {
          // If not staked, try to stake
          console.log('User is not staked, attempting to stake...')
          const stakeResult = await MiniKit.commandsAsync.sendTransaction({
            transaction: [
              {
                address: process.env.NEXT_PUBLIC_SIMPLE_STAKING_ADDRESS!,
                abi: SimpleStakingABI,
                functionName: 'stake',
                args: [],
                value: '0x16345785d8a0000', // 0.1 WLD in wei as hex string
              },
            ],
            formatPayload: false,
          })

          if (stakeResult.finalPayload.status === 'success') {
            setIsStaked(true)
            console.log('Successfully staked 0.1 WLD!')
          } else {
            console.log('Staking failed:', stakeResult.finalPayload)
            if (stakeResult.finalPayload.error && stakeResult.finalPayload.error.includes('Already staked')) {
              setIsStaked(true)
              console.log('User was already staked')
            } else {
              setIsStaked(false)
            }
          }
        }
      } catch (error) {
        console.log('Could not check stake status, assuming not staked:', error)
        setIsStaked(false) // Default to not staked if we can't check
      }
    } catch (error) {
      console.log('Error checking stake status:', error)
      setIsStaked(false)
    } finally {
      setIsChecking(false)
    }
  }



  if (isChecking) {
    return (
      <div className="bg-neutral-800 rounded-xl p-4">
        <div className="flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mr-2"></div>
          <span className="text-neutral-400 text-sm">Checking stake status...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
      <div className="text-center">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        </div>
        
        <h3 className="text-xl font-bold mb-2">
          {isStaked ? 'Staked Successfully!' : 'Stake to Use WorldBNB'}
        </h3>
        
        <p className="text-purple-100 mb-4">
          {isStaked 
            ? 'You have staked 0.1 WLD and can use all features'
            : 'Stake 0.1 WLD to access all WorldBNB features'
          }
        </p>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          </div>
        )}

        <div className="space-y-3">
        <button
          onClick={checkStakeStatus}
          disabled={isLoading || isChecking}
          className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
            isStaked
              ? 'bg-green-500/20 text-green-400'
              : 'bg-white text-purple-600 hover:bg-purple-50'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isLoading || isChecking ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              <span>{isStaked ? 'Checking...' : 'Staking...'}</span>
            </div>
          ) : isStaked ? (
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Already Staked ✓</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <span>Stake 0.1 WLD</span>
            </div>
          )}
        </button>

          <div className="flex space-x-2">
            <button
              onClick={() => {
                console.log('Force setting staked status to true')
                setIsStaked(true)
                setError(null)
              }}
              disabled={isLoading}
              className="flex-1 py-2 px-4 text-sm bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-all disabled:opacity-50"
            >
              Force Staked
            </button>
          </div>
        </div>

        <div className="mt-4 text-xs text-purple-200">
          <p>• Required stake: 0.1 WLD</p>
          <p>• Staking enables all app features</p>
          <p>• One-time stake to use the app</p>
        </div>
      </div>
    </div>
  )
}
