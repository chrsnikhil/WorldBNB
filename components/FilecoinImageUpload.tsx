"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileUploader } from './FileUploader'

interface FilecoinImageUploadProps {
  onImageUploaded: (pieceCid: string) => void
  onClose: () => void
  userAddress?: string
}

export default function FilecoinImageUpload({ onImageUploaded, onClose, userAddress }: FilecoinImageUploadProps) {
  const [uploadedInfo, setUploadedInfo] = useState<any>(null)
  const [resetKey, setResetKey] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [isFileSelecting, setIsFileSelecting] = useState(false)
  const [forceVisible, setForceVisible] = useState(true)

  const handleUploadComplete = (info: any) => {
    setUploadedInfo(info)
    setIsUploading(false)
    if (info.pieceCid) {
      onImageUploaded(info.pieceCid)
      // Don't close the modal automatically - let user decide when to close
    }
  }

  const handleUploadStart = () => {
    setIsUploading(true)
  }

  const handleFileSelectionStart = () => {
    setIsFileSelecting(true)
    setForceVisible(true)
  }

  const handleFileSelected = () => {
    setIsFileSelecting(false)
    setForceVisible(true)
  }

  // Prevent modal from closing during upload or file selection
  const handleModalClick = (e: React.MouseEvent) => {
    // Prevent closing when clicking on the modal backdrop during upload or file selection
    if ((isUploading || isFileSelecting) && e.target === e.currentTarget) {
      e.preventDefault()
      e.stopPropagation()
      return false
    }
  }

  // Mobile-specific touch handling
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isFileSelecting || isUploading) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isFileSelecting || isUploading) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  // Prevent modal from closing due to external events
  const handleModalKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && (isUploading || isFileSelecting)) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  const handleReset = () => {
    setUploadedInfo(null)
    setResetKey(prev => prev + 1) // Force FileUploader to reset
  }

  // Prevent modal from being affected by external events
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (isFileSelecting && document.hidden) {
        // Modal is still active even when document is hidden
        console.log("Modal should remain open during file selection")
      }
    }

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isFileSelecting || isUploading) {
        e.preventDefault()
        e.returnValue = "Modal is open, please don't close"
        return "Modal is open, please don't close"
      }
    }

    // Mobile-specific event handling
    const handleMobileBlur = () => {
      if (isFileSelecting) {
        console.log("Mobile blur detected, keeping modal open")
        // Force the modal to stay visible
        setTimeout(() => {
          const modal = document.querySelector('[data-modal="filecoin-upload"]')
          if (modal) {
            modal.style.display = 'flex'
            modal.style.visibility = 'visible'
            modal.style.opacity = '1'
            modal.style.pointerEvents = 'auto'
          }
        }, 100)
      }
    }

    const handleMobileFocus = () => {
      if (isFileSelecting) {
        console.log("Mobile focus restored, modal should be visible")
        // Force modal to be visible
        setTimeout(() => {
          const modal = document.querySelector('[data-modal="filecoin-upload"]')
          if (modal) {
            modal.style.display = 'flex'
            modal.style.visibility = 'visible'
            modal.style.opacity = '1'
            modal.style.pointerEvents = 'auto'
          }
        }, 50)
      }
    }

    // More aggressive mobile handling
    const handlePageShow = () => {
      if (isFileSelecting) {
        console.log("Page show event, ensuring modal is visible")
        setTimeout(() => {
          const modal = document.querySelector('[data-modal="filecoin-upload"]')
          if (modal) {
            modal.style.display = 'flex'
            modal.style.visibility = 'visible'
            modal.style.opacity = '1'
            modal.style.pointerEvents = 'auto'
          }
        }, 50)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('blur', handleMobileBlur)
    window.addEventListener('focus', handleMobileFocus)
    window.addEventListener('pageshow', handlePageShow)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('blur', handleMobileBlur)
      window.removeEventListener('focus', handleMobileFocus)
      window.removeEventListener('pageshow', handlePageShow)
    }
  }, [isFileSelecting, isUploading])

  // Always render the modal - don't let it be unmounted
  // if (!forceVisible) {
  //   return null
  // }

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      data-modal="filecoin-upload"
      onClick={handleModalClick}
      onKeyDown={handleModalKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        touchAction: isFileSelecting ? 'none' : 'auto',
        pointerEvents: isFileSelecting ? 'none' : 'auto',
        visibility: 'visible',
        opacity: 1,
        display: 'flex',
        // Force the modal to stay visible
        minHeight: '100vh',
        minWidth: '100vw'
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        style={{
          position: 'relative',
          zIndex: 10000
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Upload to Filecoin</h2>
            <p className="text-gray-600 mt-1">Decentralized, permanent storage on Calibration testnet</p>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading || isFileSelecting}
            className={`p-2 rounded-full transition-colors ${
              (isUploading || isFileSelecting)
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'hover:bg-gray-100'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Upload Status */}
        {isUploading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <span className="text-blue-700 font-medium">Uploading to Filecoin...</span>
            </div>
            <p className="text-blue-600 text-sm mt-1">
              Please don't close this modal during upload
            </p>
          </div>
        )}

        {/* File Selection Status */}
        {isFileSelecting && !isUploading && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2">
              <div className="animate-pulse rounded-full h-4 w-4 bg-yellow-500"></div>
              <span className="text-yellow-700 font-medium">Selecting file...</span>
            </div>
            <p className="text-yellow-600 text-sm mt-1">
              Please select your image from camera or gallery
            </p>
          </div>
        )}


        {/* File Upload Component */}
        <div className="space-y-4">
          <FileUploader 
            userAddress={userAddress} 
            onUploadComplete={handleUploadComplete}
            onUploadStart={handleUploadStart}
            onFileSelectionStart={handleFileSelectionStart}
            onFileSelected={handleFileSelected}
            key={resetKey}
          />
          
          {/* Success Message */}
          {uploadedInfo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 rounded-lg p-4"
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-green-700 font-medium">Upload successful!</span>
              </div>
              <p className="text-green-600 text-sm mt-1">
                Your image has been stored on Filecoin Calibration testnet
              </p>
            </motion.div>
          )}

          {/* Info Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">About Filecoin Storage</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Decentralized storage on Filecoin network</li>
              <li>• Permanent and censorship-resistant</li>
              <li>• Uses Calibration testnet for testing</li>
              <li>• Requires FIL for gas and USDFC for storage</li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between mt-6">
          <button
            onClick={handleReset}
            className="px-6 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
          >
            Upload Another
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  )
}