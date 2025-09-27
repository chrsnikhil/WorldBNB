"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MiniKit, VerificationLevel, ISuccessResult } from "@worldcoin/minikit-js";

interface ReviewFormProps {
  booking: any;
  onReviewSubmitted: (review: any) => void;
  onClose: () => void;
}

export default function ReviewForm({ booking, onReviewSubmitted, onClose }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  const handleVerification = async () => {
    try {
      setIsVerifying(true);
      setVerificationError(null);

      const { finalPayload } = await MiniKit.commandsAsync.verify({
        action: "verifyuser", // Use the same action as in the main app
        signal: booking.id.toString(),
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
          signal: booking.id.toString(),
        }),
      });

      const verifyResponseJson = await verifyResponse.json();
      console.log('🔍 Verification response:', verifyResponseJson);
      
      if (verifyResponseJson.status === 200) {
        setIsVerified(true);
        console.log("✅ User verified for review");
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
      // Create review object
      const review = {
        id: Date.now().toString(),
        bookingId: booking.id,
        propertyId: booking.propertyId,
        reviewer: booking.guest,
        rating,
        comment,
        timestamp: Date.now(),
        verified: true
      };

      // Simulate API call to submit review
      await new Promise(resolve => setTimeout(resolve, 1000));

      onReviewSubmitted(review);
      onClose();
    } catch (error) {
      console.error("Review submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[10000]"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Leave a Review</h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Booking Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Reviewing Booking #{booking.id}</h3>
          <p className="text-sm text-gray-600">Property: {booking.propertyName}</p>
          <p className="text-sm text-gray-600">Dates: {booking.checkIn} - {booking.checkOut}</p>
        </div>

        {/* Verification Section */}
        {!isVerified && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Step 1: Verify Your Identity</h3>
            <p className="text-sm text-blue-700 mb-4">
              Please verify your identity using World ID to submit a review
            </p>
            <button
              onClick={handleVerification}
              disabled={isVerifying}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isVerifying ? "Verifying..." : "Verify with World ID"}
            </button>
            {verificationError && (
              <p className="text-red-600 text-sm mt-2">{verificationError}</p>
            )}
          </div>
        )}

        {/* Verification Success */}
        {isVerified && (
          <div className="mb-6 p-4 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-green-700 font-medium">Identity Verified</span>
            </div>
          </div>
        )}

        {/* Review Form */}
        {isVerified && (
          <div className="space-y-4">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`w-8 h-8 ${
                      star <= rating ? 'text-yellow-400' : 'text-gray-300'
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comment (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">{comment.length}/500 characters</p>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Submitting Review..." : "Submit Review"}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
