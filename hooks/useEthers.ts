// Since we're using World App with MiniKit, we don't need wagmi for the signer
// The Synapse SDK will handle the wallet connection directly
export const useEthersSigner = () => {
  // Return undefined for now - Synapse SDK will handle wallet connection
  return undefined;
};
