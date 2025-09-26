"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { MiniKit } from "@worldcoin/minikit-js"

export default function WorldBNBLanding() {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Check MiniKit status on component mount
  useEffect(() => {
    console.log('MiniKit installed:', MiniKit.isInstalled())
  }, [])

  const signIn = async () => {
    try {
      setError(null)
      setIsLoading(true)
      console.log('Starting authentication...')
      
      if (!MiniKit.isInstalled()) {
        setError('MiniKit is not installed. Please make sure you are in World App.')
        return
      }

      console.log('Getting nonce...')
      // Get nonce from backend
      const res = await fetch('/api/nonce')
      const { nonce } = await res.json()

      console.log('Requesting wallet authentication...')
      // Request wallet authentication
      const { commandPayload: generateMessageResult, finalPayload } = await MiniKit.commandsAsync.walletAuth({
        nonce: nonce,
        requestId: '0',
        expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
        notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
        statement: 'This is my statement and here is a link https://worldcoin.com/apps',
      })

      console.log('Final payload:', finalPayload)
      
      if (finalPayload.status === 'error') {
        setError('Authentication failed: ' + finalPayload.message)
        return
      }

      console.log('Verifying with backend...')
      // Verify the authentication with backend
      const response = await fetch('/api/complete-siwe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payload: finalPayload,
          nonce,
        }),
      })

      const result = await response.json()
      console.log('Backend verification result:', result)
      
      if (result.isValid) {
        console.log('Getting user info...')
        
        // Get wallet address from the authentication payload
        const walletAddress = finalPayload.address
        console.log('Wallet address from payload:', walletAddress)
        
        if (walletAddress) {
          try {
            const userInfo = await MiniKit.getUserByAddress(walletAddress)
            console.log('User info:', userInfo)
            setUser(userInfo)
            setIsAuthenticated(true)
          } catch (error) {
            console.error('Failed to get user info:', error)
            // Still set as authenticated if we have wallet address
            setUser({
              walletAddress: walletAddress,
              username: 'User',
            })
            setIsAuthenticated(true)
          }
        } else {
          setError('No wallet address available in authentication payload')
        }
      } else {
        setError('Authentication verification failed')
      }
    } catch (error) {
      console.error('Authentication error:', error)
      setError('Authentication failed: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = () => {
    setUser(null)
    setIsAuthenticated(false)
  }

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-orange-500 font-mono">WorldBNB</h1>
            <button
              onClick={signOut}
              className="bg-neutral-700 hover:bg-neutral-600 text-white px-4 py-2 rounded font-mono text-sm"
            >
              SIGN OUT
            </button>
          </div>

          {/* Welcome Message */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">Welcome, {user.username || 'User'}!</h2>
            <p className="text-neutral-400">You are successfully authenticated with World ID.</p>
          </div>

          {/* User Details */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-neutral-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-orange-500">Profile Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-neutral-400">Username:</label>
                  <p className="font-mono">{user.username || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm text-neutral-400">Wallet Address:</label>
                  <p className="font-mono text-xs break-all">{user.walletAddress || 'Not available'}</p>
                </div>
                {user.profilePictureUrl && (
                  <div>
                    <label className="text-sm text-neutral-400">Profile Picture:</label>
                    <img src={user.profilePictureUrl} alt="Profile" className="w-16 h-16 rounded-full mt-2" />
                  </div>
                )}
              </div>
            </div>

            <div className="bg-neutral-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-orange-500">Account Details</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-neutral-400">World App Version:</label>
                  <p className="font-mono">{user.worldAppVersion || 'Not available'}</p>
                </div>
                <div>
                  <label className="text-sm text-neutral-400">Device OS:</label>
                  <p className="font-mono">{user.deviceOS || 'Not available'}</p>
                </div>
                <div>
                  <label className="text-sm text-neutral-400">Analytics Opt-in:</label>
                  <p className="font-mono">{user.optedIntoOptionalAnalytics ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Permissions */}
          {user.permissions && (
            <div className="mt-6 bg-neutral-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-orange-500">Permissions</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${user.permissions.notifications ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span>Notifications: {user.permissions.notifications ? 'Enabled' : 'Disabled'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${user.permissions.contacts ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span>Contacts: {user.permissions.contacts ? 'Enabled' : 'Disabled'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Raw Data (for debugging) */}
          <details className="mt-6 bg-neutral-900 rounded-lg p-4">
            <summary className="cursor-pointer text-orange-500 font-mono">Raw User Data (Debug)</summary>
            <pre className="mt-4 text-xs text-neutral-400 overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </details>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-8 max-w-md w-full"
      >
        {/* Logo */}
        <div className="space-y-2">
          <h1 className="text-orange-500 font-bold text-3xl tracking-wider font-mono">WorldBNB</h1>
          <p className="text-neutral-500 text-sm font-mono">WORLD ECOSYSTEM</p>
        </div>

        {/* Status */}
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-neutral-400 font-mono">WORLD ECOSYSTEM ONLINE</span>
          </div>
          
          {error && (
            <div className="text-red-500 text-sm font-mono p-3 bg-red-500/10 rounded">
              {error}
            </div>
          )}
        </div>

        {/* Connect Button */}
        <div className="space-y-4">
          <button
            onClick={signIn}
            disabled={isLoading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white font-medium py-4 px-8 rounded transition-colors duration-200 tracking-wider font-mono text-lg"
          >
            {isLoading ? "CONNECTING..." : "CONNECT WALLET"}
          </button>
          
          <div className="text-xs text-neutral-600 font-mono text-center space-y-1">
            <div>💡 Works best in World App</div>
            <div>⚠️ If button doesn't work, open this app in World App</div>
          </div>
        </div>

        {/* Debug Info */}
        <div className="text-xs text-neutral-500 font-mono text-center space-y-1">
          <div>Debug: isLoading={isLoading.toString()}</div>
          <div>Debug: isAuthenticated={isAuthenticated.toString()}</div>
          <div>Debug: MiniKit available: {typeof window !== 'undefined' && (window as any).MiniKit ? 'true' : 'false'}</div>
        </div>
      </motion.div>
    </div>
  )
}