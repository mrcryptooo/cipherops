"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { wagmiConfig } from "@/lib/wagmi";
import { InMemoryStorageProvider } from "@/lib/fhevm/react/useInMemoryStorage";
import { useState } from "react";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            gcTime: 5 * 60_000,
            retry: 2,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#38bdf8",
            accentColorForeground: "#0a0a0f",
            borderRadius: "medium",
            fontStack: "system",
          })}
        >
          {/* InMemoryStorageProvider makes fhevmDecryptionSignatureStorage
              available to any TokenActionPanel in the tree via useInMemoryStorage() */}
          <InMemoryStorageProvider>
            {children}
          </InMemoryStorageProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
