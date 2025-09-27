"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useFileUpload } from "@/hooks/useFileUpload";

interface FileUploaderProps {
  userAddress?: string;
  onUploadComplete?: (info: any) => void;
  onUploadStart?: () => void;
  onFileSelectionStart?: () => void;
  onFileSelected?: () => void;
}

export const FileUploader = ({ userAddress, onUploadComplete, onUploadStart, onFileSelectionStart, onFileSelected }: FileUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isFileSelecting, setIsFileSelecting] = useState(false);
  const [forceOpen, setForceOpen] = useState(true);
  
  // Assume connected since we're in World App
  const isConnected = true;

  const { uploadFileMutation, uploadedInfo, handleReset: resetUpload, status, progress } =
    useFileUpload(userAddress);

  // Call onUploadComplete when upload is successful
  React.useEffect(() => {
    if (uploadedInfo && onUploadComplete) {
      onUploadComplete(uploadedInfo);
    }
  }, [uploadedInfo, onUploadComplete]);

  const { isPending: isUploading, mutateAsync: uploadFile } =
    uploadFileMutation;

  // Prevent component from being unmounted
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isFileSelecting || isUploading) {
        e.preventDefault();
        e.returnValue = "File upload in progress";
        return "File upload in progress";
      }
    };

    const handleVisibilityChange = () => {
      if (isFileSelecting && document.hidden) {
        console.log("File selection in progress, keeping component open");
        setForceOpen(true);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isFileSelecting, isUploading]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      setFile(files[0]);
    }
  }, []);

  const handleFileInputClick = useCallback(() => {
    if (isUploading) return;
    setIsFileSelecting(true);
    setForceOpen(true);
    onFileSelectionStart?.();
    
    // Use a more reliable method to trigger file input
    const fileInput = document.getElementById("fileInput") as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }, [isUploading, onFileSelectionStart]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setIsFileSelecting(false);
      setForceOpen(true);
      onFileSelected?.();
    }
    e.target.value = "";
  }, [onFileSelected]);

  const handleUpload = useCallback(async () => {
    if (!file) return;
    setIsFileSelecting(false);
    setForceOpen(true);
    onUploadStart?.();
    await uploadFile(file);
  }, [file, uploadFile, onUploadStart]);

  const handleReset = useCallback(() => {
    resetUpload();
    setFile(null);
    setIsFileSelecting(false);
    setForceOpen(true);
  }, [resetUpload]);

  // Don't render if not forced open
  if (!forceOpen) {
    return null;
  }

  if (!isConnected) {
    return null;
  }

  return (
    <div 
      className="mt-4 p-6"
      style={{
        position: 'relative',
        zIndex: 1000,
        pointerEvents: 'auto'
      }}
    >
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        } ${
          isUploading ? "cursor-not-allowed text-gray-400" : "cursor-pointer"
        }`}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleFileInputClick}
        onTouchStart={(e) => {
          if (isUploading) return;
          e.preventDefault();
          e.stopPropagation();
        }}
        onTouchEnd={(e) => {
          if (isUploading) return;
          e.preventDefault();
          e.stopPropagation();
          handleFileInputClick();
        }}
        style={{
          position: 'relative',
          zIndex: 1001,
          pointerEvents: 'auto'
        }}
      >
        <input
          id="fileInput"
          type="file"
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0,
            cursor: 'pointer',
            zIndex: 1002
          }}
        />
        <div className="flex flex-col items-center gap-2">
          <svg
            className={`w-10 h-10 ${
              isDragging ? "text-blue-500" : "text-gray-400"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="text-lg font-medium">
            {file ? file.name : "Drop your file here, or click to select"}
          </p>
          {!file && (
            <p className="text-sm text-gray-500">
              Drag and drop your file, or click to browse
            </p>
          )}
        </div>
      </div>

      {/* File Selection Status */}
      {isFileSelecting && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-pulse rounded-full h-4 w-4 bg-yellow-500"></div>
            <span className="text-yellow-700 font-medium">Selecting file...</span>
          </div>
          <p className="text-yellow-600 text-sm mt-1">
            Please select your image from camera or gallery
          </p>
        </div>
      )}

      <div className="flex justify-center gap-4 mt-4">
        <button
          onClick={handleUpload}
          disabled={!file || isUploading || !!uploadedInfo}
          aria-disabled={!file || isUploading}
          className={`px-6 py-2 rounded-[20px] text-center border-2 transition-all
            ${
              !file || isUploading || uploadedInfo
                ? "border-gray-200 text-gray-400 cursor-not-allowed"
                : "border-secondary text-secondary hover:bg-secondary/70 hover:text-secondary-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50 hover:border-secondary/70 hover:cursor-pointer"
            }
          `}
        >
          {isUploading
            ? "Uploading..."
            : !uploadedInfo
            ? "Submit"
            : "Submitted"}
        </button>
        <button
          onClick={handleReset}
          disabled={!file || isUploading}
          aria-disabled={!file || isUploading}
          className={`px-6 py-2 rounded-[20px] text-center border-2 transition-all
            ${
              !file || isUploading
                ? "border-gray-200 text-gray-400 cursor-not-allowed"
                : "border-secondary text-secondary hover:bg-secondary/70 hover:text-secondary-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50 hover:border-secondary/70 hover:cursor-pointer"
            }
          `}
        >
          Reset
        </button>
      </div>
      
      {status && (
        <div className="mt-4 text-center">
          <p
            className={`text-sm
              ${
                status.includes("❌")
                  ? "text-red-500"
                  : status.includes("✅") || status.includes("🎉")
                  ? "text-green-500"
                  : "text-secondary"
              }
            `}
          >
            {status}
          </p>
          {isUploading && (
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div
                className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}
        </div>
      )}
      
      {/* Uploaded file info panel */}
      {uploadedInfo && !isUploading && (
        <div className="mt-6 bg-background border border-border rounded-xl p-4 text-left">
          <h4 className="font-semibold mb-2 text-foreground">
            File Upload Details
          </h4>
          <div className="text-sm text-foreground">
            <div>
              <span className="font-medium">File name:</span>{" "}
              {uploadedInfo.fileName}
            </div>
            <div>
              <span className="font-medium">File size:</span>{" "}
              {uploadedInfo.fileSize?.toLocaleString() || "N/A"} bytes
            </div>
            <div className="break-all">
              <span className="font-medium">Piece CID:</span>{" "}
              {uploadedInfo.pieceCid}
            </div>
            <div className="break-all">
              <span className="font-medium">Tx Hash:</span>{" "}
              {uploadedInfo.txHash}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};