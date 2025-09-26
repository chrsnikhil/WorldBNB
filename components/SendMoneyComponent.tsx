"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { usePayment } from '../hooks/usePayment';
import { Tokens } from '@worldcoin/minikit-js';

export default function SendMoneyComponent() {
  const { sendWLD, sendUSDC, isProcessing, error } = usePayment();
  const [formData, setFormData] = useState({
    recipient: '',
    amount: '',
    token: Tokens.WLD,
    description: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.recipient || !formData.amount) {
      alert('Please fill in all required fields');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (amount <= 0) {
      alert('Amount must be greater than 0');
      return;
    }

    try {
      const description = formData.description || `Payment to ${formData.recipient}`;
      
      const result = await (formData.token === Tokens.WLD 
        ? sendWLD(formData.recipient, amount, description)
        : sendUSDC(formData.recipient, amount, description)
      );

      if (result.success) {
        alert('Payment sent successfully!');
        // Reset form
        setFormData({
          recipient: '',
          amount: '',
          token: Tokens.WLD,
          description: ''
        });
      }
    } catch (error) {
      console.error('Error sending payment:', error);
      alert('Failed to send payment. Please try again.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-neutral-800 rounded-xl p-6"
    >
      <h2 className="text-xl font-semibold mb-4 text-orange-500">Send Money</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            Recipient Address
          </label>
          <input
            type="text"
            name="recipient"
            value={formData.recipient}
            onChange={handleInputChange}
            required
            className="w-full mobile-input"
            placeholder="0x..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            Amount
          </label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
            required
            step="0.001"
            min="0.1"
            className="w-full mobile-input"
            placeholder="1.0"
          />
          <p className="text-xs text-neutral-500 mt-1">Minimum: $0.1</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            Token
          </label>
          <select
            name="token"
            value={formData.token}
            onChange={handleInputChange}
            className="w-full mobile-input"
          >
            <option value={Tokens.WLD}>WLD (World Token)</option>
            <option value={Tokens.USDC}>USDC (USD Coin)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            Description (Optional)
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className="w-full mobile-input"
            placeholder="What's this payment for?"
          />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        <motion.button
          type="submit"
          disabled={isProcessing}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full mobile-button bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-neutral-700 disabled:to-neutral-800 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 shadow-lg disabled:shadow-none"
        >
          {isProcessing ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Sending Payment...</span>
            </div>
          ) : (
            `Send ${formData.token === Tokens.WLD ? 'WLD' : 'USDC'}`
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}
