"use client";
/**
 * IssueClaimsForm — Step 9B: per-recipient encrypted claim authorization.
 *
 * For each recipient:
 *  1. encryptUint64({ encryptor, contractAddress: airdropAddress, userAddress: recipient, value })
 *     → EncryptedInput { handle: Hex, inputProof: Hex }
 *     Proof is BOUND to (airdropAddress, recipientAddress) — cannot be reused for a different recipient.
 *  2. useSignClaimAuthorization().mutateAsync({ airdropAddress, recipient, encryptedAmountHandle: handle })
 *     → Hex signature (EIP-712, admin must hold DEFAULT_ADMIN_ROLE on clone)
 *  3. Export JSON array for Step 9C (recipient claim).
 *
 * Sources: @tokenops/sdk/fhe-airdrop (encryptUint64) + @tokenops/sdk/fhe-airdrop/react (useSignClaimAuthorization)
 */

import { useState, useCallback, useRef } from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { isAddress, parseUnits } from "viem";
import type { Address } from "viem";
import { sepolia } from "wagmi/chains";
import { useSignClaimAuthorization } from "@tokenops/sdk/fhe-airdrop/react";
import { encryptUint64 } from "@tokenops/sdk/fhe-airdrop";
import { useTokenOpsEncryptor } from "@/hooks/useTokenOpsEncryptor";
import { Spinner } from "@/components/ui/Spinner";

// ─── Brand ────────────────────────────────────────────────────────────────────
const Y      = "#FFD208";
const CARD   = "rgba(255,255,255,0.025)";
const BORDER = "rgba(255,255,255,0.07)";
const YBORDER = "rgba(255,210,8,0.22)";
const YDIM   = "rgba(255,210,8,0.08)";

// ─── Exported claim JSON shape (Step 9C) ─────────────────────────────────────
export interface ClaimPayload {
  airdropAddress:  string;
  recipient:       string;
  label:           string;
  amountDisplay:   string;
  encryptedInput:  { handle: string; inputProof: string };
  signature:       string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface Row { id: string; address: string; amount: string; label: string; }
const emptyRow = (): Row => ({ id: Math.random().toString(36).slice(2), address: "", amount: "", label: "" });

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
function ZInput({ value, onChange, placeholder, monospace, disabled, rows: textRows }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
  monospace?: boolean; disabled?: boolean; rows?: number;
}) {
  const shared = {
    className: `w-full rounded-lg border bg-transparent px-3 py-2 text-sm text-white placeholder-zinc-700 focus:outline-none disabled:opacity-40 ${monospace ? "font-mono" : ""}`,
    style: { borderColor: BORDER, background: "rgba(0,0,0,0.35)" },
    onFocus: (e: React.FocusEvent<HTMLElement>) => { (e.currentTarget as HTMLElement).style.borderColor = YBORDER; },
    onBlur:  (e: React.FocusEvent<HTMLElement>) => { (e.currentTarget as HTMLElement).style.borderColor = BORDER; },
  };
  if (textRows) return <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} disabled={disabled} rows={textRows} {...shared} />;
  return <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} disabled={disabled} {...shared} />;
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

// ─── GeneratedClaimsCard ─────────────────────────────────────────────────────

