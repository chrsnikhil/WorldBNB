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

  const bookProperty = async (
    propertyId: number,
    checkInDate: number,
    checkOutDate: number,
    hostAddress: string,
    totalAmount: number,
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
        to: hostAddress,
        tokens: [
          {
            symbol: token,
            token_amount: tokenToDecimals(totalAmount, token).toString(),
          },
        ],
        description: description,
      };

      // 3. Send payment command
      const { finalPayload } = await MiniKit.commandsAsync.pay(payload);

      if (finalPayload.status === 'success') {
        // 4. Verify payment on backend
        const paymentRes = await fetch('/api/confirm-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(finalPayload),
        });
        
        const payment = await paymentRes.json();
        console.log('Payment confirmation response:', payment);
        
        if (payment.success) {
          // 5. Create booking on-chain after successful payment
          const bookingRes = await fetch('/api/complete-booking', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              propertyId,
              checkInDate,
              checkOutDate,
              paymentReference: reference,
              totalAmount: totalAmount.toString()
            }),
          });
          
          const booking = await bookingRes.json();
          console.log('Booking creation response:', booking);
          
          if (booking.success) {
            return { 
              success: true, 
              transaction: payment.transaction,
              bookingId: booking.bookingId,
              bookingTxHash: booking.transactionHash
            };
          } else {
            throw new Error(`Booking creation failed: ${booking.error || 'Unknown error'}`);
          }
        } else {
          throw new Error(`Payment verification failed: ${payment.error || 'Unknown error'}`);
        }
      } else {
        throw new Error('Payment failed');
      }
    } catch (error) {
      console.error('Booking error:', error);
      setError(error instanceof Error ? error.message : 'Booking failed');
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    sendPayment,
    sendWLD,
    sendUSDC,
    bookProperty,
    isProcessing,
    error,
  };
};
