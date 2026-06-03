"use client";
/**
 * DisperseForm — Confidential Disperse for CipherOps Operations Studio.
 * T3 polish: CSV import, recipient summary card, rich post-success card.
 *
 * VERIFIED SUBMIT LOGIC (unchanged from T2A/T2B QA):
 *   usePreflightDisperse / useRegister / setOperator / useDisperse / useTokenOpsEncryptor
 * Confirmed tx: 0x650b5e598d3a…8de07752
 */

import { useState, useCallback, useEffect, useMemo } from "react";
import { useAccount, useChainId, useSwitchChain, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { isAddress, parseUnits, formatUnits } from "viem";
import type { Address } from "viem";
import { sepolia } from "wagmi/chains";
import {
  useIsRegistered,
  usePreflightDisperse,
  useRegister,
  useDisperse,
} from "@tokenops/sdk/fhe-disperse/react";
import {
  erc7984OperatorAbi,
  ERC7984_OPERATOR_MAX_DEADLINE,
} from "@tokenops/sdk/fhe-disperse";
import { useTokenOpsEncryptor } from "@/hooks/useTokenOpsEncryptor";
import { Spinner } from "@/components/ui/Spinner";

const DISPERSE_SINGLETON: Address = "0x710dD9885Cc9986EfD234E7719483147a6d8DBb4";

// ─── Brand ────────────────────────────────────────────────────────────────────
const Y  = "#FFD208";
const CARD        = "rgba(255,255,255,0.025)";
const CARD_BORDER = "rgba(255,255,255,0.07)";
const YBORDER     = "rgba(255,210,8,0.22)";
const YDIM        = "rgba(255,210,8,0.08)";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function shortAddr(a: string) { return `${a.slice(0, 6)}…${a.slice(-4)}`; }

function Card({ children, yellow, success }: {
  children: React.ReactNode; yellow?: boolean; success?: boolean;
}) {
  const bg     = success ? "rgba(34,197,94,0.06)"  : yellow ? YDIM        : CARD;
  const border = success ? "rgba(34,197,94,0.22)"  : yellow ? YBORDER     : CARD_BORDER;
  const top    = success ? "2px solid rgba(34,197,94,0.35)" : yellow ? `2px solid rgba(255,210,8,0.40)` : undefined;
  return (
    <div className="rounded-xl p-4" style={{ background: bg, border: `1px solid ${border}`, borderTop: top }}>
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest" style={{ color: "#888", letterSpacing: "0.12em" }}>{children}</p>;
}

function ZInput({ value, onChange, placeholder, monospace, disabled, rows: textRows }: {
  value: string; onChange: (v: string) => void;
  placeholder?: string; monospace?: boolean; disabled?: boolean; rows?: number;
}) {
  const shared = {
    style: { borderColor: CARD_BORDER, background: "rgba(0,0,0,0.35)" },
    onFocus: (e: React.FocusEvent<HTMLElement>) => { (e.currentTarget as HTMLElement).style.borderColor = YBORDER; },
    onBlur:  (e: React.FocusEvent<HTMLElement>) => { (e.currentTarget as HTMLElement).style.borderColor = CARD_BORDER; },
    className: `w-full rounded-lg border bg-transparent px-3 py-2 text-sm text-white placeholder-zinc-700 focus:outline-none disabled:opacity-40 ${monospace ? "font-mono" : ""}`,
  };
  if (textRows) {
    return <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} disabled={disabled} rows={textRows} {...shared} />;
  }
  return <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} disabled={disabled} {...shared} />;
}

function YButton({ onClick, disabled, loading, children, variant = "primary", size = "md" }: {
  onClick?: () => void; disabled?: boolean; loading?: boolean;
  children: React.ReactNode; variant?: "primary" | "ghost" | "danger"; size?: "sm" | "md";
}) {
  const pad = size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm";
  const base = `flex items-center gap-2 rounded-lg ${pad} font-semibold transition-opacity disabled:opacity-40 disabled:cursor-not-allowed`;
  if (variant === "danger")  return <button onClick={onClick} disabled={disabled || loading} className={base} style={{ background: "rgba(255,80,80,0.12)", border: "1px solid rgba(255,80,80,0.30)", color: "#f87171" }}>{loading && <Spinner size={12} />}{children}</button>;
  if (variant === "ghost")   return <button onClick={onClick} disabled={disabled || loading} className={base} style={{ background: YDIM, border: `1px solid ${YBORDER}`, color: Y }}>{loading && <Spinner size={12} />}{children}</button>;
  return <button onClick={onClick} disabled={disabled || loading} className={base} style={{ background: Y, color: "#000" }}>{loading && <Spinner size={12} />}{children}</button>;
}

