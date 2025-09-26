"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useAuth } from "../app/providers"

export default function SimpleAuth() {
  const { signIn, isAuthenticated, isLoading } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [isDevMode, setIsDevMode] = useState(false)

  const handleConnect = async () => {
    try {
      setError(null)
      console.log('Starting authentication...')
      
      // Check if MiniKit is available
      const MiniKit = (window as any).MiniKit
      if (!MiniKit) {
        setError('MiniKit is not available. Please open this app in World App for authentication.')
        return
      }
      
      await signIn()
    } catch (error) {
      console.error('Authentication error:', error)
      setError('Authentication failed. Please try again.')
    }
  }

  const handleDevMode = () => {
    setIsDevMode(true)
    // Simulate authentication for development
    setTimeout(() => {
      // This would normally be handled by the auth context
      console.log('Dev mode: Simulating authentication')
    }, 1000)
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-orange-500 mb-4">Welcome to WorldBNB!</h1>
          <p className="text-neutral-300">You are successfully authenticated.</p>
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
            <div className="text-red-500 text-sm font-mono">
              {error}
            </div>
          )}
        </div>

        {/* Connect Button */}
        <div className="space-y-4">
          <button
            onClick={handleConnect}
            disabled={isLoading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white font-medium py-4 px-8 rounded transition-colors duration-200 tracking-wider font-mono text-lg"
          >
            {isLoading ? "CONNECTING..." : "CONNECT WALLET"}
          </button>
          
          {/* Development Mode Button */}
          <button
            onClick={handleDevMode}
            className="w-full bg-neutral-700 hover:bg-neutral-600 text-white font-medium py-2 px-4 rounded transition-colors duration-200 tracking-wider font-mono text-sm"
          >
            DEV MODE (Simulate Auth)
          </button>
          
          <div className="text-xs text-neutral-600 font-mono text-center space-y-1">
            <div>💡 Works best in World App</div>
            <div>⚠️ If button doesn't work, open this app in World App</div>
            <div>🔧 Use DEV MODE for testing outside World App</div>
          </div>
        </div>

        {/* Debug Info */}
        <div className="text-xs text-neutral-500 font-mono text-center space-y-1">
          <div>Debug: isLoading={isLoading.toString()}</div>
          <div>Debug: isAuthenticated={isAuthenticated.toString()}</div>
          <div>Debug: MiniKit available: {typeof window !== 'undefined' && (window as any).MiniKit ? 'true' : 'false'}</div>
          <div>Debug: MiniKit.isInstalled: {typeof window !== 'undefined' && (window as any).MiniKit?.isInstalled ? (window as any).MiniKit.isInstalled().toString() : 'N/A'}</div>
          <div>Debug: User Agent: {typeof window !== 'undefined' ? window.navigator.userAgent.substring(0, 50) + '...' : 'N/A'}</div>
        </div>
      </motion.div>
    </div>
  )
}
