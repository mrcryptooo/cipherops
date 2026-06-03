"use client";
// Browser-safe FHE encryptor for TokenOps SDK.
// Uses createSepoliaEncryptorWeb from @tokenops/sdk/fhe which wraps
// @zama-fhe/sdk's RelayerWeb — no Node.js worker_threads, no backend needed.
//
// KEY POINTS:
// 1. Always pass chainId: sepolia.id explicitly — do NOT rely on walletClient.chain?.id.
//    ViemSigner.getChainId() uses walletClient.chain?.id which may be undefined in
//    wagmi v2, causing RelayerWeb to fail with CONFIGURATION error on encrypt().
// 2. Guard on walletClient.account — ViemSigner.getAddress() fails without it.
// 3. Lazy factory pattern (SDK Pitfall #3) — factory always returns current ref.

import { useEffect, useRef, useState, useCallback } from "react";
import { usePublicClient, useWalletClient, useChainId, useAccount } from "wagmi";
import { sepolia } from "wagmi/chains";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SepoliaEncryptorWeb = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EncryptorSource = () => SepoliaEncryptorWeb | undefined;

export interface UseTokenOpsEncryptorResult {
  encryptor: SepoliaEncryptorWeb | undefined;
  /** Lazy factory — always returns current encryptor at call-time. */
  encryptorFactory: EncryptorSource;
  isReady: boolean;
  isLoading: boolean;
  error: Error | undefined;
  /** Human-readable status string for UI display. */
  statusLabel: string;
  reset: () => void;
}

export function useTokenOpsEncryptor(): UseTokenOpsEncryptorResult {
  const chainId = useChainId();
  const { address: accountAddress, isConnected } = useAccount();
  const publicClient = usePublicClient({ chainId });
  const { data: walletClient } = useWalletClient({ chainId });

  const [encryptor, setEncryptor] = useState<SepoliaEncryptorWeb | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  const encryptorRef = useRef<SepoliaEncryptorWeb | undefined>(undefined);
  const abortRef = useRef<{ cancelled: boolean }>({ cancelled: false });

  const isSepolia = chainId === sepolia.id;
  // walletClient.account must exist; wagmi may briefly return a walletClient with no account
  const hasAccount = !!walletClient?.account;

  const canInit = isSepolia && isConnected && !!publicClient && !!walletClient && hasAccount;

  const reset = useCallback(() => {
    abortRef.current.cancelled = true;
    const prev = encryptorRef.current;
    encryptorRef.current = undefined;
    prev?.terminate?.();
    setEncryptor(undefined);
    setIsLoading(false);
    setError(undefined);
  }, []);

  useEffect(() => {
    if (!canInit) {
      reset();
      return;
    }

    const controller = { cancelled: false };
    abortRef.current = controller;
    setIsLoading(true);
    setError(undefined);

    // Diagnostic: log config state to console without printing private keys/secrets
    console.debug("[TokenOpsEncryptor] Initialising", {
      chainId,
      "publicClient.chain.id": publicClient?.chain?.id,
      "walletClient.chain.id": walletClient?.chain?.id,
      hasAccount,
      accountAddress,
    });

    (async () => {
      try {
        const { createSepoliaEncryptorWeb } = await import("@tokenops/sdk/fhe");
        if (controller.cancelled) return;

        const enc = await createSepoliaEncryptorWeb({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          publicClient: publicClient as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          walletClient: walletClient as any,
          // CRITICAL: explicit chainId prevents RelayerWeb from using walletClient.chain?.id
          // which can be undefined in wagmi v2, causing CONFIGURATION errors at encrypt time.
          chainId: sepolia.id,
        });

        if (controller.cancelled) {
          enc.terminate?.();
          return;
        }

        console.debug("[TokenOpsEncryptor] Ready");
        encryptorRef.current = enc;
        setEncryptor(enc);
        setIsLoading(false);
      } catch (err) {
        if (controller.cancelled) return;
        const e = err instanceof Error ? err : new Error(String(err));
        console.error("[TokenOpsEncryptor] Init failed:", e.message);
        setError(e);
        setIsLoading(false);
      }
    })();

    return () => {
      controller.cancelled = true;
      const prev = encryptorRef.current;
      encryptorRef.current = undefined;
      prev?.terminate?.();
    };
    // Include accountAddress so encryptor re-creates on wallet switch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canInit, chainId, accountAddress, publicClient, walletClient]);

  const encryptorFactory = useCallback<EncryptorSource>(() => encryptorRef.current, []);

  let statusLabel: string;
  if (!isConnected) statusLabel = "Waiting for wallet connection";
  else if (!isSepolia) statusLabel = "Switch wallet to Sepolia";
  else if (!hasAccount) statusLabel = "Wallet account not ready";
  else if (error) statusLabel = `Init error: ${error.message.slice(0, 80)}`;
  else if (isLoading) statusLabel = "Downloading FHE keys from Zama relayer…";
  else if (encryptor) statusLabel = "Ready";
  else statusLabel = "Not started";

  return {
    encryptor,
    encryptorFactory,
    isReady: !!encryptor && !isLoading && !error,
    isLoading,
    error,
    statusLabel,
    reset,
  };
}
