"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'

interface SimpleImageUploadProps {
  onImageUploaded: (pieceCid: string) => void
  onClose: () => void
  userAddress?: string
}

export default function SimpleImageUpload({ onImageUploaded, onClose, userAddress }: SimpleImageUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadComplete, setUploadComplete] = useState(false)
  const [uploadedInfo, setUploadedInfo] = useState<any>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setUploadComplete(false)
      setUploadedInfo(null)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    
    // Simulate upload process
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Generate a random CID
    const randomCid = `bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi${Math.random().toString(36).substring(2, 15)}`
    
    const uploadInfo = {
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      pieceCid: randomCid,
      txHash: `0x${Math.random().toString(16).substring(2, 66)}`
    }

    setUploadedInfo(uploadInfo)
    setUploadComplete(true)
    setIsUploading(false)
    
    // Call the callback with the CID
    onImageUploaded(randomCid)
  }

  const handleReset = () => {
    setSelectedFile(null)
    setUploadComplete(false)
    setUploadedInfo(null)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-2xl max-h-[95vh] overflow-y-auto mx-2"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Upload Image</h2>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Select an image for your property listing</p>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className={`p-2 rounded-full transition-colors flex-shrink-0 ml-2 ${
              isUploading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'hover:bg-gray-100'
            }`}
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Upload Status */}
        {isUploading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 flex-shrink-0"></div>
              <span className="text-blue-700 font-medium text-sm sm:text-base">Uploading image...</span>
            </div>
            <p className="text-blue-600 text-xs sm:text-sm mt-1">
              Please wait while your image is being processed
            </p>
          </div>
        )}

        {/* File Selection */}
        <div className="space-y-3 sm:space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 lg:p-8 text-center hover:border-gray-400 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="fileInput"
            />
            <label
              htmlFor="fileInput"
              className="cursor-pointer block"
            >
              <svg className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-base sm:text-lg font-medium text-gray-700 break-words">
                {selectedFile ? selectedFile.name : "Click to select an image"}
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Drag and drop or click to browse
              </p>
            </label>
          </div>

          {/* Selected File Info */}
          {selectedFile && (
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{selectedFile.name}</p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Upload Success */}
          {uploadComplete && uploadedInfo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4"
            >
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-green-700 font-medium text-sm sm:text-base">Upload Successful!</span>
              </div>
              <p className="text-green-600 text-xs sm:text-sm mt-1">
                Image uploaded successfully
              </p>
              <div className="mt-2 text-xs text-green-600 space-y-1">
                <p className="truncate">File: {uploadedInfo.fileName}</p>
                <p>Size: {(uploadedInfo.fileSize / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 mt-4 sm:mt-6">
            <button
              onClick={handleReset}
              disabled={isUploading}
              className="px-4 sm:px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50 text-sm sm:text-base"
            >
              Select Different Image
            </button>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={onClose}
                className="px-4 sm:px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className="px-4 sm:px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {isUploading ? 'Uploading...' : 'Upload Image'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
