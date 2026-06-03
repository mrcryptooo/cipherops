"use client";
/**
 * ClaimVestingForm — Step 11C
 *
 * Flow:
 *  1. useRecipientVestings({ address: managerAddress, recipient: walletAddress })
 *     → auto-discovers all vestingIds for connected wallet on this manager
 *  2. useManagerFeeInfo({ address: managerAddress })
 *     → { feeType: FeeType.Gas | FeeType.DistributionToken, fee: bigint }
 *  3. useVestingClaim({ address: managerAddress }).mutate(ClaimArgs)
 *     → ClaimArgs discriminated by feeType:
 *       FeeType.Gas: { vestingId, feeType: FeeType.Gas, value: fee }
 *       FeeType.DistributionToken: { vestingId, feeType: FeeType.DistributionToken }
 *     → returns TxHash
 *
 * SDK sources: @tokenops/sdk/fhe-vesting/react + @tokenops/sdk/fhe-vesting (FeeType enum)
 */

import { useState } from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { isAddress } from "viem";
import type { Address, Hex } from "viem";
import { sepolia } from "wagmi/chains";
import {
  useRecipientVestings,
  useManagerFeeInfo,
  useClaim,
} from "@tokenops/sdk/fhe-vesting/react";
import { FeeType } from "@tokenops/sdk/fhe-vesting";
import { Spinner } from "@/components/ui/Spinner";

