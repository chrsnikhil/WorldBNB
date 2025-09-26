"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "../app/providers"

interface AuthBootLoaderProps {
  onComplete: () => void
}

export default function AuthBootLoader({ onComplete }: AuthBootLoaderProps) {
  const { signIn, isAuthenticated, isLoading } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [isExiting, setIsExiting] = useState(false)
  const [showConnectButton, setShowConnectButton] = useState(false)

  const bootSteps = [
    "INITIALIZING WORLDBNB PLATFORM...",
    "LOADING PROPERTY DATABASE...",
    "CONNECTING TO WORLD ECOSYSTEM...",
    "SYNCHRONIZING HOST NETWORK...",
    "ACTIVATING BOOKING SYSTEM...",
    "AWAITING WALLET AUTHENTICATION...",
  ]

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < bootSteps.length - 1) {
          return prev + 1
        } else {
          clearInterval(stepInterval)
          setShowConnectButton(true)
          return prev
        }
      })
    }, 1000)

    return () => clearInterval(stepInterval)
  }, [])

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      setTimeout(() => {
        setIsExiting(true)
        setTimeout(onComplete, 800) // Wait for exit animation
      }, 500)
    }
  }, [isAuthenticated, isLoading, onComplete])

  const handleConnect = async () => {
    console.log('Connect button clicked!')
    console.log('MiniKit available:', typeof window !== 'undefined' && window.MiniKit)
    console.log('signIn function:', signIn)
    
    try {
      console.log('Calling signIn...')
      await signIn()
      console.log('signIn completed')
    } catch (error) {
      console.error('Authentication failed:', error)
    }
  }

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.1,
            filter: "blur(10px)",
          }}
          transition={{
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="fixed inset-0 bg-black flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-center space-y-6 max-w-sm w-full px-6"
          >
            {/* Logo/Title */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="space-y-2"
            >
              <h1 className="text-orange-500 font-bold text-2xl md:text-3xl tracking-wider font-mono">WorldBNB</h1>
              <p className="text-neutral-500 text-xs md:text-sm font-mono">BOOTING WORLDBNB v1.0</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-neutral-400 font-mono">WORLD ECOSYSTEM</span>
              </div>
            </motion.div>

            {/* Boot Steps */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="space-y-2 h-16 flex flex-col justify-center"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="text-neutral-400 text-xs md:text-sm font-mono min-h-[1rem]"
                >
                  {bootSteps[currentStep]}
                </motion.div>
              </AnimatePresence>
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                  className="w-2 h-2 bg-orange-500 rounded-full"
                />
                <div className="text-xs text-neutral-500 font-mono">STATUS: ONLINE</div>
              </div>
            </motion.div>

            {/* Spinner instead of Progress Bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.4 }}
              className="space-y-4"
            >
              {/* Spinner */}
              <div className="flex justify-center">
                <div className="relative">
                  {/* Outer spinning ring */}
                  <div className="w-16 h-16 border-4 border-neutral-700 border-t-orange-500 rounded-full animate-spin"></div>
                  {/* Inner pulsing dot */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                      className="w-4 h-4 bg-orange-500 rounded-full"
                    />
                  </div>
                </div>
              </div>

              {/* Status Text */}
              <div className="text-xs text-neutral-500 font-mono">
                {isLoading ? "AUTHENTICATING..." : showConnectButton ? "READY TO CONNECT" : "LOADING..."}
              </div>
            </motion.div>

            {/* Connect Button */}
            {showConnectButton && !isAuthenticated && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="space-y-4"
              >
                <button
                  onClick={(e) => {
                    console.log('Button clicked!', e)
                    handleConnect()
                  }}
                  disabled={isLoading}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded transition-colors duration-200 tracking-wider font-mono text-sm"
                >
                  {isLoading ? "CONNECTING..." : "CONNECT WALLET"}
                </button>
                
                <div className="text-xs text-neutral-600 font-mono text-center">
                  💡 Works best in World App
                </div>
                
                <div className="text-xs text-yellow-500 font-mono text-center">
                  ⚠️ If button doesn't work, open this app in World App
                </div>
                
                {/* Debug info */}
                <div className="text-xs text-neutral-500 font-mono text-center">
                  Debug: showConnectButton={showConnectButton.toString()}, isAuthenticated={isAuthenticated.toString()}, isLoading={isLoading.toString()}
                </div>
              </motion.div>
            )}

            {/* System Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.4 }}
              className="text-xs text-neutral-600 font-mono space-y-1 text-center"
            >
              <div className="text-xs leading-tight">WORLD ECOSYSTEM - CONNECTING TRAVELERS GLOBALLY</div>
              <div className="text-xs">SECURITY LEVEL: MAXIMUM</div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
