import { Synapse } from "@filoz/synapse-sdk";

export const preflightCheck = async (
  file: File,
  synapse: Synapse,
  includeDatasetCreationFee: boolean,
  setStatus: (status: string) => void,
  setProgress: (progress: number) => void
) => {
  try {
    // Check USDFC balance
    const usdfcBalance = await synapse.payments.walletBalance('USDFC');
    setStatus(`💰 USDFC Balance: ${usdfcBalance}`);
    setProgress(10);

    // Check FIL balance for gas
    const filBalance = await synapse.payments.walletBalance();
    setStatus(`💰 FIL Balance: ${filBalance}`);
    setProgress(15);

    if (usdfcBalance === 0n) {
      throw new Error('No USDFC tokens available. Please get USDFC tokens from the faucet.');
    }

    if (filBalance === 0n) {
      throw new Error('No FIL tokens available. Please get FIL tokens from the faucet.');
    }

    setStatus('✅ Balances verified');
    setProgress(20);
  } catch (error) {
    console.error('Preflight check failed:', error);
    throw error;
  }
};
