"use client";

import {
  Synapse,
  WarmStorageService,
} from "@filoz/synapse-sdk";
import { createContext, useState, useEffect, useContext } from "react";
import { useEthersSigner } from "@/hooks/useEthers";
import { config } from "@/config";

export const SynapseContext = createContext<{
  synapse: Synapse | null;
  warmStorageService: WarmStorageService | null;
}>({ synapse: null, warmStorageService: null });

export const SynapseProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [synapse, setSynapse] = useState<Synapse | null>(null);

  const [warmStorageService, setWarmStorageService] =
    useState<WarmStorageService | null>(null);
  const signer = useEthersSigner();

  const createSynapse = async () => {
    // Use private key approach for World App compatibility
    const privateKey = process.env.NEXT_PUBLIC_PRIVATE_KEY;
    
    if (!privateKey || privateKey === '0x...') {
      console.warn('NEXT_PUBLIC_PRIVATE_KEY not set, Synapse will not be available');
      return;
    }

    const synapse = await Synapse.create({
      privateKey: privateKey,
      withCDN: config.withCDN,
      disableNonceManager: false,
      // Use Calibration testnet
      rpcURL: "https://api.calibration.node.glif.io/rpc/v1",
    });

    const warmStorageService = await WarmStorageService.create(
      synapse.getProvider(),
      synapse.getWarmStorageAddress()
    );
    setSynapse(synapse);
    setWarmStorageService(warmStorageService);
  };
  useEffect(() => {
    createSynapse();
  }, []);

  return (
    <SynapseContext.Provider value={{ synapse, warmStorageService }}>
      {children}
    </SynapseContext.Provider>
  );
};

export const useSynapse = () => {
  const { synapse, warmStorageService } = useContext(SynapseContext);
  return { synapse, warmStorageService };
};
