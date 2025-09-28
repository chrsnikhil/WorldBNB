"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MiniKit, VerificationLevel, ISuccessResult } from "@worldcoin/minikit-js";

interface TestReviewComponentProps {
  onReviewSubmitted: (review: any) => void;
}

export default function TestReviewComponent({ onReviewSubmitted }: TestReviewComponentProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  // Mock booking data for testing
  const mockBooking = {
    id: "TEST-" + Date.now(),
    propertyId: 999,
    propertyName: "Test Property",
    guest: "Test User",
    checkIn: "2024-01-15",
    checkOut: "2024-01-17",
    status: "completed"
  };

  const handleVerification = async () => {
    try {
      setIsVerifying(true);
      setVerificationError(null);

      const { finalPayload } = await MiniKit.commandsAsync.verify({
        action: "verifyuser", // Use the same action as in the main app
        signal: mockBooking.id,
        verification_level: VerificationLevel.Orb,
      });

      if (finalPayload.status === 'error') {
        setVerificationError("Verification failed. Please try again.");
        return;
      }

      // Verify the proof in the backend
      const verifyResponse = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payload: finalPayload as ISuccessResult,
          action: 'verifyuser',
          signal: mockBooking.id,
        }),
      });

      const verifyResponseJson = await verifyResponse.json();
      console.log('🔍 Verification response:', verifyResponseJson);
      
      if (verifyResponseJson.status === 200) {
        setIsVerified(true);
        console.log("✅ User verified for test review");
      } else {
        const errorMessage = verifyResponseJson.error || verifyResponseJson.details || "Backend verification failed. Please try again.";
        setVerificationError(errorMessage);
        console.error("❌ Verification failed:", verifyResponseJson);
      }
    } catch (error: any) {
      console.error("Verification error:", error);
      setVerificationError(error.message || "Verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async () => {
    if (!isVerified) {
      setVerificationError("Please verify your identity first");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create test review object
      const review = {
        id: Date.now().toString(),
        bookingId: mockBooking.id,
        propertyId: mockBooking.propertyId,
        reviewer: mockBooking.guest,
        rating,
        comment,
        timestamp: Date.now(),
        verified: true,
        isTestReview: true
      };

      // Simulate API call to submit review
      await new Promise(resolve => setTimeout(resolve, 1000));

      onReviewSubmitted(review);
      
      // Reset form
      setRating(5);
      setComment("");
      setIsVerified(false);
      setVerificationError(null);
    } catch (error) {
      console.error("Review submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <h2 className="text-xl font-bold text-white">Test Review System</h2>
        </div>
        <p className="text-neutral-400 text-sm">
          Test the review system without completing a booking. This creates a mock review for testing purposes.
        </p>
      </div>

      {/* Mock Booking Info */}
      <div className="bg-neutral-700 rounded-lg p-4">
        <h3 className="font-semibold text-white mb-2">Test Booking #{mockBooking.id}</h3>
        <p className="text-sm text-neutral-300">Property: {mockBooking.propertyName}</p>
        <p className="text-sm text-neutral-300">Dates: {mockBooking.checkIn} - {mockBooking.checkOut}</p>
      </div>

      {/* Verification Section */}
      {!isVerified && (
        <div className="bg-neutral-700 rounded-lg p-4">
          <h3 className="font-semibold text-white mb-2">Step 1: Verify Your Identity</h3>
          <p className="text-sm text-neutral-300 mb-4">
            Please verify your identity using World ID to submit a test review
          </p>
          <button
            onClick={handleVerification}
            disabled={isVerifying}
            className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isVerifying ? "Verifying..." : "Verify with World ID"}
          </button>
          {verificationError && (
            <p className="text-red-400 text-sm mt-2">{verificationError}</p>
          )}
        </div>
      )}

      {/* Verification Success */}
      {isVerified && (
        <div className="bg-green-500/20 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-green-300 font-medium">Identity Verified</span>
          </div>
        </div>
      )}

      {/* Review Form */}
      {isVerified && (
        <div className="space-y-4">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Rating
            </label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`w-8 h-8 ${
                    star <= rating ? 'text-yellow-400' : 'text-neutral-400'
                  } hover:text-yellow-400 transition-colors`}
                >
                  <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Comment (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your test experience..."
              className="w-full p-3 border border-neutral-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none bg-neutral-800 text-white placeholder-neutral-400"
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-neutral-400 mt-1">{comment.length}/500 characters</p>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "Submitting Test Review..." : "Submit Test Review"}
          </button>
        </div>
      )}

      {/* Test Info */}
      <div className="bg-neutral-700/50 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium text-orange-300">Test Mode</span>
        </div>
        <p className="text-xs text-neutral-400">
          This creates a test review with mock data. The review will be marked as a test review and won't affect real booking data.
        </p>
      </div>
    </div>
  );
}
