"use client";

import { Fragment } from "react";
import type { EnrichedPair } from "@/types/registry";
import { NETWORKS, SEPOLIA_CHAIN_ID, explorerAddressUrl, shortAddress } from "@/lib/registry";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { TokenActionPanel } from "./TokenActionPanel";
import type { ActionTab } from "./RegistryExplorer";

interface RegistryTableProps {
  pairs: EnrichedPair[];
  isLoading: boolean;
  error: Error | null;
  networkKey: string;
  selectedPairKey: string | null;
  expandedTab: ActionTab;
  onOpenActions: (pair: EnrichedPair, tab: ActionTab) => void;
  onClosePanel: () => void;
}

function AddressCell({ address, explorerUrl }: { address: string; explorerUrl: string }) {
  return (
    <a
      href={explorerUrl}
      target="_blank"
      rel="noopener noreferrer"
      title={address}
      className="font-mono text-xs hover:underline transition-colors"
      style={{ color: "#FFD208" }}
    >
      {shortAddress(address)}
    </a>
  );
}

// ─── Action chip — clicking opens the TokenActionPanel ────────────────────────

function ActionChip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="chip-live rounded-full border px-3 py-1 text-xs font-medium transition-all duration-150"
      style={{
        borderColor: "rgba(255,210,8,0.30)",
        background: "rgba(255,210,8,0.06)",
        color: "#FFD208",
      }}
    >
      {label}
    </button>
  );
}

function DisabledChip({ label, title }: { label: string; title: string }) {
  return (
    <button
      disabled
      title={title}
      className="rounded-full border px-3 py-1 text-xs font-medium cursor-not-allowed select-none"
      style={{
        borderColor: "rgba(255,255,255,0.06)",
        background: "rgba(255,255,255,0.02)",
        color: "#3d3d3d",
      }}
    >
      {label}
    </button>
  );
}

interface ActionChipsProps {
  pair: EnrichedPair;
  isSepolia: boolean;
  onOpenActions: (pair: EnrichedPair, tab: ActionTab) => void;
}

function ActionChips({ pair, isSepolia, onOpenActions }: ActionChipsProps) {
  const mainnetMsg = "Writes are Sepolia-only in this version";
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {isSepolia ? (
        <>
          <ActionChip label="Faucet"         onClick={() => onOpenActions(pair, "assets")} />
          <ActionChip label="Wrap"           onClick={() => onOpenActions(pair, "wrap")} />
          <ActionChip label="Private Reveal" onClick={() => onOpenActions(pair, "reveal")} />
          <ActionChip label="Unwrap"         onClick={() => onOpenActions(pair, "unwrap")} />
        </>
      ) : (
        <>
          <DisabledChip label="Faucet"         title={mainnetMsg} />
          <DisabledChip label="Wrap"           title={mainnetMsg} />
          <DisabledChip label="Private Reveal" title={mainnetMsg} />
          <DisabledChip label="Unwrap"         title={mainnetMsg} />
        </>
      )}
    </div>
  );
}

const COL_COUNT = 8; // Actions column removed; chips live in sub-row

