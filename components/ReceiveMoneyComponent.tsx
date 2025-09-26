"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';

interface User {
  walletAddress?: string;
  username?: string;
}

interface ReceiveMoneyComponentProps {
  user: User | null;
}

export default function ReceiveMoneyComponent({ user }: ReceiveMoneyComponentProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const shareAddress = async () => {
    if (navigator.share && user?.walletAddress) {
      try {
        await navigator.share({
          title: 'My Wallet Address',
          text: `Send me money at: ${user.walletAddress}`,
          url: window.location.href
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-neutral-800 rounded-xl p-6"
    >
      <h2 className="text-xl font-semibold mb-4 text-orange-500">Receive Money</h2>
      
      <div className="space-y-6">
        {/* QR Code Placeholder */}
        <div className="text-center">
          <div className="w-48 h-48 bg-neutral-700 rounded-xl mx-auto mb-4 flex items-center justify-center">
            <div className="text-center">
              <div className="w-32 h-32 bg-white rounded-lg mx-auto mb-2 flex items-center justify-center">
                <span className="text-xs text-black font-mono">QR Code</span>
              </div>
              <p className="text-xs text-neutral-400">Scan to pay</p>
            </div>
          </div>
        </div>

        {/* Wallet Address */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-neutral-300">
            Your Wallet Address
          </label>
          <div className="bg-neutral-900 rounded-lg p-3 border border-neutral-700">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm text-orange-500 break-all">
                {user?.walletAddress || 'Not connected'}
              </span>
              <button
                onClick={() => user?.walletAddress && copyToClipboard(user.walletAddress)}
                className="ml-2 p-2 hover:bg-neutral-700 rounded-lg transition-colors"
              >
                {copied ? (
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Share Options */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-neutral-300">
            Share Your Address
          </label>
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => user?.walletAddress && copyToClipboard(user.walletAddress)}
              className="bg-neutral-700 hover:bg-neutral-600 rounded-lg p-3 text-center transition-colors"
            >
              <svg className="w-6 h-6 mx-auto mb-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <div className="text-sm font-medium">Copy</div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={shareAddress}
              className="bg-neutral-700 hover:bg-neutral-600 rounded-lg p-3 text-center transition-colors"
            >
              <svg className="w-6 h-6 mx-auto mb-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              <div className="text-sm font-medium">Share</div>
            </motion.button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <h3 className="text-blue-500 font-semibold mb-2">How to receive money:</h3>
          <ul className="text-sm text-blue-300 space-y-1">
            <li>• Share your wallet address with the sender</li>
            <li>• They can send WLD or USDC directly to your address</li>
            <li>• Payments are processed on World Chain</li>
            <li>• No gas fees for you - World App sponsors them</li>
          </ul>
        </div>

        {/* Supported Tokens */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-neutral-300">
            Supported Tokens
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-neutral-700 rounded-lg p-3 text-center">
              <div className="w-8 h-8 bg-orange-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <div className="text-sm font-medium">WLD</div>
              <div className="text-xs text-neutral-400">World Token</div>
            </div>
            <div className="bg-neutral-700 rounded-lg p-3 text-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                <span className="text-white font-bold text-sm">$</span>
              </div>
              <div className="text-sm font-medium">USDC</div>
              <div className="text-xs text-neutral-400">USD Coin</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
