"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { MiniKit, VerifyCommandInput, VerificationLevel } from "@worldcoin/minikit-js"
import SendMoneyComponent from "../components/SendMoneyComponent"
import ReceiveMoneyComponent from "../components/ReceiveMoneyComponent"
import PropertyListingForm from "../components/PropertyListingForm"
import PropertyBookingForm from "../components/PropertyBookingForm"
import PropertyDetailsModal from "../components/PropertyDetailsModal"
import SuccessModal from "../components/SuccessModal"
import ModalPortal from "../components/ModalPortal"

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

interface Property {
  id: number;
  host: string;
  name: string;
  description: string;
  location: string;
  pricePerNight: number;
  isActive: boolean;
  createdAt: number;
  imageHash: string;
}

function WorldBNBLanding() {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('home') // 'home', 'send', 'receive', 'host', 'properties'
  const [properties, setProperties] = useState<Property[]>([])
  const [showPropertyForm, setShowPropertyForm] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [showPropertyDetails, setShowPropertyDetails] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [successTitle, setSuccessTitle] = useState("")
  const [successPropertyId, setSuccessPropertyId] = useState<number | undefined>(undefined)

  // Check MiniKit status on component mount
  useEffect(() => {
    console.log('MiniKit installed:', MiniKit.isInstalled())
    console.log('Authentication state:', { isAuthenticated, user: !!user, isLoading })
  }, [isAuthenticated, user, isLoading])

  // Fetch properties when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchProperties()
    }
  }, [isAuthenticated])

  // Debug showPropertyForm changes
  useEffect(() => {
    console.log('🔄 showPropertyForm changed to:', showPropertyForm);
  }, [showPropertyForm])


  const fetchProperties = async () => {
    try {
      const response = await fetch('/api/get-properties')
      const data = await response.json()
      if (data.success) {
        setProperties(data.properties)
      }
    } catch (error) {
      console.error('Error fetching properties:', error)
    }
  }

  const handlePropertyListed = (propertyId: number) => {
    console.log('Property listed with ID:', propertyId)
    setShowPropertyForm(false) // Close the modal
    fetchProperties() // Refresh the properties list
    
    // Show success modal
    setSuccessTitle("Property Listed Successfully!")
    setSuccessMessage("Your property has been listed on the blockchain and is now available for booking.")
    setSuccessPropertyId(propertyId)
    setShowSuccessModal(true)
    
    // Dispatch events to GlobalModals
    window.dispatchEvent(new CustomEvent('stateChange', {
      detail: { type: 'successTitle', value: "Property Listed Successfully!" }
    }));
    window.dispatchEvent(new CustomEvent('stateChange', {
      detail: { type: 'successMessage', value: "Your property has been listed on the blockchain and is now available for booking." }
    }));
    window.dispatchEvent(new CustomEvent('stateChange', {
      detail: { type: 'successPropertyId', value: propertyId }
    }));
    window.dispatchEvent(new CustomEvent('stateChange', {
      detail: { type: 'showSuccessModal', value: true }
    }));
  }

  const handleBookingCreated = (bookingId: number) => {
    console.log('Booking created with ID:', bookingId)
    // You could add booking management here
  }

  const openBookingForm = (property: Property) => {
    setSelectedProperty(property)
    setShowBookingForm(true)
  }

  const openPropertyDetails = (property: Property) => {
    setSelectedProperty(property)
    setShowPropertyDetails(true)
    // Dispatch event to GlobalModals
    window.dispatchEvent(new CustomEvent('stateChange', {
      detail: { type: 'selectedProperty', value: property }
    }));
    window.dispatchEvent(new CustomEvent('stateChange', {
      detail: { type: 'showPropertyDetails', value: true }
    }));
  }

  const closePropertyDetails = () => {
    setShowPropertyDetails(false)
    setSelectedProperty(null)
  }

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
            // Dispatch event to global modal
            window.dispatchEvent(new CustomEvent('stateChange', {
              detail: { type: 'isAuthenticated', value: true }
            }));
          } catch (error) {
            console.error('Failed to get user info:', error)
            // Still set as authenticated if we have wallet address
            setUser({
              walletAddress: walletAddress,
              username: 'User',
            })
            setIsAuthenticated(true)
            // Dispatch event to global modal
            window.dispatchEvent(new CustomEvent('stateChange', {
              detail: { type: 'isAuthenticated', value: true }
            }));
          }
        } else {
          setError('No wallet address available in authentication payload')
        }
      } else {
        console.error('Authentication verification failed:', result.message)
        setError(`Authentication verification failed: ${result.message || 'Unknown error'}`)
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
    // Dispatch event to global modal
    window.dispatchEvent(new CustomEvent('stateChange', {
      detail: { type: 'isAuthenticated', value: false }
    }));
    setActiveTab('home')
    // Reset modal states when logging out
    setShowPropertyForm(false)
    setShowBookingForm(false)
    setSelectedProperty(null)
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
                Explore
              </button>
              <button
                onClick={() => setActiveTab('host')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'host' 
                    ? 'bg-orange-500 text-white' 
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Host
              </button>
              <button
                onClick={() => setActiveTab('properties')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'properties' 
                    ? 'bg-orange-500 text-white' 
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Properties
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
                {/* Hero Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white"
                >
                  <h2 className="text-2xl font-bold mb-2">Welcome to WorldBNB</h2>
                  <p className="text-orange-100 mb-4">Discover unique places to stay around the world</p>
                  <div className="flex space-x-3">
                    <button className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-sm font-medium hover:bg-white/30 transition-all flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <span>Search</span>
                    </button>
                    <button className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-sm font-medium hover:bg-white/30 transition-all flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Near me</span>
                    </button>
                  </div>
                </motion.div>

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="bg-neutral-800 rounded-xl p-4 hover:bg-neutral-700 transition-all cursor-pointer"
                    onClick={() => setActiveTab('properties')}
                  >
                    <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-white mb-1">View Properties</h3>
                    <p className="text-sm text-neutral-400">Browse available stays</p>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="bg-neutral-800 rounded-xl p-4 hover:bg-neutral-700 transition-all cursor-pointer"
                    onClick={() => setActiveTab('host')}
                  >
                    <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-white mb-1">Host Property</h3>
                    <p className="text-sm text-neutral-400">List your space</p>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                    className="bg-neutral-800 rounded-xl p-4 hover:bg-neutral-700 transition-all cursor-pointer"
                  >
                    <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-white mb-1">Reviews</h3>
                    <p className="text-sm text-neutral-400">Rate your stays</p>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    className="bg-neutral-800 rounded-xl p-4 hover:bg-neutral-700 transition-all cursor-pointer"
                  >
                    <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-white mb-1">Profile</h3>
                    <p className="text-sm text-neutral-400">Manage account</p>
                  </motion.div>
                </div>

                {/* Available Properties */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.9 }}
                  className="bg-neutral-800 rounded-xl p-4"
                >
                  <h3 className="text-lg font-semibold mb-4 text-orange-500">Available Properties</h3>
                  {properties.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <p className="text-neutral-400 mb-4">No properties available yet</p>
                      <p className="text-sm text-neutral-500">Be the first to list a property!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {properties.map((property) => (
                        <div 
                          key={property.id} 
                          className="bg-neutral-700 rounded-lg p-3 flex items-center space-x-3 hover:bg-neutral-600 transition-colors cursor-pointer"
                          onClick={() => openBookingForm(property)}
                        >
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-white">{property.name}</h4>
                            <p className="text-sm text-neutral-400">{property.location}</p>
                            <p className="text-xs text-orange-500">{property.pricePerNight} WLD/night</p>
                          </div>
                          <div className="text-orange-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}

            {activeTab === 'host' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="space-y-4"
              >
                {/* Host Property Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Become a Host</h2>
                    <p className="text-green-100 mb-6">Share your space and earn money by listing your property</p>
                    
                    <button 
                      onClick={async () => {
                        try {
                          // First verify with World ID
                          const verifyPayload: VerifyCommandInput = {
                            action: 'verifyuser', // Match your actual incognito action
                            signal: '0x1234567890abcdef', // Use hex string like in docs
                            verification_level: VerificationLevel.Orb
                          };
                          
                          const { finalPayload } = await MiniKit.commandsAsync.verify(verifyPayload);
                          
                          if (finalPayload.status === 'error') {
                            console.error('❌ Verification failed:', finalPayload);
                            alert(`Verification failed: ${finalPayload.error || 'Unknown error'}`);
                            return;
                          }
                          
                          // Verify with backend
                          const verifyResponse = await fetch('/api/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              payload: finalPayload,
                              action: 'verifyuser', // Match your actual incognito action
                              signal: '0x1234567890abcdef',
                            }),
                          });
                          
                          const verifyResponseJson = await verifyResponse.json();
                          
                          if (verifyResponseJson.status === 200) {
                            setShowPropertyForm(true);
                            // Dispatch event to global modal
                            window.dispatchEvent(new CustomEvent('stateChange', {
                              detail: { type: 'showPropertyForm', value: true }
                            }));
                          } else {
                            console.error('❌ Backend verification failed:', verifyResponseJson);
                            alert(`Backend verification failed: ${verifyResponseJson.message || 'Unknown error'}`);
                          }
                        } catch (error: any) {
                          console.error('❌ Verification error:', error);
                          alert(`Verification failed: ${error.message || 'Unknown error'}`);
                        }
                      }}
                      className="w-full bg-white text-green-600 font-semibold py-4 px-6 rounded-xl hover:bg-green-50 active:bg-green-100 transition-all duration-200 flex items-center justify-center space-x-3 touch-manipulation"
                      style={{
                        WebkitTapHighlightColor: 'transparent',
                        WebkitTouchCallout: 'none',
                        WebkitUserSelect: 'none',
                        userSelect: 'none',
                        touchAction: 'manipulation'
                      }}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span>List Your Property</span>
                    </button>
                  </div>
                </motion.div>


                {/* Your Properties */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="bg-neutral-800 rounded-xl p-4"
                >
                  <h3 className="text-lg font-semibold mb-4 text-green-500">Your Properties</h3>
                  {properties.length === 0 ? (
                    <p className="text-neutral-400">No properties listed yet. List your first property!</p>
                  ) : (
                    <div className="space-y-3">
                      {properties.map((property) => (
                        <div key={property.id} className="bg-neutral-700 rounded-lg p-3">
                          <h4 className="font-medium text-white">{property.name}</h4>
                          <p className="text-sm text-neutral-400">{property.location}</p>
                          <p className="text-sm text-green-400">{property.pricePerNight} WLD per night</p>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}

            {activeTab === 'properties' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="space-y-4"
              >
                {/* Properties Header */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white"
                >
                  <h2 className="text-2xl font-bold mb-2">Available Properties</h2>
                  <p className="text-blue-100 mb-4">Discover amazing places to stay</p>
                  <div className="flex space-x-2">
                    <button className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-sm font-medium hover:bg-white/30 transition-all flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <span>Search</span>
                    </button>
                    <button className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-sm font-medium hover:bg-white/30 transition-all flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                      </svg>
                      <span>Filter</span>
                    </button>
                  </div>
                </motion.div>

                {/* Properties List */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="bg-neutral-800 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">
                      All Properties ({properties.length})
                    </h3>
                    <button 
                      onClick={() => fetchProperties()}
                      className="text-orange-500 hover:text-orange-400 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>

                  {properties.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-medium text-white mb-2">No Properties Available</h4>
                      <p className="text-neutral-400 mb-4">Be the first to list a property!</p>
                      <button 
                        onClick={() => setActiveTab('host')}
                        className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                      >
                        List Your Property
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {properties.map((property, index) => (
                        <motion.div
                          key={property.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="bg-gradient-to-r from-neutral-800 to-neutral-700 rounded-xl overflow-hidden hover:from-neutral-700 hover:to-neutral-600 transition-all duration-300 cursor-pointer transform hover:scale-102 hover:shadow-lg hover:shadow-orange-500/10"
                          onClick={() => openPropertyDetails(property)}
                        >
                          {/* Property Image Placeholder - Smaller */}
                          <div className="h-32 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 relative overflow-hidden">
                            <div className="absolute inset-0 bg-black/20"></div>
                            <div className="absolute top-2 right-2">
                              <div className="bg-white/20 backdrop-blur-sm rounded-full px-2 py-1">
                                <span className="text-white text-xs font-medium">#{property.id}</span>
                              </div>
                            </div>
                            <div className="absolute bottom-2 left-2">
                              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1">
                                <div className="text-white font-bold text-sm">{property.pricePerNight} WLD</div>
                                <div className="text-white/80 text-xs">per night</div>
                              </div>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                              </div>
                            </div>
                          </div>
                          
                          {/* Property Details - Smaller */}
                          <div className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-white text-lg mb-1 truncate">{property.name}</h4>
                                <div className="flex items-center text-neutral-400 text-xs mb-2">
                                  <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  <span className="truncate">{property.location}</span>
                                </div>
                              </div>
                              <div className="text-orange-500 ml-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </div>
                            
                            <p className="text-neutral-300 text-xs mb-3 line-clamp-2 leading-relaxed">
                              {property.description}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                <span className="text-green-400 text-xs font-medium">Available</span>
                              </div>
                              <div className="text-neutral-500 text-xs">
                                {new Date(property.createdAt * 1000).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}

            {activeTab === 'send' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="space-y-4"
              >
                {/* Host Property Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white"
                >
                  <h2 className="text-2xl font-bold mb-2">Become a Host</h2>
                  <p className="text-green-100 mb-4">Share your space and earn money</p>
                  <button 
                    onClick={() => {
                      setShowPropertyForm(true);
                    }}
                    className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3 text-sm font-medium hover:bg-white/30 active:bg-white/40 transition-all flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>List Your Property</span>
                  </button>
                </motion.div>

                {/* Hosting Tips */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="bg-neutral-800 rounded-xl p-4"
                >
                  <h3 className="text-lg font-semibold mb-4 text-green-500">Hosting Tips</h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-green-500 text-sm">1</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Set competitive prices</h4>
                        <p className="text-sm text-neutral-400">Research local market rates</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-green-500 text-sm">2</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Take great photos</h4>
                        <p className="text-sm text-neutral-400">Good photos attract more guests</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-green-500 text-sm">3</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Respond quickly</h4>
                        <p className="text-sm text-neutral-400">Fast responses improve bookings</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {activeTab === 'receive' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="space-y-4"
              >
                {/* Reviews Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-6 text-white"
                >
                  <h2 className="text-2xl font-bold mb-2">Your Reviews</h2>
                  <p className="text-yellow-100 mb-4">See what guests say about your stays</p>
                  <div className="flex items-center space-x-2">
                    <div className="flex text-yellow-200">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <span className="text-sm">4.8 average rating</span>
                  </div>
                </motion.div>

                {/* Recent Reviews */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="bg-neutral-800 rounded-xl p-4"
                >
                  <h3 className="text-lg font-semibold mb-4 text-yellow-500">Recent Reviews</h3>
                  <div className="space-y-4">
                    <div className="bg-neutral-700 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">A</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-white">Alex M.</h4>
                          <div className="flex text-yellow-400 text-sm">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <p className="text-neutral-300 text-sm">"Amazing stay! The host was very responsive and the place was exactly as described."</p>
                    </div>
                    
                    <div className="bg-neutral-700 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">S</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-white">Sarah K.</h4>
                          <div className="flex text-yellow-400 text-sm">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <p className="text-neutral-300 text-sm">"Perfect location and great amenities. Would definitely stay again!"</p>
                    </div>
                  </div>
                </motion.div>
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
                <span className="text-xs">Explore</span>
              </button>
              <button 
                onClick={() => setActiveTab('send')}
                className={`mobile-nav-item ${activeTab === 'send' ? 'active' : ''}`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                </svg>
                <span className="text-xs">Host</span>
              </button>
              <button 
                onClick={() => setActiveTab('receive')}
                className={`mobile-nav-item ${activeTab === 'receive' ? 'active' : ''}`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                <span className="text-xs">Reviews</span>
              </button>
              <button 
                onClick={signOut}
                className="mobile-nav-item"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-xs">Profile</span>
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

        </div>
      </div>

    </motion.div>
  )
}

// Global modals that render outside the main component
export default function App() {
  return (
    <>
      <WorldBNBLanding />
      <GlobalModals />
    </>
  )
}

function GlobalModals() {
  const [showPropertyForm, setShowPropertyForm] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [showPropertyDetails, setShowPropertyDetails] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [successTitle, setSuccessTitle] = useState("")
  const [successPropertyId, setSuccessPropertyId] = useState<number | undefined>(undefined)

  // Listen for state changes from the main component
  useEffect(() => {
    const handleStateChange = (event: CustomEvent) => {
      if (event.detail.type === 'showPropertyForm') {
        setShowPropertyForm(event.detail.value)
      }
      if (event.detail.type === 'isAuthenticated') {
        setIsAuthenticated(event.detail.value)
      }
      if (event.detail.type === 'showBookingForm') {
        setShowBookingForm(event.detail.value)
      }
      if (event.detail.type === 'showPropertyDetails') {
        setShowPropertyDetails(event.detail.value)
      }
      if (event.detail.type === 'selectedProperty') {
        setSelectedProperty(event.detail.value)
      }
      if (event.detail.type === 'showSuccessModal') {
        setShowSuccessModal(event.detail.value)
      }
      if (event.detail.type === 'successMessage') {
        setSuccessMessage(event.detail.value)
      }
      if (event.detail.type === 'successTitle') {
        setSuccessTitle(event.detail.value)
      }
      if (event.detail.type === 'successPropertyId') {
        setSuccessPropertyId(event.detail.value)
      }
    }

    window.addEventListener('stateChange', handleStateChange as EventListener)
    return () => window.removeEventListener('stateChange', handleStateChange as EventListener)
  }, [])

  return (
    <>
      {/* Property Listing Modal */}
      {showPropertyForm && (
        <ModalPortal>
          <PropertyListingForm
            onPropertyListed={(propertyId: number) => {
              setShowPropertyForm(false);
              // Dispatch event to close modal
              window.dispatchEvent(new CustomEvent('stateChange', {
                detail: { type: 'showPropertyForm', value: false }
              }));
              
              // Dispatch success modal events
              window.dispatchEvent(new CustomEvent('stateChange', {
                detail: { type: 'successTitle', value: "Property Listed Successfully!" }
              }));
              window.dispatchEvent(new CustomEvent('stateChange', {
                detail: { type: 'successMessage', value: "Your property has been listed on the blockchain and is now available for booking." }
              }));
              window.dispatchEvent(new CustomEvent('stateChange', {
                detail: { type: 'successPropertyId', value: propertyId }
              }));
              window.dispatchEvent(new CustomEvent('stateChange', {
                detail: { type: 'showSuccessModal', value: true }
              }));
            }}
            onClose={() => {
              setShowPropertyForm(false);
              // Dispatch event to close modal
              window.dispatchEvent(new CustomEvent('stateChange', {
                detail: { type: 'showPropertyForm', value: false }
              }));
            }}
          />
        </ModalPortal>
      )}

      {/* Property Booking Modal */}
      {showBookingForm && selectedProperty && (
        <ModalPortal>
          <PropertyBookingForm
            property={selectedProperty}
            onBookingCreated={() => {}}
            onClose={() => {
              setShowBookingForm(false)
              setSelectedProperty(null)
            }}
          />
        </ModalPortal>
      )}

      {/* Property Details Modal */}
      <PropertyDetailsModal
        property={selectedProperty}
        isOpen={showPropertyDetails}
        onClose={() => {
          setShowPropertyDetails(false)
          setSelectedProperty(null)
        }}
        onBook={(property) => {
          setShowPropertyDetails(false)
          setSelectedProperty(property)
          setShowBookingForm(true)
        }}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={successTitle}
        message={successMessage}
        propertyId={successPropertyId}
      />
    </>
  )
}