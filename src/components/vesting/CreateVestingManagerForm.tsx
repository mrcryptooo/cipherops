"use client";
/**
 * CreateVestingManagerForm — Step 11A
 *
 * Deploys a ConfidentialVestingManager clone from the factory using:
 *   useCreateManagerAndGetAddress({ options? })
 *     .mutate({ token: Address, userSalt: Hex, splitEnabled?, pausableEnabled? })
 *   → returns { hash: TxHash, manager: Address }
 *
 * Factory address auto-resolved from chain id (Sepolia: 0xA87701CE9A52D43681600583a99c85b50DbE3150).
 * No encryptor needed at this step.
 * Source: @tokenops/sdk/fhe-vesting/react (useCreateManagerAndGetAddress)
 */

import { useState, useCallback } from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { isAddress, keccak256, toBytes } from "viem";
import type { Address, Hex } from "viem";
import { sepolia } from "wagmi/chains";
import { useCreateManagerAndGetAddress } from "@tokenops/sdk/fhe-vesting/react";
import { Spinner } from "@/components/ui/Spinner";

// ─── Brand ────────────────────────────────────────────────────────────────────
const Y      = "#FFD208";
const CARD   = "rgba(255,255,255,0.025)";
const BORDER = "rgba(255,255,255,0.07)";
const YBORDER = "rgba(255,210,8,0.22)";
const YDIM   = "rgba(255,210,8,0.08)";

