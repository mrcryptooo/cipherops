"use client";

import { useState, useEffect } from "react";
import { useRegistryPairs } from "@/hooks/useRegistryPairs";
import { RegistryTable } from "./RegistryTable";
import { NetworkSwitcher } from "@/components/ui/NetworkSwitcher";
import { NETWORKS } from "@/lib/registry";
import type { EnrichedPair } from "@/types/registry";

export type ActionTab = "assets" | "wrap" | "reveal" | "unwrap";

export function RegistryExplorer() {
  const [networkKey, setNetworkKey] = useState<string>("sepolia");
  const [selectedPairKey, setSelectedPairKey] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<ActionTab>("assets");

  const { pairs, rawCount, validCount, isLoading, error, refetch } = useRegistryPairs(networkKey);
  const network = NETWORKS[networkKey];

  // Close panel when the user switches networks
  useEffect(() => {
    setSelectedPairKey(null);
  }, [networkKey]);

  function handleOpenActions(pair: EnrichedPair, tab: ActionTab) {
    const sameKey = pair.confidentialTokenAddress === selectedPairKey;
    if (sameKey && tab === selectedTab) {
      setSelectedPairKey(null); // toggle off
    } else {
      setSelectedPairKey(pair.confidentialTokenAddress);
      setSelectedTab(tab);
    }
  }

  return (
    <section className="space-y-5">
      {/* Header row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Registry Explorer</h2>
          <p className="mt-1 text-sm">
            {isLoading ? (
              <span className="text-zinc-500">Reading on-chain registry…</span>
            ) : error ? (
              <span className="text-zinc-500">Could not reach registry</span>
            ) : (
              <>
                <span className="font-semibold text-white">{validCount}</span>
                <span className="text-zinc-500">
                  {" "}valid pair{validCount !== 1 ? "s" : ""}
                  {rawCount > validCount ? ` (${rawCount - validCount} invalid filtered)` : ""} on {network.shortName}
                </span>
              </>
            )}
          </p>
          <p className="mt-0.5 font-mono text-xs text-zinc-600">{network.registryAddress}</p>
        </div>

        <div className="flex items-center gap-3">
          <NetworkSwitcher selected={networkKey} onChange={setNetworkKey} />
          <button
            onClick={() => refetch()}
            title="Refresh registry data"
            className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-[#111] px-3 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:border-zinc-700 hover:text-white"
          >
            <span>↻</span>
            Refresh
          </button>
        </div>
      </div>

      {/* Live Registry Source badge */}
      <div
        className="flex flex-col gap-2 rounded-lg border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
        style={{ background: "rgba(255,210,8,0.04)", borderColor: "rgba(255,210,8,0.16)" }}
      >
        <div className="flex items-center gap-2">
          <span
            className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
            style={{ background: "#FFD208" }}
          />
          <span className="text-xs font-medium" style={{ color: "#FFD208" }}>
            Sourced live from Zama on-chain registry
          </span>
        </div>
        <a
          href={`${network.explorerBaseUrl}/address/${network.registryAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          title={`View registry contract on ${network.shortName} explorer`}
          className="font-mono text-xs text-zinc-500 transition-colors hover:text-zinc-300"
        >
          {network.registryAddress}
        </a>
      </div>

      {/* Mainnet discovery note */}
      {networkKey === "mainnet" && (
        <div className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-[#111] px-4 py-3">
          <span
            className="mt-0.5 flex-shrink-0 text-sm font-semibold"
            style={{ color: "#FFD208" }}
          >
            ℹ
          </span>
          <p className="text-xs text-zinc-500">
            Mainnet pairs are displayed for discovery.
            Write actions (Faucet, Wrap, Private Reveal, Unwrap) are Sepolia-only in this version.
          </p>
        </div>
      )}

      {/* TokenActionPanel now renders inline inside the table as an expansion row */}
      <RegistryTable
        pairs={pairs}
        isLoading={isLoading}
        error={error as Error | null}
        networkKey={networkKey}
        selectedPairKey={selectedPairKey}
        expandedTab={selectedTab}
        onOpenActions={handleOpenActions}
        onClosePanel={() => setSelectedPairKey(null)}
      />
    </section>
  );
}
