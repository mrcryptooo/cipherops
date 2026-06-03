"use client";
// Source: packages/fhevm-sdk/src/react/useInMemoryStorage.tsx (zama-ai/dapps)
import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { GenericStringInMemoryStorage } from "../storage/GenericStringStorage";
import type { GenericStringStorage } from "../storage/GenericStringStorage";

const InMemoryStorageContext = createContext<GenericStringStorage | null>(null);

export function useInMemoryStorage(): { storage: GenericStringStorage } {
  const ctx = useContext(InMemoryStorageContext);
  if (!ctx) throw new Error("useInMemoryStorage must be used within an InMemoryStorageProvider");
  return { storage: ctx };
}

export function InMemoryStorageProvider({ children }: { children: ReactNode }) {
  const [storage] = useState<GenericStringStorage>(() => new GenericStringInMemoryStorage());
  return (
    <InMemoryStorageContext.Provider value={storage}>
      {children}
    </InMemoryStorageContext.Provider>
  );
}
