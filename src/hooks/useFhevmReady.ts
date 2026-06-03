"use client";
// Initialises the Zama FHE SDK for the connected wallet and exposes
// readiness status. Does NOT perform decryption.

import { useAccount, useChainId } from "wagmi";
import { useFhevm } from "@/lib/fhevm/react/useFhevm";
import { useWagmiEthers } from "./useWagmiEthers";
import { SEPOLIA_CHAIN_ID } from "@/lib/registry";

export type FhevmReadyState = "idle" | "loading" | "ready" | "error" | "wrong-chain" | "disconnected";

export function useFhevmReady(): {
  isReady: boolean;
  status: FhevmReadyState;
  error: Error | undefined;
  chainId: number | undefined;
} {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { eip1193Provider } = useWagmiEthers();

  const isCorrectChain = chainId === SEPOLIA_CHAIN_ID;

  const { instance, status: fhevmStatus, error } = useFhevm({
    // Must be a raw EIP-1193 provider (has .request()) — NOT ethers.BrowserProvider.
    // eip1193Provider comes from connector.getProvider() which returns window.ethereum
    // for MetaMask.
    provider: eip1193Provider as Parameters<typeof useFhevm>[0]["provider"],
    chainId,
    enabled: isConnected && isCorrectChain && !!eip1193Provider,
  });

  const status: FhevmReadyState = !isConnected
    ? "disconnected"
    : !isCorrectChain
    ? "wrong-chain"
    : fhevmStatus === "error"
    ? "error"
    : fhevmStatus === "ready"
    ? "ready"
    : fhevmStatus === "loading"
    ? "loading"
    : "idle";

  return {
    isReady: !!instance && status === "ready",
    status,
    error,
    chainId,
  };
}
