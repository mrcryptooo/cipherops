"use client";
/**
 * CreateAirdropForm — Step 9A: Create & Fund a Confidential Airdrop Campaign.
 *
 * Uses @tokenops/sdk/fhe-airdrop/react:
 *   useCreateAndFundConfidentialAirdropAndGetAddress
 *   → deploys factory clone + funds it in ONE tx
 *   → returns { hash: TxHash, airdrop: Address } after parsing ConfidentialAirdropCreated event
 *
 * Prerequisites verified in research (TOKENOPS_AIRDROP_RESEARCH.md):
 *   1. setOperator(factoryAddress, deadline) on the ERC-7984 token (same ABI as Disperse)
 *   2. createAndFundConfidentialAirdrop({ params, userSalt, amount, encryptor })
 *
 * Step 9B (claim signing) and 9C (recipient claim) come next.
 */

import { useState, useCallback, useMemo } from "react";
import { useAccount, useChainId, useSwitchChain, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { isAddress, parseUnits, toHex } from "viem";
import type { Address, Hex } from "viem";
import { sepolia } from "wagmi/chains";
import { useCreateAndFundConfidentialAirdropAndGetAddress } from "@tokenops/sdk/fhe-airdrop/react";
import { erc7984OperatorAbi, ERC7984_OPERATOR_MAX_DEADLINE } from "@tokenops/sdk/fhe-disperse";
import { useTokenOpsEncryptor } from "@/hooks/useTokenOpsEncryptor";
import { Spinner } from "@/components/ui/Spinner";

// Sepolia Airdrop Factory — source: @tokenops/sdk DEPLOYED_ADDRESSES
const AIRDROP_FACTORY: Address = "0xbE6A3B78B36684fFee48De77d47Bc3393F5Acd4c";

// ─── Brand ────────────────────────────────────────────────────────────────────
const Y       = "#FFD208";
const CARD    = "rgba(255,255,255,0.025)";
const BORDER  = "rgba(255,255,255,0.07)";
const YBORDER = "rgba(255,210,8,0.22)";
const YDIM    = "rgba(255,210,8,0.08)";

// ─── Tiny helpers ─────────────────────────────────────────────────────────────

function Card({ children, yellow }: { children: React.ReactNode; yellow?: boolean }) {
  return (
    <div className="rounded-xl p-5"
      style={{ background: yellow ? YDIM : CARD, border: `1px solid ${yellow ? YBORDER : BORDER}`, borderTop: yellow ? "2px solid rgba(255,210,8,0.40)" : undefined }}>
      {children}
    </div>
  );
}
function Label({ children }: { children: React.ReactNode }) {
  return <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest" style={{ color: "#888", letterSpacing: "0.12em" }}>{children}</p>;
}
function ZInput({ value, onChange, placeholder, monospace, disabled }: {
  value: string; onChange: (v: string) => void;
  placeholder?: string; monospace?: boolean; disabled?: boolean;
}) {
  return (
    <input value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} disabled={disabled}
      className={`w-full rounded-lg border bg-transparent px-3 py-2 text-sm text-white placeholder-zinc-700 focus:outline-none disabled:opacity-40 ${monospace ? "font-mono" : ""}`}
      style={{ borderColor: BORDER, background: "rgba(0,0,0,0.35)" }}
      onFocus={e => { (e.currentTarget as HTMLInputElement).style.borderColor = YBORDER; }}
      onBlur={e => { (e.currentTarget as HTMLInputElement).style.borderColor = BORDER; }}
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

// ─── Timestamp helpers ────────────────────────────────────────────────────────
// Returns unix timestamp (seconds) from a local datetime-local value
function dateLocalToUnix(val: string): number {
  if (!val) return 0;
  return Math.floor(new Date(val).getTime() / 1000);
}
function unixToDateLocal(ts: number): string {
  if (!ts) return "";
  const d = new Date(ts * 1000);
  return d.toISOString().slice(0, 16);
}
function nowPlusDays(days: number): string {
  return unixToDateLocal(Math.floor(Date.now() / 1000) + days * 86400);
}

// ─── Main component ───────────────────────────────────────────────────────────

export function CreateAirdropForm() {
  const { address: userAddress, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const isSepolia = chainId === sepolia.id;

  // Form state
  const [tokenAddress, setTokenAddress] = useState("");
  const [decimals, setDecimals]         = useState("18");
  const [amount, setAmount]             = useState("");
  const [startAt, setStartAt]           = useState(nowPlusDays(0));   // now
  const [endAt, setEndAt]               = useState(nowPlusDays(7));    // +7 days
  const [canExtend, setCanExtend]       = useState(false);
  const [campaignLabel, setCampaignLabel] = useState("");
  const [campaignResult, setCampaignResult] = useState<{ hash: string; airdrop: string } | null>(null);
  const [submitError, setSubmitError]   = useState<string | null>(null);

  // FHE encryptor (same hook as Disperse)
  const { encryptorFactory, isReady: encReady, isLoading: encLoading, statusLabel: encStatus } = useTokenOpsEncryptor();

  // Derived
  const validToken = isAddress(tokenAddress) ? (tokenAddress as Address) : undefined;
  const dec = parseInt(decimals || "18", 10);
  const amountParsed: bigint | null = useMemo(() => {
    try { return amount && parseFloat(amount) > 0 ? parseUnits(amount, dec) : null; }
    catch { return null; }
  }, [amount, dec]);
  const startTs = dateLocalToUnix(startAt);
  const endTs   = dateLocalToUnix(endAt);
  const paramsValid = !!validToken && !!amountParsed && startTs > 0 && endTs > startTs && !!userAddress;

  // ── setOperator for factory ────────────────────────────────────────────────
  const { writeContract: writeOp, data: opHash, isPending: opSigning, error: opWriteError, reset: resetOp } = useWriteContract();
  const { isLoading: opConfirming, isSuccess: opSuccess, error: opReceiptError } = useWaitForTransactionReceipt({ hash: opHash });

  const handleSetOperator = useCallback(() => {
    if (!validToken) return;
    writeOp({
      address: validToken,
      abi: erc7984OperatorAbi,
      functionName: "setOperator",
      args: [AIRDROP_FACTORY, Number(ERC7984_OPERATOR_MAX_DEADLINE)],
      chainId: sepolia.id,
    });
  }, [validToken, writeOp]);

  // ── Create & fund ─────────────────────────────────────────────────────────
  const createMutation = useCreateAndFundConfidentialAirdropAndGetAddress({
    encryptor: encryptorFactory,
  });

  const handleCreate = useCallback(() => {
    if (!validToken || !amountParsed || !userAddress) return;
    setSubmitError(null);
    setCampaignResult(null);

    // Generate a random 32-byte salt each time
    const saltBytes = crypto.getRandomValues(new Uint8Array(32));
    const userSalt = toHex(saltBytes) as Hex;

    createMutation.mutate(
      {
        params: {
          token: validToken,
          startTimestamp: startTs,
          endTimestamp: endTs,
          canExtendClaimWindow: canExtend,
          admin: userAddress,         // admin MUST equal msg.sender
        },
        userSalt,
        amount: amountParsed,
        // encryptor comes from hook-level FactoryHookOptions above
      },
      {
        onSuccess: (result) => {
          setCampaignResult({ hash: result.hash, airdrop: result.airdrop });
        },
        onError: (e) => {
          const msg = e instanceof Error ? e.message : String(e);
          setSubmitError(msg.length > 300 ? msg.slice(0, 300) + "…" : msg);
        },
      }
    );
  }, [validToken, amountParsed, userAddress, startTs, endTs, canExtend, createMutation]);

  // ── Guards ────────────────────────────────────────────────────────────────

  if (!isConnected) return (
    <Card><p className="text-center text-sm" style={{ color: "#888" }}>Connect your wallet to create an airdrop campaign.</p></Card>
  );
  if (!isSepolia) return (
    <Card>
      <p className="mb-3 text-center text-sm" style={{ color: "#888" }}>Confidential Airdrop requires Sepolia.</p>
      <div className="flex justify-center"><YButton onClick={() => switchChain({ chainId: sepolia.id })}>Switch to Sepolia</YButton></div>
    </Card>
  );

  // ── Success view ──────────────────────────────────────────────────────────

  if (campaignResult) {
    return (
      <div className="space-y-4">
        <Card>
          <div className="mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <p className="text-sm font-bold text-emerald-400">Campaign created and funded</p>
          </div>
          {campaignLabel && <p className="mb-3 text-xs font-semibold" style={{ color: Y }}>{campaignLabel}</p>}
          <dl className="space-y-2">
            {[
              ["Airdrop address", campaignResult.airdrop],
              ["Tx hash",         campaignResult.hash],
              ["Token",           tokenAddress],
              ["Network",         "Ethereum Sepolia"],
              ["Factory",         AIRDROP_FACTORY],
            ].map(([k, v]) => (
              <div key={k} className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
                <dt className="w-32 flex-shrink-0 text-xs" style={{ color: "#555" }}>{k}</dt>
                <dd className="min-w-0 break-all font-mono text-xs" style={{ color: "#aaa" }}>{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-3 flex flex-wrap gap-2">
            <a href={`https://sepolia.etherscan.io/tx/${campaignResult.hash}`}
               target="_blank" rel="noopener noreferrer"
               className="text-xs transition-opacity hover:opacity-80" style={{ color: Y }}>
              View tx on Etherscan →
            </a>
            <a href={`https://sepolia.etherscan.io/address/${campaignResult.airdrop}`}
               target="_blank" rel="noopener noreferrer"
               className="ml-4 text-xs transition-opacity hover:opacity-80" style={{ color: Y }}>
              View airdrop contract →
            </a>
          </div>
        </Card>

        <Card>
          <Label>Next: Issue claim authorisations</Label>
          <p className="text-xs leading-relaxed" style={{ color: "#666" }}>
            The campaign is live. For each recipient, you need to:
          </p>
          <ol className="mt-2 space-y-1">
            {["Encrypt their allocation with their wallet address as recipient (per-recipient)",
              "Sign a Claim EIP-712 authorization for each (admin signs as DEFAULT_ADMIN_ROLE)",
              "Deliver the { encryptedInput, signature } pair to each recipient"].map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-xs" style={{ color: "#555" }}>
                <span style={{ color: Y }}>{i + 1}.</span>{s}
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs italic" style={{ color: "#444" }}>
            Step 9B (Issue Claims) coming next. Save the airdrop address above.
          </p>
          <button onClick={() => { setCampaignResult(null); setSubmitError(null); createMutation.reset(); }}
            className="mt-3 text-xs hover:opacity-70" style={{ color: "#666" }}>
            Create another campaign
          </button>
        </Card>
      </div>
    );
  }

  // ── Main form ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">

      {/* FHE Encryptor */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Label>FHE Encryptor</Label>
            <p className="text-xs" style={{ color: encReady ? Y : encLoading ? "#888" : "#f87171" }}>
              {encReady ? "Ready — funding amount will be FHE-encrypted before broadcast" : encStatus}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {encLoading && <Spinner size={14} />}
            <span className="h-2 w-2 rounded-full" style={{ background: encReady ? Y : encLoading ? "#888" : "#f87171" }} />
          </div>
        </div>
      </Card>

      {/* Token */}
      <Card>
        <Label>ERC-7984 Confidential Token</Label>
        <ZInput value={tokenAddress} onChange={setTokenAddress} placeholder="0x… (copy from Registry)" monospace />
        {tokenAddress && !isAddress(tokenAddress) && <p className="mt-1 text-xs text-red-400">Not a valid address</p>}
        <div className="mt-3 flex items-center gap-3">
          <div className="w-28">
            <Label>Decimals</Label>
            <ZInput value={decimals} onChange={setDecimals} placeholder="18" />
          </div>
        </div>
      </Card>

      {/* Campaign params */}
      <Card>
        <Label>Campaign Settings</Label>
        <div className="space-y-3">
          <div>
            <Label>Campaign label (local only)</Label>
            <ZInput value={campaignLabel} onChange={setCampaignLabel} placeholder="e.g. Q1 Contributor Airdrop" />
          </div>
          <div>
            <Label>Total funding amount ({tokenAddress ? `token units` : "decimals above"})</Label>
            <ZInput value={amount} onChange={setAmount} placeholder="100" />
            {amountParsed !== null && (
              <p className="mt-0.5 text-xs" style={{ color: "#444" }}>
                = {amountParsed.toString()} raw units
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label>Claim window start</Label>
              <input type="datetime-local" value={startAt} onChange={e => setStartAt(e.target.value)}
                className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm text-white focus:outline-none"
                style={{ borderColor: BORDER, background: "rgba(0,0,0,0.35)", colorScheme: "dark" }} />
            </div>
            <div>
              <Label>Claim window end</Label>
              <input type="datetime-local" value={endAt} onChange={e => setEndAt(e.target.value)}
                className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm text-white focus:outline-none"
                style={{ borderColor: BORDER, background: "rgba(0,0,0,0.35)", colorScheme: "dark" }} />
            </div>
          </div>
          {endTs > 0 && startTs > 0 && endTs <= startTs && (
            <p className="text-xs text-red-400">End time must be after start time</p>
          )}
          <div className="flex items-center gap-2">
            <input type="checkbox" id="canExtend" checked={canExtend} onChange={e => setCanExtend(e.target.checked)}
              className="accent-yellow-400" />
            <label htmlFor="canExtend" className="text-xs cursor-pointer" style={{ color: "#888" }}>
              Allow admin to extend claim window after creation
            </label>
          </div>
          <div>
            <Label>Admin (your address)</Label>
            <p className="font-mono text-xs" style={{ color: "#555" }}>
              {userAddress ?? "—"} <span className="ml-1 text-zinc-700">(auto-set to connected wallet)</span>
            </p>
          </div>
        </div>
      </Card>

      {/* setOperator guided card */}
      {validToken && (
        <Card yellow>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <Label>Allow Airdrop Factory</Label>
              <p className="text-sm font-semibold text-white">Operator approval required</p>
              <p className="mt-1.5 text-xs leading-relaxed" style={{ color: "#aaa" }}>
                Before funding, the Airdrop Factory must be approved as an ERC-7984 operator on the
                selected token. This is a one-time on-chain step per token.
              </p>
              <p className="mt-2 font-mono text-xs" style={{ color: "#666" }}>
                Operator: {AIRDROP_FACTORY.slice(0, 10)}…{AIRDROP_FACTORY.slice(-8)}
              </p>
            </div>
            <div className="flex-shrink-0">
              <YButton onClick={handleSetOperator} loading={opSigning || opConfirming}
                disabled={opSigning || opConfirming || opSuccess}>
                {opSigning ? "Confirm in wallet…" : opConfirming ? "Confirming…" : opSuccess ? "✓ Allowed" : "Allow Factory"}
              </YButton>
            </div>
          </div>
          {opSuccess && <p className="mt-3 text-xs text-emerald-400">✓ Factory approved as operator.</p>}
          {(opWriteError || opReceiptError) && (
            <div className="mt-3">
              <p className="text-xs text-red-400">{(opWriteError ?? opReceiptError)!.message.slice(0, 180)}</p>
              <button onClick={resetOp} className="mt-1.5 text-xs hover:opacity-80" style={{ color: Y }}>Reset</button>
            </div>
          )}
        </Card>
      )}

      {/* Submit */}
      <div>
        <YButton onClick={handleCreate}
          loading={createMutation.isPending}
          disabled={!encReady || !paramsValid || createMutation.isPending}>
          {createMutation.isPending ? "Creating campaign…" : "Create & Fund Campaign"}
        </YButton>
        {!encReady && paramsValid && (
          <p className="mt-1 text-xs" style={{ color: "#666" }}>Waiting for FHE encryptor: {encStatus}</p>
        )}
        {!paramsValid && (
          <p className="mt-1 text-xs" style={{ color: "#555" }}>
            {!validToken ? "Enter a valid token address" :
             !amountParsed ? "Enter a valid funding amount" :
             !startTs || !endTs ? "Set claim window start and end" :
             endTs <= startTs ? "End time must be after start time" : ""}
          </p>
        )}
      </div>

      {submitError && (
        <div className="rounded-xl px-4 py-3" style={{ background: "rgba(255,100,100,0.06)", border: "1px solid rgba(255,100,100,0.18)" }}>
          <p className="text-xs font-semibold text-red-400">Error</p>
          <p className="mt-1 text-xs text-red-400/70">{submitError}</p>
          <button onClick={() => { setSubmitError(null); createMutation.reset(); }}
            className="mt-1.5 text-xs hover:opacity-70" style={{ color: "#666" }}>Dismiss</button>
        </div>
      )}

      {/* Info */}
      <Card>
        <Label>How Create & Fund works</Label>
        <ul className="space-y-1.5">
          {[
            "setOperator grants the factory contract permission to transfer your ERC-7984 tokens",
            "createAndFundConfidentialAirdrop deploys a clone contract AND funds it in one transaction",
            "The SDK FHE-encrypts the total funding amount before broadcast — on-chain amount is hidden",
            "The clone address is parsed from the ConfidentialAirdropCreated event in the receipt",
            "After creation: issue per-recipient encrypted claim authorizations (Step 9B)",
          ].map(item => (
            <li key={item} className="flex items-start gap-2 text-xs" style={{ color: "#555" }}>
              <span style={{ color: Y, flexShrink: 0 }}>·</span>{item}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