function GeneratedClaimsCard({ claims, airdropAddress, onReset }: {
  claims: ClaimPayload[]; airdropAddress: string; onReset: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const copyTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const jsonStr = JSON.stringify(claims, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonStr).then(() => {
      setCopied(true);
      if (copyTimeout.current) clearTimeout(copyTimeout.current);
      copyTimeout.current = setTimeout(() => setCopied(false), 2000);
    }).catch(() => undefined);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `claims-${airdropAddress.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}`, borderTop: `2px solid rgba(255,210,8,0.30)` }}>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <p className="text-sm font-bold text-emerald-400">
              {claims.length} claim authorization{claims.length !== 1 ? "s" : ""} generated
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={handleCopy}
              className="rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all"
              style={{ background: copied ? "rgba(34,197,94,0.10)" : YDIM, border: `1px solid ${copied ? "rgba(34,197,94,0.30)" : YBORDER}`, color: copied ? "#4ade80" : Y }}>
              {copied ? "✓ Copied" : "Copy Claim JSON"}
            </button>
            <button onClick={handleDownload} className="text-xs transition-opacity hover:opacity-80" style={{ color: Y }}>
              Download ↓
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {claims.map((c, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg px-3 py-2"
              style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${BORDER}` }}>
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold"
                style={{ background: YDIM, color: Y }}>{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-xs text-white">{c.recipient.slice(0, 12)}…{c.recipient.slice(-8)}</p>
                {c.label && <p className="text-xs" style={{ color: "#888" }}>{c.label}</p>}
                <p className="text-xs" style={{ color: "#555" }}>Amount: {c.amountDisplay} · Sig: {c.signature.slice(0, 12)}…</p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-3 text-xs" style={{ color: "#555" }}>
          Copy the full JSON and paste into the{" "}
          <strong style={{ color: "#888" }}>3 · Recipient Claim</strong> tab.
          Each recipient can also paste their individual object from the array.
        </p>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
        <div className="flex items-center justify-between px-4 py-2"
          style={{ background: "rgba(255,255,255,0.03)", borderBottom: `1px solid ${BORDER}` }}>
          <span className="text-xs font-semibold" style={{ color: "#888" }}>Full JSON payload</span>
          <button onClick={handleCopy} className="rounded px-2 py-0.5 text-xs transition-all"
            style={{ background: copied ? "rgba(34,197,94,0.10)" : YDIM, color: copied ? "#4ade80" : Y }}>
            {copied ? "✓ Copied" : "Copy"}
          </button>
        </div>
        <textarea readOnly value={jsonStr} rows={10}
          className="w-full resize-y px-4 py-3 font-mono text-xs focus:outline-none"
          style={{ background: "#0a0a0a", color: "#aaa", border: "none" }} />
      </div>

      <button onClick={onReset} className="text-xs hover:opacity-70" style={{ color: "#666" }}>
        Generate for another airdrop
      </button>
    </div>
  );
}

// ─── CSV parsing ──────────────────────────────────────────────────────────────

// CSV parsing (same pattern as Disperse)
function parseCsv(text: string): Row[] {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  return lines.map(line => {
    const [rawAddr = "", rawAmt = "", rawLabel = ""] = line.split(",").map(s => s.trim());
    return { ...emptyRow(), address: rawAddr, amount: rawAmt, label: rawLabel };
  });
}

// ─── Main component ───────────────────────────────────────────────────────────

export function IssueClaimsForm() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const isSepolia = chainId === sepolia.id;

  // Form state
  const [airdropAddress, setAirdropAddress] = useState("");
  const [decimals, setDecimals]             = useState("18");
  const [rows, setRows]                     = useState<Row[]>([emptyRow(), emptyRow()]);
  const [csvText, setCsvText]               = useState("");
  const [showCsv, setShowCsv]              = useState(false);

  // Processing state
  const [isProcessing, setIsProcessing]   = useState(false);
  const [progress, setProgress]           = useState<string>("");
  const [processError, setProcessError]   = useState<string | null>(null);
  const [generatedClaims, setGeneratedClaims] = useState<ClaimPayload[] | null>(null);

  // SDK
  const { encryptorFactory, isReady: encReady, isLoading: encLoading, statusLabel: encStatus } = useTokenOpsEncryptor();
  const signMutation = useSignClaimAuthorization();

  // Derived
  const validAirdrop = isAddress(airdropAddress) ? (airdropAddress as Address) : undefined;
  const dec = parseInt(decimals || "18", 10);
  const validRows = rows.filter(r => isAddress(r.address) && parseFloat(r.amount) > 0);
  const canGenerate = !!validAirdrop && validRows.length > 0 && encReady && !isProcessing;

  // Row management
  const addRow = useCallback(() => setRows(r => [...r, emptyRow()]), []);
  const removeRow = useCallback((id: string) => setRows(r => r.filter(x => x.id !== id)), []);
  const updateRow = useCallback((id: string, field: keyof Row, value: string) => {
    setRows(r => r.map(x => x.id === id ? { ...x, [field]: value } : x));
  }, []);

  // CSV
  const handleParseCsv = useCallback(() => {
    const parsed = parseCsv(csvText);
    if (parsed.length) { setRows(parsed); setCsvText(""); setShowCsv(false); }
  }, [csvText]);

  // ── Generate claims (sequential per-recipient) ─────────────────────────────
  const handleGenerate = useCallback(async () => {
    if (!validAirdrop || !encReady || validRows.length === 0) return;
    const encryptor = encryptorFactory();
    if (!encryptor) { setProcessError("FHE encryptor not available — wait for Ready state."); return; }

    setIsProcessing(true);
    setProcessError(null);
    setGeneratedClaims(null);
    const results: ClaimPayload[] = [];

    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];
      const n = validRows.length;

      try {
        // Step 1: FHE-encrypt the amount, bound to (airdropAddress, recipientAddress)
        setProgress(`[${i + 1}/${n}] Encrypting amount for ${row.address.slice(0, 8)}…`);
        const encResult = await encryptUint64({
          encryptor,
          contractAddress: validAirdrop,
          userAddress: row.address as Address,
          value: parseUnits(row.amount, dec),
        });

        // Step 2: admin signs EIP-712 claim authorization (prompts MetaMask once per recipient)
        setProgress(`[${i + 1}/${n}] Sign claim in wallet for ${row.address.slice(0, 8)}…`);
        const signature = await signMutation.mutateAsync({
          airdropAddress: validAirdrop,
          recipient: row.address as Address,
          encryptedAmountHandle: encResult.handle,
        });

        results.push({
          airdropAddress: validAirdrop,
          recipient:      row.address,
          label:          row.label,
          amountDisplay:  row.amount,
          encryptedInput: { handle: encResult.handle, inputProof: encResult.inputProof },
          signature,
        });
        setProgress(`[${i + 1}/${n}] ✓ Done — ${row.address.slice(0, 8)}…`);

      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setProcessError(`Failed at recipient ${i + 1} (${row.address.slice(0, 10)}…): ${msg.slice(0, 200)}`);
        setIsProcessing(false);
        return;
      }
    }

    setGeneratedClaims(results);
    setProgress(`✓ All ${results.length} claim authorizations generated.`);
    setIsProcessing(false);
  }, [validAirdrop, encReady, encryptorFactory, validRows, dec, signMutation]);

  // ── Guards ────────────────────────────────────────────────────────────────
  if (!isConnected) return <Card><p className="text-center text-sm" style={{ color: "#888" }}>Connect your wallet to issue claims.</p></Card>;
  if (!isSepolia) return (
    <Card>
      <p className="mb-3 text-center text-sm" style={{ color: "#888" }}>Sepolia required.</p>
      <div className="flex justify-center"><YButton onClick={() => switchChain({ chainId: sepolia.id })}>Switch to Sepolia</YButton></div>
    </Card>
  );

  return (
    <div className="space-y-5">

      {/* Encryptor */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Label>FHE Encryptor</Label>
            <p className="text-xs" style={{ color: encReady ? Y : encLoading ? "#888" : "#f87171" }}>
              {encReady ? "Ready — amounts will be encrypted per recipient" : encStatus}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {encLoading && <Spinner size={14} />}
            <span className="h-2 w-2 rounded-full" style={{ background: encReady ? Y : encLoading ? "#888" : "#f87171" }} />
          </div>
        </div>
      </Card>

      {/* Airdrop address */}
      <Card>
        <Label>Airdrop Clone Address</Label>
        <ZInput value={airdropAddress} onChange={setAirdropAddress}
          placeholder="0x… (from Create Campaign step)" monospace />
        {airdropAddress && !isAddress(airdropAddress) && (
          <p className="mt-1 text-xs text-red-400">Not a valid address</p>
        )}
        <div className="mt-3 w-28">
          <Label>Token Decimals</Label>
          <ZInput value={decimals} onChange={setDecimals} placeholder="18" />
        </div>
      </Card>

      {/* Recipients */}
      <Card>
        <div className="mb-2 flex items-center justify-between">
          <Label>Recipients</Label>
          <button onClick={() => setShowCsv(!showCsv)} className="text-xs hover:opacity-80"
            style={{ color: showCsv ? Y : "#666" }}>
            {showCsv ? "Hide CSV" : "Paste CSV"}
          </button>
        </div>

        {showCsv && (
          <div className="mb-4 space-y-2 rounded-xl p-3" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${BORDER}` }}>
            <Label>CSV — address,amount,label</Label>
            <ZInput value={csvText} onChange={setCsvText} placeholder={"0xRecipient,10,Alice\n0xRecipient2,20,Bob"} rows={4} />
            <button onClick={handleParseCsv} disabled={!csvText.trim()}
              className="text-xs hover:opacity-80 disabled:opacity-40" style={{ color: Y }}>
              Parse and use recipients →
            </button>
          </div>
        )}

        <div className="space-y-2">
          {rows.map((row, i) => (
            <div key={row.id} className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
              <span className="w-5 flex-shrink-0 text-xs" style={{ color: "#444" }}>{i + 1}</span>
              <div className="w-full sm:flex-1">
                <ZInput value={row.address} onChange={v => updateRow(row.id, "address", v)} placeholder="0x… recipient" monospace />
              </div>
              <div className="w-24 flex-shrink-0">
                <ZInput value={row.amount} onChange={v => updateRow(row.id, "amount", v)} placeholder="Amount" />
              </div>
              <div className="w-24 flex-shrink-0">
                <ZInput value={row.label} onChange={v => updateRow(row.id, "label", v)} placeholder="Label" />
              </div>
              <button onClick={() => removeRow(row.id)} disabled={rows.length <= 1}
                className="flex-shrink-0 px-2 py-1 text-xs disabled:opacity-30" style={{ color: "#555" }} title="Remove">✕</button>
            </div>
          ))}
        </div>
        <button onClick={addRow} className="mt-3 text-xs hover:opacity-80" style={{ color: Y }}>+ Add recipient</button>

        <p className="mt-2 text-xs" style={{ color: "#444" }}>
          {validRows.length} valid recipient{validRows.length !== 1 ? "s" : ""}
          {validRows.length > 0 && ` · ${validRows.length} MetaMask signature prompt${validRows.length !== 1 ? "s" : ""} will appear`}
        </p>
      </Card>

      {/* Progress / generate */}
      {isProcessing && (
        <Card>
          <div className="flex items-center gap-2">
            <Spinner size={14} />
            <p className="text-xs" style={{ color: "#aaa" }}>{progress}</p>
          </div>
        </Card>
      )}

      {processError && (
        <div className="rounded-xl px-4 py-3" style={{ background: "rgba(255,100,100,0.06)", border: "1px solid rgba(255,100,100,0.18)" }}>
          <p className="text-xs font-semibold text-red-400">Error</p>
          <p className="mt-1 text-xs text-red-400/70">{processError}</p>
          <button onClick={() => { setProcessError(null); signMutation.reset(); }}
            className="mt-1.5 text-xs hover:opacity-70" style={{ color: "#666" }}>Dismiss</button>
        </div>
      )}

      {!isProcessing && !generatedClaims && (
        <YButton onClick={() => void handleGenerate()} disabled={!canGenerate} loading={isProcessing}>
          {`Generate ${validRows.length > 0 ? validRows.length : ""} Claim Authorization${validRows.length !== 1 ? "s" : ""}`}
        </YButton>
      )}

      {/* Generated JSON output */}
      {generatedClaims && (
        <div className="space-y-4">
          <GeneratedClaimsCard
            claims={generatedClaims}
            airdropAddress={airdropAddress}
            onReset={() => { setGeneratedClaims(null); setProgress(""); signMutation.reset(); }}
          />
        </div>
      )}

      {/* Info */}
      {!generatedClaims && (
        <Card>
          <Label>How Issue Claims works</Label>
          <ul className="space-y-1.5">
            {[
              `encryptUint64 encrypts each amount bound to (airdropAddress, recipient) — proofs cannot be reused across recipients`,
              "useSignClaimAuthorization signs a Claim(recipient, handle) EIP-712 struct — one MetaMask prompt per recipient",
              "Output JSON contains { encryptedInput: { handle, inputProof }, signature } per recipient",
              "Step 9C: each recipient pastes their payload into the Claim tab and calls useClaim()",
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