// ─── Brand ────────────────────────────────────────────────────────────────────
const Y       = "#FFD208";
const CARD    = "rgba(255,255,255,0.025)";
const BORDER  = "rgba(255,255,255,0.07)";
const YBORDER = "rgba(255,210,8,0.22)";
const YDIM    = "rgba(255,210,8,0.08)";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Card({ children, yellow, success }: { children: React.ReactNode; yellow?: boolean; success?: boolean }) {
  const bg  = success ? "rgba(34,197,94,0.06)"  : yellow ? YDIM  : CARD;
  const bd  = success ? "rgba(34,197,94,0.22)"  : yellow ? YBORDER : BORDER;
  const top = success ? "2px solid rgba(34,197,94,0.35)" : yellow ? "2px solid rgba(255,210,8,0.40)" : undefined;
  return <div className="rounded-xl p-5" style={{ background: bg, border: `1px solid ${bd}`, borderTop: top }}>{children}</div>;
}
function Label({ children }: { children: React.ReactNode }) {
  return <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest" style={{ color: "#888", letterSpacing: "0.12em" }}>{children}</p>;
}
function ZInput({ value, onChange, placeholder, monospace, disabled }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
  monospace?: boolean; disabled?: boolean;
}) {
  return (
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
      className={`w-full rounded-lg border bg-transparent px-3 py-2 text-sm text-white placeholder-zinc-700 focus:outline-none disabled:opacity-40 ${monospace ? "font-mono" : ""}`}
      style={{ borderColor: BORDER, background: "rgba(0,0,0,0.35)" }}
      onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = YBORDER; }}
      onBlur={e  => { (e.currentTarget as HTMLElement).style.borderColor = BORDER; }}
    />
  );
}
function YButton({ onClick, disabled, loading, children, variant = "primary" }: {
  onClick?: () => void; disabled?: boolean; loading?: boolean;
  children: React.ReactNode; variant?: "primary" | "ghost";
}) {
  const base = "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-opacity disabled:opacity-40 disabled:cursor-not-allowed";
  if (variant === "ghost") return <button onClick={onClick} disabled={disabled || loading} className={base} style={{ background: YDIM, border: `1px solid ${YBORDER}`, color: Y }}>{loading && <Spinner size={14} />}{children}</button>;
  return <button onClick={onClick} disabled={disabled || loading} className={base} style={{ background: Y, color: "#000" }}>{loading && <Spinner size={14} />}{children}</button>;
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ClaimVestingForm() {
  const { address: walletAddress, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const isSepolia = chainId === sepolia.id;

  // Form state — prefill with confirmed QA values
  const [managerAddress, setManagerAddress] = useState("0xD3B4b66733E1F1Df883581e08f80CcedAF0B5ccE");
  const [manualVestingId, setManualVestingId] = useState("0x0000000000000000000000000000000000000000000000000000000000000000");
  const [selectedId, setSelectedId] = useState<Hex | null>(null);
  const [successTx, setSuccessTx] = useState<string | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);

  const validManager = isAddress(managerAddress) ? (managerAddress as Address) : undefined;

  // ── SDK hooks — all called unconditionally with safe fallbacks ────────────
  const ZERO_ADDR = "0x0000000000000000000000000000000000000000" as Address;
  const mgr = validManager ?? ZERO_ADDR;

  // 1. Discover vestingIds for connected wallet
  const {
    data: vestingIds,
    isLoading: vestingsLoading,
    error: vestingsError,
    refetch: refetchVestings,
  } = useRecipientVestings({
    address: mgr,
    recipient: walletAddress ?? ZERO_ADDR,
    chainId: sepolia.id,
  });

  // 2. Read fee configuration (immutable per manager)
  const {
    data: feeInfo,
    isLoading: feeLoading,
  } = useManagerFeeInfo({ address: mgr, chainId: sepolia.id });

  // 3. Claim hook — address always provided
  const claimMutation = useClaim({ address: mgr, chainId: sepolia.id });

  // Effective vestingId: selected from discovered list, or manual fallback
  const effectiveVestingId: Hex | null =
    selectedId ?? (
      vestingIds && vestingIds.length > 0 ? vestingIds[0] : null
    ) ?? (
      isAddress(manualVestingId) === false && manualVestingId.startsWith("0x") && manualVestingId.length === 66
        ? (manualVestingId as Hex)
        : null
    );

  const canClaim = !!validManager && !!effectiveVestingId && !!feeInfo && isConnected && isSepolia && !claimMutation.isPending;

  const handleClaim = () => {
    if (!effectiveVestingId || !feeInfo) return;
    setClaimError(null);
    setSuccessTx(null);

    const args = feeInfo.feeType === FeeType.Gas
      ? { vestingId: effectiveVestingId, feeType: FeeType.Gas as const, value: feeInfo.fee }
      : { vestingId: effectiveVestingId, feeType: FeeType.DistributionToken as const };

    claimMutation.mutate(args, {
      onSuccess: (txHash: string) => setSuccessTx(txHash),
      onError: (e: unknown) => setClaimError(e instanceof Error ? e.message.slice(0, 300) : String(e)),
    });
  };

  const handleReset = () => {
    claimMutation.reset();
    setSuccessTx(null);
    setClaimError(null);
    setSelectedId(null);
  };

  // ── Guards ────────────────────────────────────────────────────────────────
  if (!isConnected) return <Card><p className="text-center text-sm" style={{ color: "#888" }}>Connect your wallet to claim vested tokens.</p></Card>;
  if (!isSepolia) return (
    <Card>
      <p className="mb-3 text-center text-sm" style={{ color: "#888" }}>Sepolia required.</p>
      <div className="flex justify-center"><YButton onClick={() => switchChain({ chainId: sepolia.id })}>Switch to Sepolia</YButton></div>
    </Card>
  );

  // ── Success ───────────────────────────────────────────────────────────────
  if (successTx) {
    return (
      <div className="space-y-4">
        <Card success>
          <div className="mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <p className="text-sm font-bold text-emerald-400">Vesting claim confirmed</p>
          </div>
          <p className="text-sm text-white">Your vested confidential tokens have been claimed.</p>
          <p className="mt-1 text-xs" style={{ color: "#aaa" }}>
            The claimed amount is FHE-encrypted on-chain. Reveal it in the Registry using Private Reveal.
          </p>
          <dl className="mt-3 space-y-1.5">
            {[
              ["Tx hash",   successTx],
              ["Manager",   managerAddress],
              ["Vesting ID", effectiveVestingId ?? "—"],
            ].map(([k, v]) => (
              <div key={k} className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
                <dt className="w-24 flex-shrink-0 text-xs" style={{ color: "#555" }}>{k}</dt>
                <dd className="min-w-0 break-all font-mono text-xs text-white">{v}</dd>
              </div>
            ))}
          </dl>
          <a href={`https://sepolia.etherscan.io/tx/${successTx}`}
            target="_blank" rel="noopener noreferrer"
            className="mt-4 block text-xs hover:opacity-80" style={{ color: Y }}>
            View tx on Sepolia Etherscan →
          </a>
        </Card>

        <div className="flex flex-wrap gap-3">
          <a href="/registry"
            className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold transition-opacity hover:opacity-90"
            style={{ background: Y, color: "#000" }}>
            Open Registry → Private Reveal
          </a>
          <button onClick={handleReset} className="text-xs hover:opacity-70" style={{ color: "#666" }}>
            Claim another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* Manager address */}
      <Card>
        <Label>Vesting Manager Address</Label>
        <ZInput value={managerAddress} onChange={setManagerAddress}
          placeholder="0x… manager clone address" monospace />
        {managerAddress && !isAddress(managerAddress) && <p className="mt-1 text-xs text-red-400">Not a valid address</p>}
      </Card>

      {/* Connected wallet */}
      <div className="flex flex-wrap items-center gap-4 rounded-lg px-3 py-2.5"
        style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${BORDER}` }}>
        <div>
          <p className="text-xs" style={{ color: "#555" }}>Connected wallet (recipient)</p>
          <p className="font-mono text-xs text-white">{walletAddress}</p>
        </div>
        <button onClick={() => void refetchVestings()} className="text-xs hover:opacity-80" style={{ color: Y }}>
          ↻ Refresh
        </button>
      </div>

      {/* Discovered vestingIds */}
      <Card>
        <div className="mb-2 flex items-center justify-between gap-2">
          <Label>Vesting Schedules</Label>
          {vestingsLoading && <Spinner size={12} />}
        </div>

        {vestingsError ? (
          <p className="text-xs text-red-400">Error: {vestingsError.message.slice(0, 100)}</p>
        ) : !validManager ? (
          <p className="text-xs" style={{ color: "#555" }}>Enter a valid manager address above.</p>
        ) : vestingsLoading ? (
          <p className="text-xs" style={{ color: "#888" }}>Discovering schedules…</p>
        ) : vestingIds && vestingIds.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs" style={{ color: "#aaa" }}>
              {vestingIds.length} schedule{vestingIds.length !== 1 ? "s" : ""} found
            </p>
            {vestingIds.map((id) => (
              <button key={id} onClick={() => setSelectedId(id as Hex)}
                className="w-full rounded-lg border px-3 py-2 text-left transition-all"
                style={{
                  borderColor: (selectedId ?? vestingIds[0]) === id ? YBORDER : BORDER,
                  background: (selectedId ?? vestingIds[0]) === id ? YDIM : "rgba(255,255,255,0.02)",
                }}>
                <p className="font-mono text-xs" style={{ color: Y }}>
                  {(id as string).slice(0, 12)}…{(id as string).slice(-8)}
                </p>
                <p className="mt-0.5 text-xs" style={{ color: "#555" }}>Click to select</p>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs" style={{ color: "#555" }}>
              No schedules discovered for this wallet. If your schedule was just created, wait a few seconds and refresh.
            </p>
            {/* Manual vestingId fallback */}
            <div>
              <Label>Manual Vesting ID fallback</Label>
              <ZInput value={manualVestingId} onChange={setManualVestingId}
                placeholder="0x0000…0000 (66 chars)" monospace />
              {manualVestingId && (manualVestingId.length !== 66 || !manualVestingId.startsWith("0x")) && (
                <p className="mt-1 text-xs text-red-400">Must be 0x-prefixed 64-char hex (66 total)</p>
              )}
            </div>
          </div>
        )}

        {/* Manual fallback always shown when validIds exist too, for edge cases */}
        {vestingIds && vestingIds.length > 0 && (
          <div className="mt-3 border-t pt-3" style={{ borderColor: BORDER }}>
            <Label>Or enter Vesting ID manually</Label>
            <ZInput value={manualVestingId} onChange={(v) => { setManualVestingId(v); setSelectedId(v as Hex); }}
              placeholder="0x0000…0000" monospace />
          </div>
        )}
      </Card>

      {/* Fee info */}
      {validManager && (
        <Card>
          <Label>Fee Information</Label>
          {feeLoading ? (
            <div className="flex items-center gap-2"><Spinner size={12} /><span className="text-xs" style={{ color: "#888" }}>Loading fee config…</span></div>
          ) : feeInfo ? (
            <div className="flex flex-wrap gap-6">
              <div>
                <p className="text-xs" style={{ color: "#555" }}>Fee type</p>
                <p className="text-sm font-semibold text-white">
                  {feeInfo.feeType === FeeType.Gas ? "Gas (ETH)" : "Distribution Token (BPS)"}
                </p>
              </div>
              <div>
                <p className="text-xs" style={{ color: "#555" }}>Fee amount</p>
                <p className="text-sm font-semibold text-white">
                  {feeInfo.fee.toString()}{" "}
                  <span className="text-xs" style={{ color: "#555" }}>
                    {feeInfo.feeType === FeeType.Gas ? "wei" : "bps"}
                  </span>
                </p>
              </div>
              {feeInfo.feeType === FeeType.Gas && feeInfo.fee > 0n && (
                <p className="w-full text-xs" style={{ color: "#666" }}>
                  Native ETH will be attached automatically as msg.value.
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs" style={{ color: "#555" }}>Unable to read fee info.</p>
          )}
        </Card>
      )}

      {/* Selected vestingId summary */}
      {effectiveVestingId && (
        <div className="rounded-lg px-3 py-2.5" style={{ background: YDIM, border: `1px solid ${YBORDER}` }}>
          <p className="text-xs font-semibold" style={{ color: Y }}>Selected vestingId</p>
          <p className="mt-0.5 font-mono text-xs text-white">{effectiveVestingId}</p>
        </div>
      )}

      {/* Error */}
      {claimError && (
        <div className="rounded-xl px-4 py-3" style={{ background: "rgba(255,100,100,0.06)", border: "1px solid rgba(255,100,100,0.18)" }}>
          <p className="text-xs font-semibold text-red-400">Error</p>
          <p className="mt-1 text-xs text-red-400/70">{claimError}</p>
          <button onClick={handleReset} className="mt-1.5 text-xs hover:opacity-70" style={{ color: "#666" }}>Reset</button>
        </div>
      )}

      {/* Claim button */}
      <YButton onClick={handleClaim} disabled={!canClaim} loading={claimMutation.isPending}>
        {claimMutation.isPending ? "Confirming claim…" : "Claim Vested Tokens"}
      </YButton>

      {!canClaim && !claimMutation.isPending && (
        <p className="text-xs" style={{ color: "#555" }}>
          {!validManager ? "Enter a valid manager address." :
           !effectiveVestingId ? "No vestingId selected." :
           !feeInfo ? "Waiting for fee info…" :
           "Ready."}
        </p>
      )}

      {/* Info */}
      <Card>
        <Label>How Recipient Claim works</Label>
        <ul className="space-y-1.5">
          {[
            "useRecipientVestings auto-discovers all schedule IDs for connected wallet on this manager",
            "useManagerFeeInfo reads the fee type (Gas/DistributionToken) baked into the manager clone",
            "FeeType.Gas: ETH is attached as msg.value; FeeType.DistributionToken: fee deducted from token",
            "Claimed tokens are FHE-encrypted — use Registry → Private Reveal to see the balance",
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-xs" style={{ color: "#555" }}>
              <span style={{ color: Y, flexShrink: 0 }}>·</span>{item}
            </li>
          ))}
        </ul>
      </Card>

    </div>
  );
}
