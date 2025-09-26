"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface BootLoaderProps {
  onComplete: () => void
}

export default function BootLoader({ onComplete }: BootLoaderProps) {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [isExiting, setIsExiting] = useState(false)

  const bootSteps = [
    "INITIALIZING WORLDBNB PLATFORM...",
    "LOADING PROPERTY DATABASE...",
    "CONNECTING TO WORLD ECOSYSTEM...",
    "SYNCHRONIZING HOST NETWORK...",
    "ACTIVATING BOOKING SYSTEM...",
    "WORLDBNB READY",
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            setIsExiting(true)
            setTimeout(onComplete, 800) // Wait for exit animation
          }, 500)
          return 100
        }
        return prev + 2
      })
    }, 100)

    return () => clearInterval(interval)
  }, [onComplete])

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < bootSteps.length - 1) {
          return prev + 1
        }
        clearInterval(stepInterval)
        return prev
      })
    }, 1000)

    return () => clearInterval(stepInterval)
  }, [])

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

            {/* Progress Bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.4 }}
              className="space-y-2"
            >
              <div className="w-full bg-neutral-800 border border-neutral-700 rounded-lg h-3 overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-orange-600 to-orange-500 relative"
                >
                  <div className="absolute inset-0 bg-orange-400/30 animate-pulse"></div>
                </motion.div>
              </div>
              <div className="flex justify-between text-xs text-neutral-500 font-mono">
                <span className="text-xs">LOADING...</span>
                <motion.span
                  key={progress}
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="text-xs"
                >
                  {progress}%
                </motion.span>
              </div>
            </motion.div>

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