export function RegistryTable({
  pairs,
  isLoading,
  error,
  networkKey,
  selectedPairKey,
  expandedTab,
  onOpenActions,
  onClosePanel,
}: RegistryTableProps) {
  const network = NETWORKS[networkKey];
  const isSepolia = network.chainId === SEPOLIA_CHAIN_ID;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-zinc-700/40 bg-zinc-900/30 py-12">
        <Spinner size={22} />
        <p className="text-sm text-zinc-500">Reading registry on {network.shortName}…</p>
      </div>
    );
  }

  if (error) {
    const envVar =
      networkKey === "sepolia"
        ? "NEXT_PUBLIC_SEPOLIA_RPC_URL"
        : "NEXT_PUBLIC_MAINNET_RPC_URL";
    const isAuthError =
      error.message.toLowerCase().includes("unauthorized") ||
      error.message.toLowerCase().includes("api key") ||
      error.message.toLowerCase().includes("401");

    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-6 py-8 text-center">
        <p className="text-sm font-medium text-red-400">Registry read failed</p>
        {isAuthError ? (
          <p className="mt-2 text-xs text-red-400/70">
            RPC authentication error — the default public endpoint requires an API key.
          </p>
        ) : (
          <p className="mt-1.5 font-mono text-xs text-red-400/60">{error.message}</p>
        )}
        <div className="mt-4 inline-block rounded-lg border border-zinc-700/40 bg-zinc-900/60 px-4 py-3 text-left">
          <p className="mb-2 text-xs font-semibold text-zinc-400">
            Fix: set your RPC URL in <code className="text-zinc-300">.env.local</code>
          </p>
          <code className="block text-xs text-emerald-400">{envVar}=https://your-rpc-url</code>
          <p className="mt-2 text-xs text-zinc-600">
            Free options: PublicNode · Alchemy · Infura · QuickNode
          </p>
        </div>
      </div>
    );
  }

  if (pairs.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-700/40 bg-zinc-900/30 py-16 text-center">
        <p className="text-sm text-zinc-500">No valid pairs found on {network.shortName}.</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .registry-row {
          transition: background 150ms ease;
        }
        .registry-row:hover {
          background: rgba(255, 255, 255, 0.02) !important;
        }
        .chip-live {
          transition: border-color 150ms ease, background 150ms ease, transform 150ms ease;
        }
        .chip-live:hover {
          border-color: rgba(255, 210, 8, 0.55) !important;
          background: rgba(255, 210, 8, 0.14) !important;
          transform: translateY(-1px);
        }
      `}</style>
      <div className="w-full min-w-0">
        <p className="mb-1.5 text-right text-xs text-zinc-700 sm:hidden">
          ← Scroll horizontally to view all columns →
        </p>
        <div className="w-full max-w-full overflow-x-auto rounded-xl border border-zinc-700/40">
          <table className="w-full min-w-[860px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-zinc-700/40 bg-zinc-900/60">
                {["#", "ERC-20 Token", "ERC-20 Address", "Confidential Token", "ERC-7984 Address", "Decimals", "Rate", "Status"].map(
                  (col) => (
                    <th
                      key={col}
                      className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-widest text-zinc-600"
                    >
                      {col}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {pairs.map((pair) => {
                const isSelected = pair.confidentialTokenAddress === selectedPairKey;
                return (
                  <Fragment key={pair.confidentialTokenAddress}>
                    {/* ── Data row ── */}
                    <tr
                      className="registry-row border-t border-zinc-800/40"
                      style={isSelected
                        ? { background: "rgba(255,210,8,0.04)", borderLeft: "2px solid rgba(255,210,8,0.30)" }
                        : { background: "transparent" }}
                    >
                      <td className="px-4 py-4 text-zinc-600 tabular-nums">{pair.index + 1}</td>

                      <td className="px-4 py-4">
                        {pair.token ? (
                          <div>
                            <span className="font-semibold text-white">{pair.token.symbol}</span>
                            <span className="ml-2 text-xs text-zinc-500">{pair.token.name}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-600 italic">Loading…</span>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <AddressCell
                          address={pair.tokenAddress}
                          explorerUrl={explorerAddressUrl(network.explorerBaseUrl, pair.tokenAddress)}
                        />
                      </td>

                      <td className="px-4 py-4">
                        {pair.confidentialToken ? (
                          <div>
                            <span className="font-semibold" style={{ color: "#FFD208" }}>{pair.confidentialToken.symbol}</span>
                            <span className="ml-2 text-xs text-zinc-500">{pair.confidentialToken.name}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-600 italic">Loading…</span>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <AddressCell
                          address={pair.confidentialTokenAddress}
                          explorerUrl={explorerAddressUrl(network.explorerBaseUrl, pair.confidentialTokenAddress)}
                        />
                      </td>

                      <td className="px-4 py-4 tabular-nums text-zinc-300">
                        {pair.token?.decimals ?? "—"}
                      </td>

                      <td className="px-4 py-4 tabular-nums text-zinc-300">
                        {pair.rate != null ? pair.rate.toString() : <span className="text-zinc-600">—</span>}
                      </td>

                      <td className="px-4 py-4">
                        <Badge variant="success">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          Valid
                        </Badge>
                      </td>
                    </tr>

                    {/* ── Action chips sub-row — always visible under the pair ── */}
                    <tr
                      style={isSelected
                        ? { background: "rgba(255,210,8,0.025)", borderLeft: "2px solid rgba(255,210,8,0.30)" }
                        : { background: "rgba(255,255,255,0.01)" }}
                    >
                      <td
                        colSpan={COL_COUNT}
                        className="px-4 pb-3 pt-1"
                      >
                        <ActionChips
                          pair={pair}
                          isSepolia={isSepolia}
                          onOpenActions={onOpenActions}
                        />
                      </td>
                    </tr>

                    {/* ── Inline expansion: TokenActionPanel ── */}
                    {isSelected && (
                      <tr>
                        <td
                          colSpan={COL_COUNT}
                          className="p-0"
                          style={{ background: "rgba(255,210,8,0.02)", borderTop: "1px solid rgba(255,210,8,0.10)" }}
                        >
                          <div className="px-2 py-3 sm:px-4">
                            <TokenActionPanel
                              key={`${pair.confidentialTokenAddress}-${expandedTab}`}
                              pair={pair}
                              initialTab={expandedTab}
                              onClose={onClosePanel}
                            />
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
