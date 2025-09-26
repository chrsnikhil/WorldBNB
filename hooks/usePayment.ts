import { useState } from 'react';
import { MiniKit, tokenToDecimals, Tokens, PayCommandInput } from '@worldcoin/minikit-js';

export const usePayment = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiatePayment = async () => {
    try {
      const res = await fetch('/api/initiate-pay', {
        method: 'POST',
      });
      const { id } = await res.json();
      return id;
    } catch (error) {
      console.error('Error initiating payment:', error);
      throw error;
    }
  };

  const sendPayment = async (
    to: string,
    amount: number,
    token: Tokens,
    description: string
  ) => {
    if (!MiniKit.isInstalled()) {
      throw new Error('MiniKit is not installed');
    }

    setIsProcessing(true);
    setError(null);

    try {
      // 1. Initiate payment on backend
      const reference = await initiatePayment();

      // 2. Create payment payload
      const payload: PayCommandInput = {
        reference: reference,
        to: to,
        tokens: [
          {
            symbol: token,
            token_amount: tokenToDecimals(amount, token).toString(),
          },
        ],
        description: description,
      };

      // 3. Send payment command
      const { finalPayload } = await MiniKit.commandsAsync.pay(payload);

      if (finalPayload.status === 'success') {
        // 4. Verify payment on backend
        const res = await fetch('/api/confirm-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(finalPayload),
        });
        
        const payment = await res.json();
        console.log('Payment confirmation response:', payment);
        
        if (payment.success) {
          return { success: true, transaction: payment.transaction };
        } else {
          console.error('Payment verification failed:', payment);
          throw new Error(`Payment verification failed: ${payment.error || 'Unknown error'}`);
        }
      } else {
        throw new Error('Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError(error instanceof Error ? error.message : 'Payment failed');
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const sendWLD = async (to: string, amount: number, description: string) => {
    return sendPayment(to, amount, Tokens.WLD, description);
  };

  const sendUSDC = async (to: string, amount: number, description: string) => {
    return sendPayment(to, amount, Tokens.USDC, description);
  };

  return {
    sendPayment,
    sendWLD,
    sendUSDC,
    isProcessing,
    error,
  };
};