// ─── Row types ────────────────────────────────────────────────────────────────

interface Row    { id: string; address: string; amount: string; label?: string; }
interface CsvRow { address: string; amount: string; label: string; validAddr: boolean; validAmt: boolean; duplicate: boolean; }

const emptyRow = (): Row => ({ id: Math.random().toString(36).slice(2), address: "", amount: "" });

// ─── CSV parser ───────────────────────────────────────────────────────────────

function parseCsv(text: string): CsvRow[] {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const seen = new Set<string>();
  return lines.map(line => {
    const [rawAddr = "", rawAmt = "", rawLabel = ""] = line.split(",").map(s => s.trim());
    const address = rawAddr;
    const amount  = rawAmt;
    const label   = rawLabel;
    const validAddr = isAddress(address);
    const validAmt  = parseFloat(amount) > 0 && !isNaN(parseFloat(amount));
    const key = address.toLowerCase();
    const duplicate = seen.has(key);
    if (key) seen.add(key);
    return { address, amount, label, validAddr, validAmt, duplicate };
  });
}

// ─── Summary computations ─────────────────────────────────────────────────────

interface SuccessSnapshot {
  txHash: string;
  token: string;
  recipients: string[];
  decimals: number;
}

// ─── Main component ───────────────────────────────────────────────────────────

