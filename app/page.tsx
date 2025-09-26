"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { MiniKit } from "@worldcoin/minikit-js"
import SendMoneyComponent from "../components/SendMoneyComponent"
import ReceiveMoneyComponent from "../components/ReceiveMoneyComponent"

interface User {
  walletAddress?: string;
  username?: string;
  profilePictureUrl?: string;
  permissions?: {
    notifications: boolean;
    contacts: boolean;
  };
  deviceOS?: string;
}

export default function WorldBNBLanding() {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('home') // 'home', 'send', 'receive'

  // Check MiniKit status on component mount
  useEffect(() => {
    console.log('MiniKit installed:', MiniKit.isInstalled())
    console.log('Authentication state:', { isAuthenticated, user: !!user, isLoading })
  }, [isAuthenticated, user, isLoading])

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
        setError('Authentication failed')
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
      setError('Authentication failed')
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = () => {
    setUser(null)
    setIsAuthenticated(false)
    setActiveTab('home')
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Connecting...</p>
        </div>
      </div>
    )
  }

  if (isAuthenticated && user) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen bg-black text-white flex flex-col"
      >
        {/* Mobile App Header */}
        <div className="bg-neutral-900 border-b border-neutral-700 px-4 py-3 flex items-center justify-between safe-area-top">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">W</span>
            </div>
            <div>
              <h1 className="text-white font-semibold">WorldBNB</h1>
              <p className="text-xs text-neutral-400">Welcome back</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="text-neutral-400 hover:text-white p-2 touch-target"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>

        {/* Mobile App Content */}
        <div className="flex-1 overflow-y-auto mobile-scroll hide-scrollbar" style={{ paddingBottom: '80px' }}>
          <div className="p-4 space-y-4">
            {/* Welcome Card */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white"
            >
              <div className="flex items-center space-x-4">
                {user.profilePictureUrl ? (
                  <img src={user.profilePictureUrl} alt="Profile" className="w-16 h-16 rounded-full border-2 border-white/20" />
                ) : (
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold">{user.username?.charAt(0) || 'U'}</span>
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold">Welcome, {user.username || 'User'}!</h2>
                  <p className="text-orange-100 text-sm">Ready to explore WorldBNB</p>
                </div>
              </div>
            </motion.div>

            {/* Tab Navigation */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex space-x-2 bg-neutral-800 rounded-xl p-1"
            >
              <button
                onClick={() => setActiveTab('home')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'home' 
                    ? 'bg-orange-500 text-white' 
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setActiveTab('send')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'send' 
                    ? 'bg-orange-500 text-white' 
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Send Money
              </button>
              <button
                onClick={() => setActiveTab('receive')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'receive' 
                    ? 'bg-orange-500 text-white' 
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Receive Money
              </button>
            </motion.div>

            {/* Tab Content */}
            {activeTab === 'home' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="space-y-4"
              >
                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-4">
                  <motion.button
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                    onClick={() => setActiveTab('send')}
                    className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white text-center hover:from-green-600 hover:to-green-700 transition-all duration-200"
                  >
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </div>
                    <h3 className="font-semibold">Send Money</h3>
                    <p className="text-sm text-green-100">Pay someone</p>
                  </motion.button>
                  
                  <motion.button
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.6 }}
                    onClick={() => setActiveTab('receive')}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white text-center hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
                  >
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m7-7H5" />
                      </svg>
                    </div>
                    <h3 className="font-semibold">Receive Money</h3>
                    <p className="text-sm text-blue-100">Get paid</p>
                  </motion.button>
                </div>

                {/* Recent Transactions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                  className="bg-neutral-800 rounded-xl p-4"
                >
                  <h3 className="text-lg font-semibold mb-4 text-orange-500">Recent Transactions</h3>
                  <div className="text-center py-8">
                    <p className="text-neutral-400">No transactions yet</p>
                    <p className="text-sm text-neutral-500 mt-1">Start by sending or receiving money</p>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {activeTab === 'send' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <SendMoneyComponent />
              </motion.div>
            )}

            {activeTab === 'receive' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <ReceiveMoneyComponent user={user} />
              </motion.div>
            )}

            {/* Quick Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="grid grid-cols-2 gap-4"
            >
              <motion.div 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                className="bg-neutral-800 rounded-xl p-4"
              >
                <div className="text-2xl font-bold text-orange-500">0</div>
                <div className="text-sm text-neutral-400">Bookings</div>
              </motion.div>
              <motion.div 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.6 }}
                className="bg-neutral-800 rounded-xl p-4"
              >
                <div className="text-2xl font-bold text-green-500">1</div>
                <div className="text-sm text-neutral-400">Verified</div>
              </motion.div>
            </motion.div>

            {/* Profile Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="bg-neutral-800 rounded-xl p-4"
            >
              <h3 className="text-lg font-semibold mb-4 text-orange-500">Profile</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">Username</span>
                  <span className="font-mono text-sm">{user.username || 'Not provided'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">Wallet</span>
                  <span className="font-mono text-xs text-orange-500">
                    {user.walletAddress ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}` : 'Not available'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">Device</span>
                  <span className="text-sm">{user.deviceOS || 'Unknown'}</span>
                </div>
              </div>
            </motion.div>

            {/* Permissions */}
            {user.permissions && (
              <div className="bg-neutral-800 rounded-xl p-4">
                <h3 className="text-lg font-semibold mb-4 text-orange-500">Permissions</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Notifications</span>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${user.permissions.notifications ? 'bg-green-500' : 'bg-red-500'}`}>
                      {user.permissions.notifications ? (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Contacts</span>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${user.permissions.contacts ? 'bg-green-500' : 'bg-red-500'}`}>
                      {user.permissions.contacts ? (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Debug Section */}
            <details className="bg-neutral-900 rounded-xl p-4">
              <summary className="cursor-pointer text-orange-500 font-mono text-sm">Debug Info</summary>
              <pre className="mt-4 text-xs text-neutral-400 overflow-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </details>
          </div>
        </div>

          {/* Mobile Bottom Navigation - Fixed to bottom */}
          <div className="fixed bottom-0 left-0 right-0 bg-neutral-900 border-t border-neutral-700 px-4 py-2 safe-area-bottom z-50">
            <div className="flex justify-around items-center">
              <button 
                onClick={() => setActiveTab('home')}
                className={`mobile-nav-item ${activeTab === 'home' ? 'active' : ''}`}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                <span className="text-xs">Home</span>
              </button>
              <button 
                onClick={() => setActiveTab('send')}
                className={`mobile-nav-item ${activeTab === 'send' ? 'active' : ''}`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <span className="text-xs">Send</span>
              </button>
              <button 
                onClick={() => setActiveTab('receive')}
                className={`mobile-nav-item ${activeTab === 'receive' ? 'active' : ''}`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m7-7H5" />
                </svg>
                <span className="text-xs">Receive</span>
              </button>
              <button 
                onClick={signOut}
                className="mobile-nav-item"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="text-xs">Logout</span>
              </button>
            </div>
          </div>
      </motion.div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-black flex flex-col"
    >
      {/* Mobile App Header */}
      <div className="bg-neutral-900 border-b border-neutral-700 px-4 py-3 safe-area-top">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">W</span>
          </div>
        </div>
      </div>

      {/* Mobile Login Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-8">
          {/* Logo and Welcome */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center space-y-4"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg"
            >
              <span className="text-white font-bold text-2xl">W</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <h1 className="text-2xl font-bold text-white">Welcome to WorldBNB</h1>
              <p className="text-neutral-400 text-sm mt-1">Connect your wallet to get started</p>
            </motion.div>
          </motion.div>

          {/* Status Indicator */}
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-neutral-400">World Ecosystem Online</span>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-red-500 text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Connect Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={signIn}
            disabled={isLoading}
            className="w-full mobile-button bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-neutral-700 disabled:to-neutral-800 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 shadow-lg disabled:shadow-none"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Connecting...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Connect Wallet</span>
              </div>
            )}
          </motion.button>
          
          {/* Help Text */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-2 text-neutral-500 text-sm">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>Works best in World App</span>
            </div>
            <div className="text-neutral-600 text-xs">
              If button doesn't work, open this app in World App
            </div>
          </div>

          {/* Debug Info (only in development) */}
          {typeof window !== 'undefined' && window.location.hostname === 'localhost' && (
            <details className="bg-neutral-900 rounded-xl p-4">
              <summary className="cursor-pointer text-orange-500 font-mono text-sm">Debug Info</summary>
              <div className="mt-4 text-xs text-neutral-400 space-y-1">
                <div>Loading: {isLoading.toString()}</div>
                <div>Authenticated: {isAuthenticated.toString()}</div>
                <div>MiniKit: {typeof window !== 'undefined' && (window as any).MiniKit ? 'Available' : 'Not Available'}</div>
              </div>
            </details>
          )}
        </div>
      </div>
    </motion.div>
  )
}