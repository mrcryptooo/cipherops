"use client";
/**
 * ClaimAirdropForm — Step 9C: recipient claims their confidential airdrop allocation.
 *
 * The admin (Step 9B) produces { encryptedInput: { handle, inputProof }, signature } per recipient.
 * The recipient pastes that JSON here and calls useClaim({ address: airdropAddress }).
 *
 * SDK: useClaim from @tokenops/sdk/fhe-airdrop/react
 *  - options: { address: Address }    (airdrop clone address — REQUIRED at hook level)
 *  - mutate:  { encryptedInput, signature, value? }
 *  - returns: Hex (tx hash)
 *  - gas fee is attached automatically from airdrop.gasFee() unless value is overridden
 */

import { useState, useMemo } from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { isAddress } from "viem";
import type { Address, Hex } from "viem";
import { sepolia } from "wagmi/chains";
import Link from "next/link";
import { useClaim } from "@tokenops/sdk/fhe-airdrop/react";
import { Spinner } from "@/components/ui/Spinner";
import type { ClaimPayload } from "./IssueClaimsForm";

// ─── Brand ────────────────────────────────────────────────────────────────────
const Y       = "#FFD208";
const CARD    = "rgba(255,255,255,0.025)";
const BORDER  = "rgba(255,255,255,0.07)";
const YBORDER = "rgba(255,210,8,0.22)";
const YDIM    = "rgba(255,210,8,0.08)";

// Zero address used as a safe fallback so the hook is always called unconditionally
const ZERO_ADDR = "0x0000000000000000000000000000000000000000" as Address;

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
function YButton({ onClick, disabled, loading, children, variant = "primary" }: {
  onClick?: () => void; disabled?: boolean; loading?: boolean; children: React.ReactNode; variant?: "primary" | "ghost";
}) {
  const base = "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-opacity disabled:opacity-40 disabled:cursor-not-allowed";
  if (variant === "ghost") return <button onClick={onClick} disabled={disabled || loading} className={base} style={{ background: YDIM, border: `1px solid ${YBORDER}`, color: Y }}>{loading && <Spinner size={14} />}{children}</button>;
  return <button onClick={onClick} disabled={disabled || loading} className={base} style={{ background: Y, color: "#000" }}>{loading && <Spinner size={14} />}{children}</button>;
}

// Validate a single claim object
function validateOneClaim(data: Record<string, unknown>): ClaimPayload | string {
  const enc = data.encryptedInput as Record<string, unknown> | undefined;
  if (!data.airdropAddress)   return 'Missing "airdropAddress"';
  if (!data.recipient)        return 'Missing "recipient"';
  if (!enc?.handle)           return 'Missing "encryptedInput.handle"';
  if (!enc?.inputProof)       return 'Missing "encryptedInput.inputProof"';
  if (!data.signature)        return 'Missing "signature"';
  if (!isAddress(String(data.airdropAddress))) return '"airdropAddress" is not a valid EVM address';
  if (!isAddress(String(data.recipient)))      return '"recipient" is not a valid EVM address';
  if (typeof data.signature !== "string" || !String(data.signature).startsWith("0x")) return '"signature" must be a 0x hex string';
  return {
    airdropAddress: String(data.airdropAddress),
    recipient:      String(data.recipient),
    label:          String(data.label ?? ""),
    amountDisplay:  String(data.amountDisplay ?? ""),
    encryptedInput: { handle: String(enc.handle), inputProof: String(enc.inputProof) },
    signature:      String(data.signature),
  };
}

