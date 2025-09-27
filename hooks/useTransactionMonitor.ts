import { useState, useEffect } from 'react';

interface TransactionStatus {
  isLoading: boolean;
  isConfirmed: boolean;
  isError: boolean;
  transactionHash?: string;
  error?: string;
}

export function useTransactionMonitor(transactionId?: string): TransactionStatus {
  const [status, setStatus] = useState<TransactionStatus>({
    isLoading: false,
    isConfirmed: false,
    isError: false,
  });

  useEffect(() => {
    if (!transactionId) return;

    setStatus(prev => ({ ...prev, isLoading: true }));

    // Poll for transaction status
    const pollTransaction = async () => {
      try {
        const response = await fetch(
          `https://developer.worldcoin.org/api/v2/minikit/transaction/${transactionId}?app_id=${process.env.NEXT_PUBLIC_APP_ID}&type=transaction`,
          {
            method: 'GET',
          }
        );
        
        const transaction = await response.json();
        
        if (transaction.transactionStatus === 'confirmed') {
          setStatus({
            isLoading: false,
            isConfirmed: true,
            isError: false,
            transactionHash: transaction.transactionHash,
          });
        } else if (transaction.transactionStatus === 'failed') {
          setStatus({
            isLoading: false,
            isConfirmed: false,
            isError: true,
            error: 'Transaction failed',
          });
        } else {
          // Still pending, continue polling
          setTimeout(pollTransaction, 2000);
        }
      } catch (error) {
        setStatus({
          isLoading: false,
          isConfirmed: false,
          isError: true,
          error: 'Failed to check transaction status',
        });
      }
    };

    pollTransaction();
  }, [transactionId]);

  return status;
}
