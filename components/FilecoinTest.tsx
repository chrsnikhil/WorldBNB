"use client"

import { useState } from 'react'
import { Synapse, RPC_URLS } from '@filoz/synapse-sdk'

export default function FilecoinTest() {
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const testFilecoinConnection = async () => {
    setIsConnecting(true)
    setError(null)
    setConnectionStatus(null)

    try {
      // Check if environment variables are set
      if (!process.env.NEXT_PUBLIC_PRIVATE_KEY || process.env.NEXT_PUBLIC_PRIVATE_KEY === '0x...') {
        throw new Error('Please set NEXT_PUBLIC_PRIVATE_KEY in your .env.local file')
      }

      if (!process.env.NEXT_PUBLIC_FILECOIN_RPC_URL) {
        throw new Error('Please set NEXT_PUBLIC_FILECOIN_RPC_URL in your .env.local file')
      }

      setConnectionStatus('Initializing Synapse SDK...')

      // Initialize Synapse SDK with proper error handling
      const synapse = await Synapse.create({
        privateKey: process.env.NEXT_PUBLIC_PRIVATE_KEY!,
        rpcURL: process.env.NEXT_PUBLIC_FILECOIN_RPC_URL || RPC_URLS.calibration.websocket,
      })

      // Verify the instance is properly initialized
      if (!synapse) {
        throw new Error('Synapse SDK failed to initialize - returned null')
      }

      setConnectionStatus('Getting network information...')

      // Test basic connection
      setConnectionStatus('Testing network connection...')
      const network = await synapse.getNetwork()
      const chainId = await synapse.getChainId()

      setConnectionStatus(`✅ Connected to ${network} (Chain ID: ${chainId})`)

      // Test wallet balance (using official SDK supported tokens)
      setConnectionStatus(prev => prev + '\n💰 Checking wallet balance...')
      try {
        const filBalance = await synapse.payments.walletBalance()
        const filFormatted = filBalance > 0n ? `✅ ${filBalance}` : `❌ ${filBalance} (Need FIL for gas)`
        setConnectionStatus(prev => prev + `\n💰 FIL Balance: ${filFormatted}`)
      } catch (balanceErr) {
        setConnectionStatus(prev => prev + `\n⚠️ FIL Balance check failed: ${balanceErr.message}`)
      }

      try {
        const usdfcBalance = await synapse.payments.walletBalance('USDFC')
        const usdfcFormatted = usdfcBalance > 0n ? `✅ ${usdfcBalance}` : `❌ ${usdfcBalance} (Need USDFC for storage)`
        setConnectionStatus(prev => prev + `\n💰 USDFC Balance: ${usdfcFormatted}`)
      } catch (balanceErr) {
        setConnectionStatus(prev => prev + `\n⚠️ USDFC Balance check failed: ${balanceErr.message}`)
      }

      // Test storage info
      setConnectionStatus(prev => prev + '\n📊 Getting storage information...')
      try {
        const storageInfo = await synapse.getStorageInfo()
        setConnectionStatus(prev => 
          `${prev}\n📦 Available Providers: ${storageInfo.providers.length}\n💵 Price per TiB/month: ${storageInfo.pricing.noCDN.perTiBPerMonth}`
        )
      } catch (storageErr) {
        setConnectionStatus(prev => prev + `\n⚠️ Storage info failed: ${storageErr.message}`)
      }

      // Test Warm Storage Service
      setConnectionStatus(prev => prev + '\n🔥 Testing Warm Storage Service...')
      try {
        const { WarmStorageService } = await import('@filoz/synapse-sdk/warm-storage')
        const warmStorageAddress = await synapse.getWarmStorageAddress()
        const warmStorageService = await WarmStorageService.create(
          synapse.getProvider(),
          warmStorageAddress
        )

        // Test storage cost calculation
        const testSize = 1024 * 1024 // 1MB test
        const costs = await warmStorageService.calculateStorageCost(testSize)
        setConnectionStatus(prev => 
          `${prev}\n💰 Storage cost for 1MB: ${costs.perMonth} USDFC/month`
        )

        // Test allowance check
        const allowanceCheck = await warmStorageService.checkAllowanceForStorage(
          testSize,
          false,
          synapse.payments
        )
        const allowanceStatus = allowanceCheck.sufficient ? '✅ Sufficient' : '❌ Insufficient'
        setConnectionStatus(prev => 
          `${prev}\n🔐 Storage Allowances: ${allowanceStatus}`
        )

      } catch (warmStorageErr) {
        setConnectionStatus(prev => prev + `\n⚠️ Warm Storage test failed: ${warmStorageErr.message}`)
      }

    } catch (err: any) {
      setError(`Connection failed: ${err.message}`)
      console.error('Filecoin connection error:', err)
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">🧪 Filecoin Connection Test</h3>
      
      <div className="space-y-4">
        <button
          onClick={testFilecoinConnection}
          disabled={isConnecting}
          className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isConnecting ? 'Testing Connection...' : 'Test Filecoin Connection'}
        </button>

        {connectionStatus && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">Connection Status:</h4>
            <pre className="text-sm text-green-700 whitespace-pre-wrap">{connectionStatus}</pre>
          </div>
        )}

        {error && (
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-semibold text-red-800 mb-2">Error:</h4>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">Setup Requirements:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Set NEXT_PUBLIC_PRIVATE_KEY in .env.local</li>
            <li>• Set NEXT_PUBLIC_FILECOIN_RPC_URL in .env.local</li>
            <li>• Get test FIL tokens from faucet</li>
            <li>• Get test USDFC tokens for storage payments</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
