'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export type User = {
  walletAddress?: string;
  username?: string;
  profilePictureUrl?: string;
  permissions?: {
    notifications: boolean;
    contacts: boolean;
  };
  optedIntoOptionalAnalytics?: boolean;
  worldAppVersion?: number;
  deviceOS?: string;
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Function to wait for MiniKit to load
  const waitForMiniKit = async (maxAttempts = 10, delay = 500) => {
    for (let i = 0; i < maxAttempts; i++) {
      const MiniKit = (window as any).MiniKit
      if (MiniKit && MiniKit.isInstalled) {
        console.log(`MiniKit found after ${i + 1} attempts`)
        return MiniKit
      }
      console.log(`Waiting for MiniKit... attempt ${i + 1}/${maxAttempts}`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
    return null
  }

  const signIn = async () => {
    console.log('signIn function called')
    console.log('Window object:', typeof window)
    console.log('Window.MiniKit:', (window as any).MiniKit)
    
    // Wait for MiniKit to load
    console.log('Waiting for MiniKit to load...')
    const MiniKit = await waitForMiniKit()
    
    if (!MiniKit) {
      console.error('MiniKit did not load after waiting')
      alert('MiniKit is not available. Please make sure you are in World App.')
      return
    }
    
    console.log('MiniKit loaded successfully:', MiniKit)
    console.log('MiniKit.isInstalled():', MiniKit.isInstalled())
    console.log('MiniKit.commandsAsync:', MiniKit.commandsAsync)
    
    if (!MiniKit.isInstalled()) {
      console.error('MiniKit.isInstalled() returned false')
      alert('MiniKit is not installed. Please make sure you are in World App.')
      return
    }

    try {
      console.log('Starting authentication process...')
      setIsLoading(true)
      
      // Get nonce from backend
      const res = await fetch('/api/nonce')
      const { nonce } = await res.json()

      // Request wallet authentication following official docs exactly
      const { commandPayload: generateMessageResult, finalPayload } = await MiniKit.commandsAsync.walletAuth({
        nonce: nonce,
        requestId: '0', // Optional
        expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
        notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
        statement: 'This is my statement and here is a link https://worldcoin.com/apps',
      })

      console.log('Final payload:', finalPayload)
      
      if (finalPayload.status === 'error') {
        console.error('Authentication failed:', finalPayload)
        return
      }

      console.log('Authentication successful, verifying with backend...')

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
        console.log('Backend verification successful, getting user info...')
        
        // Get user info from MiniKit using official helper functions
        const walletAddress = MiniKit.walletAddress
        console.log('Wallet address:', walletAddress)
        
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
          console.error('No wallet address available')
        }
      } else {
        console.error('Authentication verification failed:', result)
      }
    } catch (error) {
      console.error('Authentication error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = () => {
    setUser(null)
    setIsAuthenticated(false)
  }

  useEffect(() => {
    // Check if user is already authenticated on app load
    const checkAuth = async () => {
      // Check if MiniKit is available globally
      const MiniKit = (window as any).MiniKit
      
      if (MiniKit && MiniKit.isInstalled() && MiniKit.walletAddress) {
        try {
          const userInfo = await MiniKit.getUserByAddress(MiniKit.walletAddress)
          setUser(userInfo)
          setIsAuthenticated(true)
        } catch (error) {
          console.error('Failed to get user info:', error)
        }
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const value = {
    user,
    isAuthenticated,
    isLoading,
    signIn,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