export function DisperseForm() {
  const { address: userAddress, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const isSepolia = chainId === sepolia.id;

  // Form state
  const [tokenAddress, setTokenAddress]     = useState("");
  const [rows, setRows]                     = useState<Row[]>([emptyRow(), emptyRow()]);
  const [decimals, setDecimals]             = useState("18");
  const [submitError, setSubmitError]       = useState<string | null>(null);
  const [successData, setSuccessData]       = useState<SuccessSnapshot | null>(null);

  // CSV state
  const [csvText, setCsvText]               = useState("");
  const [csvRows, setCsvRows]               = useState<CsvRow[]>([]);
  const [showCsv, setShowCsv]              = useState(false);

  const { encryptorFactory, isReady: encReady, isLoading: encLoading, statusLabel: encStatusLabel } = useTokenOpsEncryptor();

  const dec = parseInt(decimals || "18", 10);
  const validToken = isAddress(tokenAddress) ? (tokenAddress as Address) : undefined;
  const validRows  = rows.filter((r) => isAddress(r.address) && parseFloat(r.amount) > 0);
  const recipients = validRows.map((r) => r.address as Address);
  const amounts    = validRows.map((r) => { try { return parseUnits(r.amount, dec); } catch { return 0n; } });
  const hasValidInputs = !!validToken && validRows.length > 0 && amounts.every((a) => a > 0n);

  // Summary totals
  const totalAmount = useMemo(() => amounts.reduce((s, a) => s + a, 0n), [amounts]);

  // SDK hooks (verified, unchanged)
  useIsRegistered({ user: isConnected ? userAddress : undefined });

  const { data: preflight, isLoading: preflightLoading, error: preflightError, refetch: refetchPreflight } =
    usePreflightDisperse(hasValidInputs && isConnected ? { user: userAddress, token: validToken, recipients, amounts, mode: "direct" } : undefined);

  const registerMutation = useRegister({ encryptor: encryptorFactory });
  const disperseMutation = useDisperse({ encryptor: encryptorFactory });

  const { writeContract: writeSetOperator, data: opTxHash, isPending: opSigning, error: opWriteError, reset: resetOp } = useWriteContract();
  const { isLoading: opConfirming, isSuccess: opSuccess, error: opReceiptError } = useWaitForTransactionReceipt({ hash: opTxHash });

  useEffect(() => { if (opSuccess) void refetchPreflight(); }, [opSuccess, refetchPreflight]);

  // Handlers (verified)
  const addRow = useCallback(() => setRows((r) => [...r, emptyRow()]), []);
  const removeRow = useCallback((id: string) => setRows((r) => r.filter((x) => x.id !== id)), []);
  const updateRow = useCallback((id: string, field: "address" | "amount", value: string) => {
    setRows((r) => r.map((x) => (x.id === id ? { ...x, [field]: value } : x)));
  }, []);

  const handleRegister = useCallback(() => {
    if (!validToken) return;
    registerMutation.mutate({ token: validToken }, { onError: (e) => setSubmitError(e.message) });
  }, [validToken, registerMutation]);

  const handleSetOperator = useCallback(() => {
    if (!validToken) return;
    writeSetOperator({ address: validToken, abi: erc7984OperatorAbi, functionName: "setOperator", args: [DISPERSE_SINGLETON, Number(ERC7984_OPERATOR_MAX_DEADLINE)], chainId: sepolia.id });
  }, [validToken, writeSetOperator]);

  const handleDisperse = useCallback(() => {
    if (!validToken || recipients.length === 0) return;
    setSubmitError(null);
    setSuccessData(null);
    disperseMutation.mutate(
      { token: validToken, mode: "direct", recipients, amounts },
      {
        onSuccess: (result) => setSuccessData({ txHash: result.hash, token: validToken, recipients: [...recipients], decimals: dec }),
        onError: (e) => setSubmitError(e.message.length > 300 ? e.message.slice(0, 300) + "…" : e.message),
      }
    );
  }, [validToken, recipients, amounts, dec, disperseMutation]);

  const handleDisperseAgain = useCallback(() => {
    setSuccessData(null);
    setSubmitError(null);
    disperseMutation.reset();
  }, [disperseMutation]);

  // CSV parsing
  const handleParseCsv = useCallback(() => {
    setCsvRows(parseCsv(csvText));
  }, [csvText]);

  const csvHasErrors = csvRows.some((r) => !r.validAddr || !r.validAmt || r.duplicate);

  const handleUseCsvRecipients = useCallback(() => {
    const newRows = csvRows
      .filter((r) => r.validAddr && r.validAmt && !r.duplicate)
      .map((r) => ({ ...emptyRow(), address: r.address, amount: r.amount, label: r.label }));
    if (newRows.length > 0) {
      setRows(newRows);
      setCsvText("");
      setCsvRows([]);
      setShowCsv(false);
    }
  }, [csvRows]);

  // ── Guards ────────────────────────────────────────────────────────────────

  if (!isConnected) return <Card><p className="text-center text-sm" style={{ color: "#888" }}>Connect your wallet to use Confidential Disperse.</p></Card>;
  if (!isSepolia) return (
    <Card>
      <p className="mb-3 text-center text-sm" style={{ color: "#888" }}>Confidential Disperse is Sepolia-only in this version.</p>
      <div className="flex justify-center"><YButton onClick={() => switchChain({ chainId: sepolia.id })}>Switch to Sepolia</YButton></div>
    </Card>
  );

  // ── Post-success view ─────────────────────────────────────────────────────

  if (successData) {
    return (
      <div className="space-y-4">
        <Card success>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-emerald-400">✓ Confidential Disperse confirmed</p>
              <p className="mt-1.5 font-mono text-xs" style={{ color: "#aaa" }}>
                Tx:{" "}
                <a href={`https://sepolia.etherscan.io/tx/${successData.txHash}`} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: Y }}>
                  {successData.txHash.slice(0, 14)}…{successData.txHash.slice(-8)}
                </a>
              </p>
              <p className="mt-1 font-mono text-xs" style={{ color: "#555" }}>
                Token: {shortAddr(successData.token)} · Sepolia
              </p>
            </div>
            <YButton variant="ghost" size="sm" onClick={handleDisperseAgain}>
              Disperse again
            </YButton>
          </div>
        </Card>

        {/* Recipient list */}
        <Card>
          <Label>Recipients ({successData.recipients.length})</Label>
          <div className="space-y-1.5">
            {successData.recipients.map((addr) => (
              <div key={addr} className="flex items-center justify-between gap-3">
                <span className="font-mono text-xs" style={{ color: "#aaa" }}>{addr.slice(0,10)}…{addr.slice(-8)}</span>
                <span className="rounded px-2 py-0.5 text-xs" style={{ background: YDIM, border: `1px solid ${YBORDER}`, color: Y }}>
                  Amount encrypted
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs leading-relaxed" style={{ color: "#555" }}>
            Recipient amounts are FHE-encrypted. Each recipient can use the{" "}
            <strong className="font-medium" style={{ color: "#888" }}>Private Reveal</strong>{" "}
            flow in the Registry to decrypt their own confidential balance.
          </p>
        </Card>
      </div>
    );
  }

  // ── Main form ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">

      {/* ── FHE Encryptor ── */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Label>FHE Encryptor</Label>
            <p className="text-xs" style={{ color: encReady ? Y : encLoading ? "#888" : "#f87171" }}>
              {encReady ? "Ready — amounts will be encrypted before broadcast" : encStatusLabel}
            </p>
            {encReady && <p className="mt-0.5 text-xs" style={{ color: "#444" }}>chainId: {sepolia.id} · Sepolia · Public key loaded</p>}
          </div>
          <div className="flex items-center gap-2">
            {encLoading && <Spinner size={14} />}
            <span className="h-2 w-2 rounded-full" style={{ background: encReady ? Y : encLoading ? "#888" : "#f87171" }} />
          </div>
        </div>
      </Card>

      {/* ── Token address ── */}
      <Card>
        <Label>ERC-7984 Confidential Token Address</Label>
        <ZInput value={tokenAddress} onChange={setTokenAddress} placeholder="0x… (copy from Registry Explorer)" monospace />
        {tokenAddress && !isAddress(tokenAddress) && <p className="mt-1 text-xs text-red-400">Not a valid address</p>}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <div className="w-28">
            <Label>Decimals</Label>
            <ZInput value={decimals} onChange={setDecimals} placeholder="18" />
          </div>
          <p className="mt-4 text-xs" style={{ color: "#555" }}>Amounts × 10^decimals → raw token units</p>
        </div>
      </Card>

      {/* ── Recipients — manual rows + CSV toggle ── */}
      <Card>
        <div className="mb-2 flex items-center justify-between">
          <Label>Recipients</Label>
          <button onClick={() => setShowCsv(!showCsv)} className="text-xs transition-colors hover:opacity-80" style={{ color: showCsv ? Y : "#666" }}>
            {showCsv ? "Hide CSV import" : "Paste CSV"}
          </button>
        </div>

        {/* CSV import section */}
        {showCsv && (
          <div className="mb-4 space-y-2 rounded-xl p-3" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${CARD_BORDER}` }}>
            <Label>Paste CSV — format: address,amount,label</Label>
            <ZInput
              value={csvText}
              onChange={setCsvText}
              placeholder={"0xRecipient1,10,Alice\n0xRecipient2,20,Bob"}
              rows={5}
            />
            <div className="flex flex-wrap items-center gap-2">
              <YButton size="sm" variant="ghost" onClick={handleParseCsv} disabled={!csvText.trim()}>
                Parse CSV
              </YButton>
              {csvRows.length > 0 && !csvHasErrors && (
                <YButton size="sm" onClick={handleUseCsvRecipients}>
                  Use {csvRows.filter(r => r.validAddr && r.validAmt && !r.duplicate).length} recipients
                </YButton>
              )}
              {csvRows.length > 0 && csvHasErrors && (
                <span className="text-xs text-red-400">Fix errors below before importing</span>
              )}
            </div>

            {/* CSV preview table */}
            {csvRows.length > 0 && (
              <div className="mt-2 overflow-x-auto">
                <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${CARD_BORDER}` }}>
                      {["#", "Address", "Amount", "Label", "Status"].map(h => (
                        <th key={h} className="pb-1.5 pr-4 text-left font-semibold" style={{ color: "#555" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {csvRows.map((r, i) => {
                      const ok = r.validAddr && r.validAmt && !r.duplicate;
                      const statusColor = ok ? "#888" : "#f87171";
                      const statusMsg = !r.validAddr ? "Bad address" : !r.validAmt ? "Bad amount" : r.duplicate ? "Duplicate" : "OK";
                      return (
                        <tr key={i} style={{ borderBottom: `1px solid rgba(255,255,255,0.04)`, opacity: ok ? 1 : 0.7 }}>
                          <td className="py-1 pr-4" style={{ color: "#444" }}>{i + 1}</td>
                          <td className="py-1 pr-4 font-mono" style={{ color: r.validAddr ? "#ccc" : "#f87171" }}>
                            {r.address ? shortAddr(r.address) : "—"}
                          </td>
                          <td className="py-1 pr-4" style={{ color: r.validAmt ? "#ccc" : "#f87171" }}>{r.amount || "—"}</td>
                          <td className="py-1 pr-4" style={{ color: "#666" }}>{r.label || "—"}</td>
                          <td className="py-1" style={{ color: statusColor }}>{statusMsg}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Manual rows */}
        <div className="space-y-2">
          {rows.map((row, i) => (
            <div key={row.id} className="flex items-center gap-2">
              <span className="w-5 flex-shrink-0 text-xs" style={{ color: "#444" }}>{i + 1}</span>
              <div className="flex-1">
                <ZInput value={row.address} onChange={(v) => updateRow(row.id, "address", v)} placeholder="0x… recipient address" monospace />
              </div>
              <div className="w-28 flex-shrink-0">
                <ZInput value={row.amount} onChange={(v) => updateRow(row.id, "amount", v)} placeholder="Amount" />
              </div>
              <button onClick={() => removeRow(row.id)} disabled={rows.length <= 1} className="flex-shrink-0 rounded px-2 py-1 text-xs transition-colors disabled:opacity-30" style={{ color: "#555" }} title="Remove">✕</button>
            </div>
          ))}
        </div>
        <button onClick={addRow} className="mt-3 text-xs transition-colors hover:opacity-80" style={{ color: Y }}>+ Add recipient</button>
      </Card>

      {/* ── Campaign Summary ── */}
      {hasValidInputs && (
        <Card>
          <Label>Campaign Summary</Label>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 sm:grid-cols-4">
            {[
              ["Token", shortAddr(tokenAddress)],
              ["Recipients", `${validRows.length}`],
              ["Total", `${parseFloat(formatUnits(totalAmount, dec)).toFixed(4)}`],
              ["Mode", "direct · FHE-encrypted"],
            ].map(([k, v]) => (
              <div key={k}>
                <p className="text-xs" style={{ color: "#555" }}>{k}</p>
                <p className="mt-0.5 font-mono text-xs font-semibold text-white">{v}</p>
              </div>
            ))}
          </div>
          {preflight && (
            <div className="mt-3 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: preflight.ready ? Y : "#f87171" }} />
              <span className="text-xs" style={{ color: preflight.ready ? Y : "#f87171" }}>
                {preflight.ready ? "Ready to disperse" : "Not ready — see preflight below"}
              </span>
            </div>
          )}
        </Card>
      )}

      {/* ── Preflight ── */}
      {hasValidInputs && (
        <Card>
          <Label>Preflight Check</Label>
          {preflightLoading ? (
            <div className="flex items-center gap-2"><Spinner size={14} /><span className="text-xs" style={{ color: "#888" }}>Checking…</span></div>
          ) : preflightError ? (
            <p className="text-xs text-red-400">Preflight error: {preflightError.message.slice(0, 120)}</p>
          ) : preflight ? (
            <div className="space-y-1.5">
              {[
                ["Registered", preflight.isUserRegistered],
                ["Singleton approved (direct mode)", preflight.hasApprovedSingleton ?? false],
                ["Recipients valid", preflight.recipientChecks.every((r) => r.ok)],
                ["Amounts valid", preflight.amountsOk],
                ["Batch size ok", preflight.batchOk],
              ].map(([label, ok]) => (
                <div key={String(label)} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: ok ? Y : "#3d3d3d" }} />
                  <span className="text-xs" style={{ color: ok ? "#ddd" : "#555" }}>{String(label)}</span>
                </div>
              ))}
              {!preflight.ready && preflight.blockers?.length > 0 && (
                <div className="mt-2 rounded-lg px-3 py-2" style={{ background: "rgba(255,100,100,0.06)", border: "1px solid rgba(255,100,100,0.15)" }}>
                  <p className="text-xs font-semibold text-red-400">Blockers:</p>
                  {preflight.blockers.map((b, i) => <p key={i} className="mt-0.5 text-xs text-red-400/70">{b}</p>)}
                </div>
              )}
            </div>
          ) : null}
        </Card>
      )}

      {/* ── Allow Disperse guided card ── */}
      {hasValidInputs && preflight && preflight.hasApprovedSingleton === false && (
        <Card yellow>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <Label>Allow TokenOps Disperse</Label>
              <p className="text-sm font-semibold text-white">Operator approval required</p>
              <p className="mt-1.5 text-xs leading-relaxed" style={{ color: "#aaa" }}>
                Approve the TokenOps Disperse contract as an operator for this confidential token before sending private payouts.
              </p>
              <p className="mt-2 font-mono text-xs" style={{ color: "#666" }}>
                Operator: {DISPERSE_SINGLETON.slice(0, 10)}…{DISPERSE_SINGLETON.slice(-8)}
              </p>
            </div>
            <div className="flex-shrink-0">
              <YButton onClick={handleSetOperator} loading={opSigning || opConfirming} disabled={opSigning || opConfirming || opSuccess}>
                {opSigning ? "Confirm in wallet…" : opConfirming ? "Confirming…" : opSuccess ? "✓ Approved" : "Allow Disperse"}
              </YButton>
            </div>
          </div>
          {opSuccess && <p className="mt-3 text-xs text-emerald-400">✓ Operator approved. Rechecking preflight…</p>}
          {(opWriteError || opReceiptError) && (
            <div className="mt-3">
              <p className="text-xs text-red-400">{(opWriteError ?? opReceiptError)!.message.slice(0, 180)}</p>
              <button onClick={resetOp} className="mt-1.5 text-xs transition-colors hover:opacity-80" style={{ color: Y }}>Reset and try again</button>
            </div>
          )}
        </Card>
      )}

      {/* ── Actions ── */}
      <div className="flex flex-wrap items-center gap-3">

        {hasValidInputs && preflight && !preflight.isUserRegistered && (
          <div>
            <YButton variant="ghost" onClick={handleRegister} loading={registerMutation.isPending} disabled={!encReady || registerMutation.isPending}>
              Register wallet for this token
            </YButton>
            {registerMutation.isSuccess && <p className="mt-1 text-xs text-emerald-400">Registered successfully</p>}
            {registerMutation.isError && <p className="mt-1 text-xs text-red-400">{(registerMutation.error as Error).message.slice(0, 100)}</p>}
          </div>
        )}

        <div>
          <YButton onClick={handleDisperse} loading={disperseMutation.isPending} disabled={!encReady || !hasValidInputs || !preflight?.ready || disperseMutation.isPending}>
            {disperseMutation.isPending ? "Encrypting and sending…" : "Send Confidential Disperse"}
          </YButton>
          {!encReady && hasValidInputs && <p className="mt-1 text-xs" style={{ color: "#666" }}>Waiting for FHE encryptor: {encStatusLabel}</p>}
        </div>

      </div>

      {submitError && (
        <div className="rounded-xl px-4 py-3" style={{ background: "rgba(255,100,100,0.06)", border: "1px solid rgba(255,100,100,0.18)" }}>
          <p className="text-xs font-semibold text-red-400">Error</p>
          <p className="mt-1 text-xs text-red-400/70">{submitError}</p>
          <button onClick={() => setSubmitError(null)} className="mt-1.5 text-xs hover:opacity-70" style={{ color: "#666" }}>Dismiss</button>
        </div>
      )}

      {/* ── How it works ── */}
      <Card>
        <Label>How Confidential Disperse works</Label>
        <ul className="space-y-1">
          {[
            "Amounts are encrypted locally with Zama FHE before going on-chain",
            "Direct mode: sender must be approved as ERC-7984 operator on the token",
            "Only the Disperse singleton and each recipient can see their own amount",
            "Registration is a one-time on-chain setup per token per wallet",
            "Powered by @tokenops/sdk — Confidential Disperse singleton on Sepolia + Mainnet",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-xs" style={{ color: "#555" }}>
              <span style={{ color: Y, flexShrink: 0 }}>·</span>{item}
            </li>
          ))}
        </ul>
      </Card>

    </div>
  );
}