const SEPOLIA_FACTORY = "0xA87701CE9A52D43681600583a99c85b50DbE3150";

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
function YButton({ onClick, disabled, loading, children }: {
  onClick?: () => void; disabled?: boolean; loading?: boolean; children: React.ReactNode;
}) {
  return (
    <button onClick={onClick} disabled={disabled || loading}
      className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
      style={{ background: Y, color: "#000" }}>
      {loading && <Spinner size={14} />}{children}
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function CreateVestingManagerForm() {
  const { address: walletAddress, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const isSepolia = chainId === sepolia.id;

  // Form state
  const [tokenAddress, setTokenAddress] = useState("");
  const [managerLabel, setManagerLabel] = useState("");
  const [splitEnabled, setSplitEnabled] = useState(true);
  const [pausableEnabled, setPausableEnabled] = useState(true);

  // SDK hook — factory address auto-resolved from chain id
  const createMutation = useCreateManagerAndGetAddress();

  const validToken = isAddress(tokenAddress) ? (tokenAddress as Address) : undefined;

  // Derive a deterministic userSalt from label + wallet (or random fallback)
  const userSalt: Hex = (() => {
    const seed = `${walletAddress ?? "0x"}:${managerLabel || "default"}:${Date.now()}`;
    try { return keccak256(toBytes(seed)); }
    catch { return "0x0000000000000000000000000000000000000000000000000000000000000001"; }
  })();

  const canCreate = !!validToken && isConnected && isSepolia && !createMutation.isPending;

  const handleCreate = useCallback(() => {
    if (!validToken) return;
    createMutation.mutate(
      { token: validToken, userSalt, splitEnabled, pausableEnabled },
      {
        onSuccess: () => {},  // handled via createMutation.data
        onError: () => {},    // handled via createMutation.error
      }
    );
  }, [validToken, userSalt, splitEnabled, pausableEnabled, createMutation]);

  const handleReset = useCallback(() => {
    createMutation.reset();
    setTokenAddress("");
    setManagerLabel("");
  }, [createMutation]);

  // ── Guards ────────────────────────────────────────────────────────────────

  if (!isConnected) return (
    <Card><p className="text-center text-sm" style={{ color: "#888" }}>Connect your wallet to create a vesting manager.</p></Card>
  );
  if (!isSepolia) return (
    <Card>
      <p className="mb-3 text-center text-sm" style={{ color: "#888" }}>Sepolia required for vesting manager creation.</p>
      <div className="flex justify-center"><YButton onClick={() => switchChain({ chainId: sepolia.id })}>Switch to Sepolia</YButton></div>
    </Card>
  );

  // ── Success ───────────────────────────────────────────────────────────────

  if (createMutation.isSuccess && createMutation.data) {
    const { hash, manager } = createMutation.data;
    return (
      <div className="space-y-4">
        <Card success>
          <div className="mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <p className="text-sm font-bold text-emerald-400">Vesting Manager deployed</p>
          </div>

          <dl className="space-y-2">
            {[
              ["Manager address", manager],
              ["Tx hash", hash],
              ["Network", "Ethereum Sepolia"],
              ["Factory", SEPOLIA_FACTORY],
              ["Token", tokenAddress],
              ["Label", managerLabel || "—"],
            ].map(([k, v]) => (
              <div key={k} className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
                <dt className="w-full text-xs sm:w-28 flex-shrink-0" style={{ color: "#555" }}>{k}</dt>
                <dd className="min-w-0 break-all font-mono text-xs text-white">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-4 flex flex-wrap gap-3">
            <a href={`https://sepolia.etherscan.io/address/${manager}`}
              target="_blank" rel="noopener noreferrer"
              className="text-xs hover:opacity-80" style={{ color: Y }}>
              View Manager on Etherscan →
            </a>
            <a href={`https://sepolia.etherscan.io/tx/${hash}`}
              target="_blank" rel="noopener noreferrer"
              className="text-xs hover:opacity-80" style={{ color: "#888" }}>
              View tx →
            </a>
          </div>
        </Card>

        <Card yellow>
          <p className="text-sm font-bold text-white">Next step: Create Vesting Schedules</p>
          <p className="mt-1.5 text-xs leading-relaxed" style={{ color: "#aaa" }}>
            Copy the manager address above, then use the{" "}
            <strong style={{ color: Y }}>2 · Create Schedules</strong> tab to add per-recipient vesting schedules with encrypted amounts.
          </p>
          <p className="mt-2 text-xs" style={{ color: "#555" }}>
            Manager: <span className="font-mono">{manager.slice(0, 12)}…{manager.slice(-8)}</span>
          </p>
        </Card>

        <button onClick={handleReset} className="text-xs hover:opacity-70" style={{ color: "#666" }}>
          Create another manager
        </button>
      </div>
    );
  }

  // ── Main form ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">

      {/* Factory info */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <Label>Vesting Factory</Label>
            <p className="font-mono text-xs" style={{ color: "#aaa" }}>{SEPOLIA_FACTORY}</p>
            <p className="mt-0.5 text-xs" style={{ color: "#555" }}>
              Auto-resolved from chain id 11155111 — no override needed.
            </p>
          </div>
          <span className="rounded-full px-3 py-1 text-xs font-semibold"
            style={{ background: YDIM, border: `1px solid ${YBORDER}`, color: Y }}>
            Sepolia
          </span>
        </div>
      </Card>

      {/* Token address */}
      <Card>
        <Label>ERC-7984 Confidential Token Address</Label>
        <ZInput value={tokenAddress} onChange={setTokenAddress}
          placeholder="0x… (copy from Registry Explorer)" monospace />
        {tokenAddress && !isAddress(tokenAddress) && (
          <p className="mt-1 text-xs text-red-400">Not a valid address</p>
        )}
        <p className="mt-2 text-xs" style={{ color: "#555" }}>
          The manager will be bound to this token. All vesting schedules created via this manager will use it.
        </p>
      </Card>

      {/* Optional label */}
      <Card>
        <Label>Manager Label (local only)</Label>
        <ZInput value={managerLabel} onChange={setManagerLabel}
          placeholder="e.g. Team Vesting Q3 2026" />
        <p className="mt-1 text-xs" style={{ color: "#555" }}>
          Used as part of the CREATE3 salt. Different labels → different manager addresses for the same wallet + token.
        </p>
      </Card>

      {/* Options */}
      <Card>
        <Label>Manager Options</Label>
        <div className="space-y-2">
          {[
            { key: "split",    label: "Split vesting enabled",   value: splitEnabled,   set: setSplitEnabled },
            { key: "pausable", label: "Pause/unpause enabled",   value: pausableEnabled, set: setPausableEnabled },
          ].map(opt => (
            <label key={opt.key} className="flex cursor-pointer items-center gap-3">
              <div
                className="h-5 w-9 rounded-full transition-colors relative"
                style={{ background: opt.value ? Y : "#2d2d2d", cursor: "pointer" }}
                onClick={() => opt.set(!opt.value)}
              >
                <div className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform"
                  style={{ transform: opt.value ? "translateX(20px)" : "translateX(2px)" }} />
              </div>
              <span className="text-sm" style={{ color: opt.value ? "#ddd" : "#555" }}>{opt.label}</span>
            </label>
          ))}
        </div>
        <p className="mt-2 text-xs" style={{ color: "#444" }}>
          These are immutable at deployment. Defaults are recommended.
        </p>
      </Card>

      {/* Connected wallet */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg px-3 py-2.5"
        style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${BORDER}` }}>
        <div>
          <p className="text-xs" style={{ color: "#555" }}>Admin wallet (connected)</p>
          <p className="font-mono text-xs text-white">{walletAddress}</p>
        </div>
        <div>
          <p className="text-xs" style={{ color: "#555" }}>Chain</p>
          <p className="text-xs text-white">Sepolia · {chainId}</p>
        </div>
      </div>

      {/* Error */}
      {createMutation.isError && (
        <div className="rounded-xl px-4 py-3"
          style={{ background: "rgba(255,100,100,0.06)", border: "1px solid rgba(255,100,100,0.18)" }}>
          <p className="text-xs font-semibold text-red-400">Error</p>
          <p className="mt-1 text-xs text-red-400/70">
            {createMutation.error instanceof Error
              ? createMutation.error.message.slice(0, 300)
              : String(createMutation.error)}
          </p>
          <button onClick={() => createMutation.reset()}
            className="mt-1.5 text-xs hover:opacity-70" style={{ color: "#666" }}>
            Dismiss
          </button>
        </div>
      )}

      {/* Submit */}
      <div className="flex items-center gap-3">
        <YButton onClick={handleCreate} disabled={!canCreate} loading={createMutation.isPending}>
          {createMutation.isPending ? "Deploying manager…" : "Deploy Vesting Manager"}
        </YButton>
        {createMutation.isPending && (
          <p className="text-xs" style={{ color: "#888" }}>Confirm in wallet, then waiting for confirmation…</p>
        )}
      </div>

      {/* Info */}
      <Card>
        <Label>What this creates</Label>
        <ul className="space-y-1.5">
          {[
            "Deploys a ConfidentialVestingManager clone via the TokenOps factory on Sepolia",
            "The manager is bound to a single ERC-7984 token and admin wallet",
            "After creation, approve the manager as ERC-7984 operator before creating schedules",
            "Powered by @tokenops/sdk/fhe-vesting — useCreateManagerAndGetAddress",
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