// Parse JSON that may be:
//   A) single object { airdropAddress, ... }
//   B) array [{ ... }, { ... }]
//   C) wrapper { claims: [{ ... }] }
// Returns all valid claims found + the total count
function parseClaimJsonAll(raw: string): {
  claims: ClaimPayload[];
  total: number;
  error: string | null;
} {
  let parsed: unknown;
  try { parsed = JSON.parse(raw); }
  catch { return { claims: [], total: 0, error: "Invalid JSON — could not parse" }; }

  // Normalise to array
  let candidates: unknown[] = [];
  if (Array.isArray(parsed)) {
    candidates = parsed;
  } else if (parsed && typeof parsed === "object") {
    const obj = parsed as Record<string, unknown>;
    if (Array.isArray(obj.claims)) {
      candidates = obj.claims;
    } else {
      candidates = [obj];
    }
  }

  if (candidates.length === 0) return { claims: [], total: 0, error: "No claim entries found in JSON" };

  const valid: ClaimPayload[] = [];
  for (const c of candidates) {
    if (c && typeof c === "object") {
      const result = validateOneClaim(c as Record<string, unknown>);
      if (typeof result !== "string") valid.push(result);
    }
  }

  if (valid.length === 0) {
    // Return the first validation error for guidance
    const firstErr = validateOneClaim(candidates[0] as Record<string, unknown>);
    return { claims: [], total: candidates.length, error: typeof firstErr === "string" ? firstErr : "Invalid claim structure" };
  }

  return { claims: valid, total: candidates.length, error: null };
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ClaimAirdropForm() {
  const { address: walletAddress, isConnected } = useAccount();
  const chainId    = useChainId();
  const { switchChain } = useSwitchChain();
  const isSepolia  = chainId === sepolia.id;

  const [jsonText, setJsonText]       = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [allClaims, setAllClaims]    = useState<ClaimPayload[]>([]);
  const [totalDetected, setTotalDetected] = useState(0);
  const [selected, setSelected]       = useState<ClaimPayload | null>(null);
  const [parseError, setParseError]   = useState<string | null>(null);
  const [noMatchMsg, setNoMatchMsg]   = useState<string | null>(null);
  const [successTx, setSuccessTx]     = useState<string | null>(null);
  const [claimError, setClaimError]   = useState<string | null>(null);

  // Always call hook unconditionally — ZERO_ADDR fallback when nothing parsed
  const airdropAddr: Address = (selected?.airdropAddress as Address | undefined) ?? ZERO_ADDR;
  const claimMutation = useClaim({ address: airdropAddr });

  // Wallet mismatch guard
  const walletMismatch = useMemo(() => {
    if (!selected || !walletAddress) return false;
    return selected.recipient.toLowerCase() !== walletAddress.toLowerCase();
  }, [selected, walletAddress]);

  const canClaim = !!selected && !walletMismatch && isConnected && isSepolia && airdropAddr !== ZERO_ADDR;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleParse = () => {
    setParseError(null); setNoMatchMsg(null);
    setAllClaims([]); setSelected(null); setTotalDetected(0);

    const result = parseClaimJsonAll(jsonText);
    if (result.error) { setParseError(result.error); return; }

    setAllClaims(result.claims);
    setTotalDetected(result.total);

    // Auto-select the claim whose recipient matches connected wallet
    if (walletAddress) {
      const match = result.claims.find(c => c.recipient.toLowerCase() === walletAddress.toLowerCase());
      if (match) {
        setSelected(match);
      } else {
        setSelected(result.claims[0]); // show first as preview
        setNoMatchMsg(`No claim in this JSON matches your wallet (${walletAddress.slice(0,8)}…). Connect the recipient wallet to claim.`);
      }
    } else {
      setSelected(result.claims[0]); // show first, disable until wallet connects
    }
  };

  const handleClaim = () => {
    if (!selected) return;
    setClaimError(null);
    setSuccessTx(null);
    claimMutation.mutate(
      {
        encryptedInput: {
          handle:     selected.encryptedInput.handle as Hex,
          inputProof: selected.encryptedInput.inputProof as Hex,
        },
        signature: selected.signature as Hex,
        // value omitted — SDK fetches gasFee() automatically
      },
      {
        onSuccess: (txHash) => setSuccessTx(txHash),
        onError:   (e) => setClaimError(e instanceof Error ? e.message.slice(0, 300) : String(e)),
      }
    );
  };

  const handleReset = () => {
    setJsonText(""); setAllClaims([]); setSelected(null); setTotalDetected(0);
    setParseError(null); setNoMatchMsg(null);
    setSuccessTx(null); setClaimError(null);
    claimMutation.reset();
  };

  // ── Guards ────────────────────────────────────────────────────────────────

  if (!isConnected) return <Card><p className="text-center text-sm" style={{ color: "#888" }}>Connect your wallet to claim your airdrop allocation.</p></Card>;
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
            <p className="text-sm font-bold text-emerald-400">Claim confirmed</p>
          </div>
          <p className="text-sm text-white">Your confidential tokens have been claimed.</p>
          {selected?.label && <p className="mt-1 text-xs" style={{ color: Y }}>{selected.label}</p>}
          <a href={`https://sepolia.etherscan.io/tx/${successTx}`}
            target="_blank" rel="noopener noreferrer"
            className="mt-3 block text-xs hover:opacity-80" style={{ color: Y }}>
            View tx on Etherscan →
          </a>
        </Card>

        <Card yellow>
          <Label>Next: Reveal your confidential balance</Label>
          <p className="text-sm text-white">Your claimed tokens are encrypted on-chain.</p>
          <p className="mt-1.5 text-xs leading-relaxed" style={{ color: "#aaa" }}>
            Use the Registry <strong className="text-white">Private Reveal</strong> tab to decrypt your own balance.
            Sign a one-time EIP-712 authorization — the plaintext appears only in your browser.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/registry"
              className="inline-flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-bold transition-opacity hover:opacity-90"
              style={{ background: Y, color: "#000" }}>
              Open Registry →
            </Link>
            <button onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold"
              style={{ background: CARD, border: `1px solid ${BORDER}`, color: "#ccc" }}>
              Claim another
            </button>
          </div>
        </Card>
      </div>
    );
  }

  // ── Main form ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">

      {/* Paste JSON */}
      <Card>
        <Label>Paste your claim JSON</Label>
        <p className="mb-3 text-xs" style={{ color: "#666" }}>
          The airdrop admin issued a JSON payload for your wallet address. Paste it below.
        </p>
        <textarea
          value={jsonText}
          onChange={e => setJsonText(e.target.value)}
          rows={8}
          placeholder={'{\n  "airdropAddress": "0x…",\n  "recipient": "0x…",\n  "encryptedInput": { "handle": "0x…", "inputProof": "0x…" },\n  "signature": "0x…"\n}'}
          className="w-full resize-y rounded-lg border bg-transparent px-3 py-2 font-mono text-xs text-white placeholder-zinc-700 focus:outline-none"
          style={{ borderColor: BORDER, background: "rgba(0,0,0,0.35)" }}
          onFocus={e => { e.currentTarget.style.borderColor = YBORDER; }}
          onBlur={e => { e.currentTarget.style.borderColor = BORDER; }}
        />
        {parseError && <p className="mt-2 text-xs text-red-400">Parse error: {parseError}</p>}
        <div className="mt-3 flex gap-2">
          <YButton variant="ghost" onClick={handleParse} disabled={!jsonText.trim()}>
            Parse JSON
          </YButton>
          {jsonText && <button onClick={handleReset} className="text-xs hover:opacity-70" style={{ color: "#666" }}>Clear</button>}
        </div>
      </Card>

      {/* Parsed preview */}
      {selected && (
        <Card>
          <div className="mb-2 flex items-center justify-between gap-2">
            <Label>Selected claim</Label>
            <span className="text-xs" style={{ color: "#555" }}>
              {totalDetected === 1 ? "Single claim detected" : `Detected ${totalDetected} entries — selected the one matching your wallet`}
            </span>
          </div>

          {noMatchMsg && (
            <p className="mb-3 text-xs text-red-400">⚠ {noMatchMsg}</p>
          )}

          <dl className="space-y-2">
            {[
              ["Airdrop",   `${selected.airdropAddress.slice(0,10)}…${selected.airdropAddress.slice(-8)}`],
              ["Recipient", `${selected.recipient.slice(0,10)}…${selected.recipient.slice(-8)}`],
              ["Label",     selected.label || "—"],
              ["Amount",    selected.amountDisplay || "—"],
              ["Handle",    `${selected.encryptedInput.handle.slice(0,12)}…`],
              ["Signature", `${selected.signature.slice(0,12)}…${selected.signature.slice(-8)}`],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <dt className="w-20 flex-shrink-0 text-xs" style={{ color: "#555" }}>{k}</dt>
                <dd className="font-mono text-xs" style={{ color: "#aaa" }}>{v}</dd>
              </div>
            ))}
          </dl>

          {/* Connected wallet */}
          <div className="mt-3 rounded-lg px-3 py-2" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${BORDER}` }}>
            <p className="text-xs" style={{ color: "#555" }}>Connected wallet</p>
            <p className="font-mono text-xs" style={{ color: walletMismatch ? "#f87171" : "#aaa" }}>
              {walletAddress ?? "—"}
            </p>
            {walletMismatch && (
              <p className="mt-1 text-xs text-red-400">
                ⚠ Your wallet ({walletAddress?.slice(0,8)}…) does not match the recipient ({selected.recipient.slice(0,8)}…).
                Connect the correct wallet to claim.
              </p>
            )}
            {!walletMismatch && walletAddress && (
              <p className="mt-0.5 text-xs text-emerald-400">✓ Wallet matches recipient</p>
            )}
          </div>
        </Card>
      )}

      {/* Claim button */}
      {selected && (
        <div>
          <YButton onClick={handleClaim} loading={claimMutation.isPending} disabled={!canClaim || claimMutation.isPending}>
            {claimMutation.isPending ? "Claiming…" : "Claim My Tokens"}
          </YButton>
          {walletMismatch && (
            <p className="mt-1 text-xs text-red-400">Connect the recipient wallet first</p>
          )}
          {!walletMismatch && !claimMutation.isPending && (
            <p className="mt-1 text-xs" style={{ color: "#555" }}>
              The SDK will attach the required gas fee (in ETH) automatically.
            </p>
          )}
        </div>
      )}

      {/* Claim error */}
      {claimError && (
        <div className="rounded-xl px-4 py-3" style={{ background: "rgba(255,100,100,0.06)", border: "1px solid rgba(255,100,100,0.18)" }}>
          <p className="text-xs font-semibold text-red-400">Claim failed</p>
          <p className="mt-1 text-xs text-red-400/70">{claimError}</p>
          <button onClick={() => { setClaimError(null); claimMutation.reset(); }}
            className="mt-1.5 text-xs hover:opacity-70" style={{ color: "#666" }}>Dismiss</button>
        </div>
      )}

      {/* Info */}
      {!selected && !claimError && (
        <Card>
          <Label>How claiming works</Label>
          <ul className="space-y-1.5">
            {[
              "The airdrop admin encrypted your allocation and signed a claim authorization for your specific wallet address",
              "useClaim submits the { encryptedInput, signature } pair verbatim — the SDK does not re-encrypt",
              "The claim tx attaches the required gas fee automatically",
              "After claiming, use Private Reveal in the Registry to decrypt your confidential balance",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-xs" style={{ color: "#555" }}>
                <span style={{ color: Y, flexShrink: 0 }}>{i + 1}.</span>{item}
              </li>
            ))}
          </ul>
        </Card>
      )}

    </div>
  );
}
