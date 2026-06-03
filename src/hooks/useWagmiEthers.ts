"use client";
// Bridges the connected wagmi wallet client to:
//   (a) ethers v6 JsonRpcSigner  — for Zama FhevmDecryptionSignature signing
//   (b) raw EIP-1193 provider    — for useFhevm / createFhevmInstance init
//
// Why two providers?
//   ethers.BrowserProvider wraps an EIP-1193 provider but does NOT itself
//   expose .request() at the top level, so it cannot be passed directly to
//   createFhevmInstance which calls providerOrUrl.request({ method, params }).
//   We therefore also retrieve the raw EIP-1193 provider via
//   connector.getProvider() and expose it separately.

import { useMemo, useState, useEffect } from "react";
import { useConnectorClient, useAccount, useChainId } from "wagmi";
import { BrowserProvider, JsonRpcSigner } from "ethers";
import type { Client, Transport, Chain, Account } from "viem";

// Minimal EIP-1193 shape — enough for createFhevmInstance
export type Eip1193Like = { request(args: { method: string; params?: unknown[] }): Promise<unknown> };

function clientToSigner(client: Client<Transport, Chain, Account>): JsonRpcSigner {
  const { account, chain, transport } = client;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const provider = new BrowserProvider(transport as any, network);
  return new JsonRpcSigner(provider, account.address);
}

export function useWagmiEthers(): {
  ethersSigner: JsonRpcSigner | undefined;
  ethersProvider: BrowserProvider | undefined;
  eip1193Provider: Eip1193Like | undefined;
} {
  const { data: client } = useConnectorClient();
  const { connector } = useAccount();
  const chainId = useChainId();

  // Raw EIP-1193 provider from the connector (window.ethereum for MetaMask).
  // This is what createFhevmInstance expects — it calls provider.request().
  const [eip1193Provider, setEip1193Provider] = useState<Eip1193Like | undefined>(undefined);

  useEffect(() => {
    if (!connector) {
      setEip1193Provider(undefined);
      return;
    }

    connector
      .getProvider({ chainId })
      .then((p) => {
        const hasRequest = typeof (p as Eip1193Like)?.request === "function";
        console.log(
          `[useWagmiEthers] connector.getProvider → type=${typeof p} hasRequest=${hasRequest}`
        );
        if (hasRequest) {
          setEip1193Provider(p as Eip1193Like);
        } else {
          // Fallback: window.ethereum (injected wallet)
          const win = typeof window !== "undefined" ? window : undefined;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const winEth = (win as any)?.ethereum as Eip1193Like | undefined;
          const winHasRequest = typeof winEth?.request === "function";
          console.log(`[useWagmiEthers] fallback window.ethereum hasRequest=${winHasRequest}`);
          setEip1193Provider(winHasRequest ? winEth : undefined);
        }
      })
      .catch(() => {
        // Fallback on error
        const win = typeof window !== "undefined" ? window : undefined;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const winEth = (win as any)?.ethereum as Eip1193Like | undefined;
        setEip1193Provider(typeof winEth?.request === "function" ? winEth : undefined);
      });
  }, [connector, chainId]);

  const signerData = useMemo(() => {
    if (!client) return { ethersSigner: undefined, ethersProvider: undefined };
    const signer = clientToSigner(client as Client<Transport, Chain, Account>);
    return {
      ethersSigner: signer,
      ethersProvider: signer.provider as BrowserProvider,
    };
  }, [client]);

  return { ...signerData, eip1193Provider };
}
