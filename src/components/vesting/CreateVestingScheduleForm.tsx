"use client";
/**
 * CreateVestingScheduleForm — Step 11B
 *
 * Flow:
 *  1. setOperator(managerAddress, deadline) on the ERC-7984 token
 *     → same erc7984OperatorAbi pattern used by Disperse/Airdrop, but operator = manager clone
 *  2. useCreateVesting({ address: managerAddress, encryptor: encryptorFactory }).mutate({
 *       params: VestingParams,  amount: bigint
 *     })
 *     → SDK encrypts amount via encryptor
 *     → returns Hex (tx hash); vestingId parsed from VestingCreated event in receipt
 *
 * SDK sources:
 *   - useCreateVesting: @tokenops/sdk/fhe-vesting/react
 *   - confidentialVestingManagerAbi: @tokenops/sdk/fhe-vesting
 *   - erc7984OperatorAbi, ERC7984_OPERATOR_MAX_DEADLINE: @tokenops/sdk/fhe-vesting
 */

import { useState, useCallback, useEffect } from "react";
import { useAccount, useChainId, useSwitchChain, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { isAddress, parseUnits, decodeEventLog } from "viem";
import type { Address, Hex } from "viem";
import { sepolia } from "wagmi/chains";
import { useCreateVesting } from "@tokenops/sdk/fhe-vesting/react";
import {
  confidentialVestingManagerAbi,
  erc7984OperatorAbi,
} from "@tokenops/sdk/fhe-vesting";
// ERC7984_OPERATOR_MAX_DEADLINE is exported from fhe-disperse (not fhe-vesting)
import { ERC7984_OPERATOR_MAX_DEADLINE } from "@tokenops/sdk/fhe-disperse";
import { useTokenOpsEncryptor } from "@/hooks/useTokenOpsEncryptor";
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
function ZInput({ value, onChange, placeholder, monospace, disabled, type = "text" }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
  monospace?: boolean; disabled?: boolean; type?: string;
}) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
      className={`w-full rounded-lg border bg-transparent px-3 py-2 text-sm text-white placeholder-zinc-700 focus:outline-none disabled:opacity-40 ${monospace ? "font-mono" : ""}`}
      style={{ borderColor: BORDER, background: "rgba(0,0,0,0.35)" }}
      onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = YBORDER; }}
      onBlur={e  => { (e.currentTarget as HTMLElement).style.borderColor = BORDER; }}
    />
  );
}
function YButton({ onClick, disabled, loading, children, variant = "primary" }: {
  onClick?: () => void; disabled?: boolean; loading?: boolean; children: React.ReactNode; variant?: "primary" | "ghost";
}) {
  const base = "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-opacity disabled:opacity-40 disabled:cursor-not-allowed";
  if (variant === "ghost") return <button onClick={onClick} disabled={disabled || loading} className={base} style={{ background: YDIM, border: `1px solid ${YBORDER}`, color: Y }}>{loading && <Spinner size={14} />}{children}</button>;
  return <button onClick={onClick} disabled={disabled || loading} className={base} style={{ background: Y, color: "#000" }}>{loading && <Spinner size={14} />}{children}</button>;
}

// ─── Main component ───────────────────────────────────────────────────────────

export function CreateVestingScheduleForm() {
  const { address: walletAddress, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const isSepolia = chainId === sepolia.id;

  // Form defaults using confirmed QA manager + token
  const [managerAddress, setManagerAddress]   = useState("0xD3B4b66733E1F1Df883581e08f80CcedAF0B5ccE");
  const [tokenAddress, setTokenAddress]       = useState("0x7c5BF43B851c1dff1a4feE8dB225b87f2C223639");
  const [decimals, setDecimals]               = useState("18");
  const [recipient, setRecipient]             = useState("");
  const [amount, setAmount]                   = useState("1");
  const [startOffsetSec, setStartOffsetSec]   = useState("60");      // 1 min from now
  const [durationSec, setDurationSec]         = useState("300");     // 5 min vesting
  const [cliffSec, setCliffSec]               = useState("0");
  const [intervalSec, setIntervalSec]         = useState("60");      // 1 min release interval
  const [isRevocable, setIsRevocable]         = useState(false);
  const [label, setLabel]                     = useState("");

  // Fill recipient from wallet on mount
  useEffect(() => {
    if (walletAddress && !recipient) setRecipient(walletAddress);
  }, [walletAddress, recipient]);

  // FHE encryptor (same hook as Disperse/Airdrop)
  const { encryptorFactory, isReady: encReady, isLoading: encLoading, statusLabel: encStatus } = useTokenOpsEncryptor();

  // setOperator (operator = managerAddress, token = selected ERC-7984 token)
  const {
    writeContract: writeSetOperator,
    data: opTxHash,
    isPending: opSigning,
    error: opWriteError,
    reset: resetOp,
  } = useWriteContract();
  const { isLoading: opConfirming, isSuccess: opSuccess, error: opReceiptError } = useWaitForTransactionReceipt({ hash: opTxHash });

  // vestingId result state (parsed from receipt)
  const [vestingTxHash, setVestingTxHash]   = useState<Hex | null>(null);
  const [vestingId, setVestingId]           = useState<Hex | null>(null);
  const [createError, setCreateError]       = useState<string | null>(null);

  // useCreateVesting — address = managerAddress, encryptor = lazy factory
  const validManager = isAddress(managerAddress) ? (managerAddress as Address) : undefined;
  const createVesting = useCreateVesting(
    validManager
      ? { address: validManager, encryptor: encryptorFactory }
      : { address: "0x0000000000000000000000000000000000000000" as Address, encryptor: encryptorFactory }
  );

  // Watch receipt to extract vestingId
  const { data: vestingReceipt } = useWaitForTransactionReceipt({
    hash: vestingTxHash ?? undefined,
  });

  useEffect(() => {
    if (!vestingReceipt || vestingId) return;
    for (const log of vestingReceipt.logs) {
      if (!validManager || log.address.toLowerCase() !== validManager.toLowerCase()) continue;
      try {
        const decoded = decodeEventLog({
          abi: confidentialVestingManagerAbi,
          data: log.data,
          topics: log.topics as [`0x${string}`, ...`0x${string}`[]],
          eventName: "VestingCreated",
        });
        const id = (decoded.args as { vestingId: Hex }).vestingId;
        if (id) { setVestingId(id); break; }
      } catch { continue; }
    }
  }, [vestingReceipt, vestingId, validManager]);

  // Derived
  const validToken     = isAddress(tokenAddress) ? (tokenAddress as Address) : undefined;
  const validRecipient = isAddress(recipient) ? (recipient as Address) : undefined;
  const dec = parseInt(decimals || "18", 10);
  const canCreate = !!validManager && !!validToken && !!validRecipient && encReady
    && !!amount && parseFloat(amount) > 0 && !createVesting.isPending;

  // Handlers
  const handleSetOperator = useCallback(() => {
    if (!validToken || !validManager) return;
    writeSetOperator({
      address: validToken,
      abi: erc7984OperatorAbi,
      functionName: "setOperator",
      args: [validManager, Number(ERC7984_OPERATOR_MAX_DEADLINE)],
      chainId: sepolia.id,
    });
  }, [validToken, validManager, writeSetOperator]);

  const handleCreate = useCallback(() => {
    if (!validManager || !validToken || !validRecipient) return;
    setCreateError(null);
    setVestingTxHash(null);
    setVestingId(null);

    const now = Math.floor(Date.now() / 1000);
    const start = now + parseInt(startOffsetSec || "60", 10);
    const end   = start + parseInt(durationSec || "300", 10);

    createVesting.mutate(
      {
        params: {
          recipient:           validRecipient,
          startTimestamp:      start,
          endTimestamp:        end,
          cliffSeconds:        parseInt(cliffSec || "0", 10),
          releaseIntervalSecs: parseInt(intervalSec || "60", 10),
          timelockSeconds:     0,
          initialUnlockBps:    0,
          cliffAmountBps:      0,
          isRevocable,
        },
        amount: parseUnits(amount, dec),
      },
      {
        onSuccess: (txHash) => {
          setVestingTxHash(txHash);
        },
        onError: (e) => {
          setCreateError(e instanceof Error ? e.message.slice(0, 300) : String(e));
        },
      }
    );
  }, [validManager, validToken, validRecipient, startOffsetSec, durationSec, cliffSec, intervalSec, isRevocable, amount, dec, createVesting]);

  const handleReset = useCallback(() => {
    createVesting.reset();
    setVestingTxHash(null); setVestingId(null); setCreateError(null);
    resetOp();
  }, [createVesting, resetOp]);

  // ── Guards ────────────────────────────────────────────────────────────────
  if (!isConnected) return <Card><p className="text-center text-sm" style={{ color: "#888" }}>Connect your wallet to create vesting schedules.</p></Card>;
  if (!isSepolia) return (
    <Card>
      <p className="mb-3 text-center text-sm" style={{ color: "#888" }}>Sepolia required.</p>
      <div className="flex justify-center"><YButton onClick={() => switchChain({ chainId: sepolia.id })}>Switch to Sepolia</YButton></div>
    </Card>
  );

  // ── Success ───────────────────────────────────────────────────────────────
  if (vestingTxHash && (vestingId || vestingReceipt)) {
    return (
      <div className="space-y-4">
        <Card success>
          <div className="mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <p className="text-sm font-bold text-emerald-400">Vesting schedule created</p>
          </div>
          <dl className="space-y-2">
            {[
              ["Manager",    managerAddress],
              ["Recipient",  recipient],
              ["Token",      tokenAddress],
              ["Label",      label || "—"],
              ["Tx hash",    vestingTxHash],
              ["Vesting ID", vestingId ?? (vestingReceipt ? "Parsing…" : "Waiting for receipt…")],
            ].map(([k, v]) => (
              <div key={k} className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
                <dt className="w-28 flex-shrink-0 text-xs" style={{ color: "#555" }}>{k}</dt>
                <dd className="min-w-0 break-all font-mono text-xs text-white">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 flex flex-wrap gap-3">
            <a href={`https://sepolia.etherscan.io/tx/${vestingTxHash}`} target="_blank" rel="noopener noreferrer"
              className="text-xs hover:opacity-80" style={{ color: Y }}>View tx on Etherscan →</a>
          </div>
        </Card>

        {vestingId && (
          <Card yellow>
            <p className="text-sm font-bold text-white">Next: Recipient Claim (Step 11C)</p>
            <p className="mt-1.5 text-xs leading-relaxed" style={{ color: "#aaa" }}>
              Share the Vesting ID with the recipient. They use the{" "}
              <strong style={{ color: Y }}>3 · Recipient Claim</strong> tab to claim their vested tokens as they unlock.
            </p>
            <p className="mt-2 font-mono text-xs" style={{ color: "#666" }}>
              Vesting ID: {vestingId.slice(0,12)}…{vestingId.slice(-8)}
            </p>
          </Card>
        )}

        <button onClick={handleReset} className="text-xs hover:opacity-70" style={{ color: "#666" }}>
          Create another schedule
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* Encryptor status */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Label>FHE Encryptor</Label>
            <p className="text-xs" style={{ color: encReady ? Y : encLoading ? "#888" : "#f87171" }}>
              {encReady ? "Ready — amount will be encrypted before broadcast" : encStatus}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {encLoading && <Spinner size={14} />}
            <span className="h-2 w-2 rounded-full" style={{ background: encReady ? Y : encLoading ? "#888" : "#f87171" }} />
          </div>
        </div>
      </Card>

      {/* Manager address */}
      <Card>
        <Label>Vesting Manager Address</Label>
        <ZInput value={managerAddress} onChange={setManagerAddress}
          placeholder="0x… (from Create Manager step)" monospace />
        {managerAddress && !isAddress(managerAddress) && <p className="mt-1 text-xs text-red-400">Not a valid address</p>}
      </Card>

      {/* Token + decimals */}
      <Card>
        <Label>ERC-7984 Confidential Token Address</Label>
        <ZInput value={tokenAddress} onChange={setTokenAddress}
          placeholder="0x… ERC-7984 token" monospace />
        {tokenAddress && !isAddress(tokenAddress) && <p className="mt-1 text-xs text-red-400">Not a valid address</p>}
        <div className="mt-3 w-28">
          <Label>Decimals</Label>
          <ZInput value={decimals} onChange={setDecimals} placeholder="18" />
        </div>
      </Card>

      {/* Allow Vesting Manager (setOperator) */}
      {validToken && validManager && (
        <Card yellow>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <Label>Allow Vesting Manager</Label>
              <p className="text-sm font-semibold text-white">Operator approval</p>
              <p className="mt-1.5 text-xs leading-relaxed" style={{ color: "#aaa" }}>
                Approve the vesting manager as an ERC-7984 operator so it can transfer tokens to recipients on claim.
                One-time per token per manager.
              </p>
              <p className="mt-2 font-mono text-xs" style={{ color: "#666" }}>
                Operator: {validManager.slice(0,10)}…{validManager.slice(-8)}
              </p>
            </div>
            <YButton onClick={handleSetOperator} loading={opSigning || opConfirming} disabled={opSigning || opConfirming || opSuccess}>
              {opSigning ? "Confirm in wallet…" : opConfirming ? "Confirming…" : opSuccess ? "✓ Approved" : "Allow Manager"}
            </YButton>
          </div>
          {opSuccess && <p className="mt-3 text-xs text-emerald-400">✓ Manager approved as operator.</p>}
          {(opWriteError || opReceiptError) && (
            <div className="mt-3">
              <p className="text-xs text-red-400">{(opWriteError ?? opReceiptError)!.message.slice(0, 180)}</p>
              <button onClick={resetOp} className="mt-1 text-xs hover:opacity-70" style={{ color: Y }}>Reset</button>
            </div>
          )}
        </Card>
      )}

      {/* Recipient */}
      <Card>
        <Label>Recipient Address</Label>
        <ZInput value={recipient} onChange={setRecipient} placeholder="0x… recipient wallet" monospace />
        {recipient && !isAddress(recipient) && <p className="mt-1 text-xs text-red-400">Not a valid address</p>}
        {walletAddress && recipient.toLowerCase() === walletAddress.toLowerCase() && (
          <p className="mt-1 text-xs" style={{ color: "#555" }}>Using connected wallet</p>
        )}
      </Card>

      {/* Amount */}
      <Card>
        <Label>Total Vesting Amount ({tokenAddress ? `token units, ×10^${dec}` : "raw"})</Label>
        <ZInput value={amount} onChange={setAmount} placeholder="1" />
      </Card>

      {/* Schedule params */}
      <Card>
        <Label>Schedule Parameters</Label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            { label: "Start offset (sec from now)", val: startOffsetSec, set: setStartOffsetSec, hint: "60 = 1 min" },
            { label: "Vesting duration (sec)",       val: durationSec,   set: setDurationSec,   hint: "300 = 5 min" },
            { label: "Cliff (sec)",                  val: cliffSec,      set: setCliffSec,      hint: "0 = no cliff" },
            { label: "Release interval (sec)",       val: intervalSec,   set: setIntervalSec,   hint: "60 = every min" },
          ].map(field => (
            <div key={field.label}>
              <p className="mb-1 text-xs" style={{ color: "#666" }}>{field.label}</p>
              <ZInput value={field.val} onChange={field.set} placeholder={field.hint} type="number" />
              <p className="mt-0.5 text-xs" style={{ color: "#444" }}>{field.hint}</p>
            </div>
          ))}
        </div>

        <label className="mt-4 flex cursor-pointer items-center gap-3">
          <div className="h-5 w-9 rounded-full transition-colors relative"
            style={{ background: isRevocable ? Y : "#2d2d2d" }}
            onClick={() => setIsRevocable(!isRevocable)}>
            <div className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform"
              style={{ transform: isRevocable ? "translateX(20px)" : "translateX(2px)" }} />
          </div>
          <span className="text-sm" style={{ color: isRevocable ? "#ddd" : "#555" }}>
            Revocable schedule
          </span>
        </label>
      </Card>

      {/* Optional label */}
      <Card>
        <Label>Schedule Label (local note)</Label>
        <ZInput value={label} onChange={setLabel} placeholder="e.g. Alice Q3 2026" />
      </Card>

      {/* Error */}
      {createError && (
        <div className="rounded-xl px-4 py-3" style={{ background: "rgba(255,100,100,0.06)", border: "1px solid rgba(255,100,100,0.18)" }}>
          <p className="text-xs font-semibold text-red-400">Error</p>
          <p className="mt-1 text-xs text-red-400/70">{createError}</p>
          <button onClick={() => setCreateError(null)} className="mt-1.5 text-xs hover:opacity-70" style={{ color: "#666" }}>Dismiss</button>
        </div>
      )}

      {/* Submit */}
      <div className="flex flex-wrap items-center gap-3">
        <YButton onClick={handleCreate} disabled={!canCreate} loading={createVesting.isPending}>
          {createVesting.isPending ? "Encrypting and creating…" : "Create Vesting Schedule"}
        </YButton>
        {!encReady && <p className="text-xs" style={{ color: "#666" }}>Waiting for FHE encryptor: {encStatus}</p>}
      </div>

      {/* Info */}
      <Card>
        <Label>How Create Schedule works</Label>
        <ul className="space-y-1.5">
          {[
            "Manager must be approved as ERC-7984 operator on the token first",
            "useCreateVesting encrypts the vesting amount locally via the Zama FHE encryptor",
            "VestingCreated event is emitted with a bytes32 vestingId — share with recipient",
            "Recipient calls useVestingClaim({ vestingId }) to claim vested tokens as they unlock",
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
