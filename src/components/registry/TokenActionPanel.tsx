"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useAccount, useChainId, useSwitchChain, useReadContract } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import type { Address } from "viem";
import type { EnrichedPair } from "@/types/registry";
import { NETWORKS, SEPOLIA_CHAIN_ID, WRAPPER_ABI, shortAddress } from "@/lib/registry";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { useMintAction, useApproveAction, useWrapAction } from "@/hooks/useTokenActions";
import type { TxStatus } from "@/hooks/useTokenActions";
import { useWagmiEthers } from "@/hooks/useWagmiEthers";
import { useFhevm } from "@/lib/fhevm/react/useFhevm";
import { useInMemoryStorage } from "@/lib/fhevm/react/useInMemoryStorage";
import { useFHEDecrypt } from "@/lib/fhevm/react/useFHEDecrypt";
import { useUnwrapAction } from "@/hooks/useUnwrapAction";
import { VerificationDetails } from "./VerificationDetails";
import { Spinner } from "@/components/ui/Spinner";
import { explorerTxUrl, shortHash } from "@/lib/registry";

type Tab = "assets" | "approve" | "wrap" | "reveal" | "unwrap";

const MINT_AMOUNT_MULTIPLIER = 100n;
const ZERO_HANDLE = "0x" + "0".repeat(64);

// ─── TxButton ─────────────────────────────────────────────────────────────────
function TxButton({
  onClick,
  status,
  idleLabel,
  disabled,
}: {
  onClick: () => void;
  status: TxStatus;
  idleLabel: string;
  disabled?: boolean;
}) {
  const isActive = status === "signing" || status === "pending";
  const isSuccess = status === "success";

  return (
    <button
      onClick={onClick}
      disabled={disabled || isActive || isSuccess}
      className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all sm:w-auto sm:justify-start ${
        isSuccess
          ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 cursor-default"
          : isActive
          ? "border border-zinc-600/50 bg-zinc-800 text-zinc-400 cursor-wait"
          : disabled
          ? "border border-zinc-700/40 bg-zinc-800/40 text-zinc-600 cursor-not-allowed"
          : "border border-[#FFD208]/30 bg-[#FFD208]/8 text-[#FFD208] hover:bg-[#FFD208]/12 hover:border-[#FFD208]/50"
      }`}
    >
      {isActive && <Spinner size={14} />}
      {isSuccess
        ? "✓ Complete"
        : isActive
        ? status === "signing"
          ? "Confirm in wallet…"
          : "Confirming…"
        : idleLabel}
    </button>
  );
}

function AgainButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 rounded-lg border border-zinc-700/50 bg-zinc-800/50 px-3 py-2 text-sm font-medium text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-200"
    >
      {label}
    </button>
  );
}

function ErrorNote({ error }: { error: Error | null }) {
  if (!error) return null;
  const msg = error.message.length > 200 ? error.message.slice(0, 200) + "…" : error.message;
  return (
    <p className="mt-2 rounded bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-400">
      {msg}
    </p>
  );
}

function StringErrorNote({ error }: { error: string | null }) {
  if (!error) return null;
  const msg = error.length > 250 ? error.slice(0, 250) + "…" : error;
  return (
    <p className="mt-2 rounded bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-400">
      {msg}
    </p>
  );
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 whitespace-nowrap px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
        active
          ? "border-[#FFD208] text-[#FFD208]"
          : "border-transparent text-zinc-500 hover:text-zinc-300"
      }`}
    >
      {label}
    </button>
  );
}

interface Props {
  pair: EnrichedPair;
  initialTab?: Tab;
  onClose: () => void;
}

export function TokenActionPanel({ pair, initialTab = "assets", onClose }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [wrapAmountInput, setWrapAmountInput] = useState("");
  const [unwrapAmountInput, setUnwrapAmountInput] = useState("");

  const { address: userAddress, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const network = NETWORKS[pair.networkKey];
  const isOnCorrectChain = chainId === SEPOLIA_CHAIN_ID;

  const decimals = pair.token?.decimals ?? 18;
  const wrapperDecimals = pair.confidentialToken?.decimals ?? decimals;
  const tokenSymbol = pair.token?.symbol ?? "TOKEN";
  const wrapperSymbol = pair.confidentialToken?.symbol ?? "cTOKEN";

  // ── ERC-20 balance + allowance ──────────────────────────────────────────────
  const { balance, allowance, isLoading: balLoading, refetch: refetchBals } = useTokenBalances({
    tokenAddress: pair.tokenAddress,
    wrapperAddress: pair.confidentialTokenAddress,
    userAddress,
    chainId: network.chainId,
    enabled: isConnected && isOnCorrectChain,
  });

  // ── Write actions ───────────────────────────────────────────────────────────
  const mintAction = useMintAction(pair.tokenAddress);
  const approveAction = useApproveAction(pair.tokenAddress);
  const wrapAction = useWrapAction(pair.confidentialTokenAddress);

  // ── Private Reveal hooks (always called, enabled conditionally) ─────────────
  const { ethersSigner, eip1193Provider } = useWagmiEthers();
  const { storage: fhevmStorage } = useInMemoryStorage();

  // Must pass the raw EIP-1193 provider (connector.getProvider() / window.ethereum),
  // NOT ethers.BrowserProvider — BrowserProvider has no .request() method.
  const { instance: fhevmInstance, status: fhevmStatus, error: fhevmInitError } = useFhevm({
    provider: eip1193Provider as Parameters<typeof useFhevm>[0]["provider"],
    chainId,
    enabled: isConnected && isOnCorrectChain && !!eip1193Provider,
  });

  // Read the encrypted balance handle from the wrapper contract
  const { data: rawHandle, isLoading: handleLoading, refetch: refetchHandle } = useReadContract({
    address: pair.confidentialTokenAddress,
    abi: WRAPPER_ABI,
    functionName: "confidentialBalanceOf",
    args: [userAddress ?? ("0x0000000000000000000000000000000000000000" as Address)],
    chainId: network.chainId,
    query: { enabled: isConnected && isOnCorrectChain && !!userAddress },
  });

  const confidentialHandle = rawHandle as `0x${string}` | undefined;
  const hasHandle = !!confidentialHandle && confidentialHandle !== ZERO_HANDLE;

  const decryptRequests = useMemo(() => {
    if (!hasHandle || !confidentialHandle) return undefined;
    return [
      { handle: confidentialHandle as string, contractAddress: pair.confidentialTokenAddress },
    ] as const;
  }, [hasHandle, confidentialHandle, pair.confidentialTokenAddress]);

  const {
    canDecrypt,
    decrypt,
    isDecrypting,
    message: decryptMsg,
    results: decryptResults,
    error: decryptError,
  } = useFHEDecrypt({
    instance: fhevmInstance,
    ethersSigner: ethersSigner ?? undefined,
    fhevmDecryptionSignatureStorage: fhevmStorage,
    chainId,
    requests: decryptRequests,
  });

  // Derive plaintext balance from results
  const decryptedValue: bigint | undefined = useMemo(() => {
    if (!confidentialHandle) return undefined;
    const val = decryptResults[confidentialHandle as string];
    if (typeof val === "bigint") return val;
    if (typeof val === "string" || typeof val === "number") {
      try { return BigInt(val); } catch { return undefined; }
    }
    return undefined;
  }, [confidentialHandle, decryptResults]);

  const isRevealed = decryptedValue !== undefined;

  // ── Unwrap action hook ─────────────────────────────────────────────────────
  const unwrapAmountParsed: bigint | null = (() => {
    try {
      if (!unwrapAmountInput || parseFloat(unwrapAmountInput) <= 0) return null;
      return parseUnits(unwrapAmountInput, wrapperDecimals);
    } catch { return null; }
  })();

  const {
    state: unwrapState,
    startUnwrap,
    finalizeUnwrap,
    reset: resetUnwrap,
    unwrapTxHash,
    finalizeTxHash,
  } = useUnwrapAction({
    pair,
    amount: unwrapAmountParsed,
    userAddress,
    fhevmInstance,
    chainId,
  });

  // ── Derived ERC-20 display values ───────────────────────────────────────────
  const balanceDisplay = formatUnits(balance, decimals);
  const allowanceDisplay = formatUnits(allowance, decimals);

  const wrapAmountParsed: bigint | null = (() => {
    try {
      if (!wrapAmountInput || parseFloat(wrapAmountInput) <= 0) return null;
      return parseUnits(wrapAmountInput, decimals);
    } catch { return null; }
  })();

  const isAllowanceSufficient = wrapAmountParsed !== null && allowance >= wrapAmountParsed;

  const handleMint = useCallback(() => {
    if (!userAddress) return;
    mintAction.mint(userAddress, MINT_AMOUNT_MULTIPLIER * 10n ** BigInt(decimals));
  }, [userAddress, decimals, mintAction]);

  const handleApprove = useCallback(() => {
    if (!userAddress || !wrapAmountParsed) return;
    approveAction.approve(pair.confidentialTokenAddress, wrapAmountParsed);
  }, [userAddress, wrapAmountParsed, pair.confidentialTokenAddress, approveAction]);

  const handleWrap = useCallback(() => {
    if (!userAddress || !wrapAmountParsed) return;
    wrapAction.wrap(userAddress, wrapAmountParsed);
  }, [userAddress, wrapAmountParsed, wrapAction]);

  // ── Refresh after successful operations (useEffect, not render body) ─────────
  useEffect(() => {
    if (
      mintAction.status === "success" ||
      approveAction.status === "success" ||
      wrapAction.status === "success"
    ) {
      void refetchBals();
    }
  // refetchBals is stable — omitting from deps is intentional
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mintAction.status, approveAction.status, wrapAction.status]);

  useEffect(() => {
    if (wrapAction.status === "success" || unwrapState.step === "complete") {
      void refetchHandle();
      // Also refresh the ERC-20 balance after unwrap completes
      if (unwrapState.step === "complete") void refetchBals();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wrapAction.status, unwrapState.step]);

  // ── Rate helper ────────────────────────────────────────────────────────────
  const rateLabel: string | null = useMemo(() => {
    if (pair.rate == null) return null;
    if (pair.rate === 1n) return null; // 1:1, not worth showing
    return `1 ${wrapperSymbol} = ${pair.rate.toString()} ${tokenSymbol}`;
  }, [pair.rate, tokenSymbol, wrapperSymbol]);

  return (
    <div className="rounded-xl border border-zinc-700/40 bg-zinc-900/70 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/60 px-5 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-white">
            {tokenSymbol} → {wrapperSymbol}
          </span>
          <span className="rounded border border-zinc-700/50 bg-zinc-800/60 px-2 py-0.5 text-xs text-zinc-500">
            {network.shortName}
          </span>
          {rateLabel && (
            <span className="rounded border border-zinc-700/40 bg-zinc-800/30 px-2 py-0.5 text-xs text-zinc-600">
              Rate: {rateLabel}
            </span>
          )}
        </div>
        <button onClick={onClose} className="ml-2 flex-shrink-0 rounded p-1 text-zinc-500 hover:text-zinc-200 transition-colors" aria-label="Close panel">
          ✕
        </button>
      </div>

      {/* Wallet guard */}
      {!isConnected ? (
        <div className="px-5 py-8 text-center">
          <p className="text-sm text-zinc-400">Connect your wallet to continue.</p>
          <p className="mt-1 text-xs text-zinc-600">Use the Connect Wallet button in the top nav.</p>
        </div>
      ) : !isOnCorrectChain ? (
        <div className="px-5 py-8 text-center">
          <p className="text-sm text-zinc-400">Switch to Sepolia to use write actions.</p>
          <button
            onClick={() => switchChain({ chainId: SEPOLIA_CHAIN_ID })}
            className="mt-3 rounded-lg border px-4 py-2 text-sm font-medium transition-colors" style={{ borderColor: "rgba(255,210,8,0.35)", background: "rgba(255,210,8,0.10)", color: "#FFD208" }}
          >
            Switch to Sepolia
          </button>
        </div>
      ) : (
        <>
          {/* Tabs — horizontally scrollable on narrow screens */}
          <div className="flex overflow-x-auto border-b border-zinc-800/60 px-5"
               style={{ scrollbarWidth: "none" }}>
            <TabButton label="Test Assets"    active={activeTab === "assets"}  onClick={() => setActiveTab("assets")} />
            <TabButton label="Approve"        active={activeTab === "approve"} onClick={() => setActiveTab("approve")} />
            <TabButton label="Wrap"           active={activeTab === "wrap"}    onClick={() => setActiveTab("wrap")} />
            <TabButton label="Private Reveal" active={activeTab === "reveal"}  onClick={() => setActiveTab("reveal")} />
            <TabButton label="Unwrap"         active={activeTab === "unwrap"}  onClick={() => setActiveTab("unwrap")} />
          </div>

          <div className="px-5 py-5">

            {/* ── Test Assets ── */}
            {activeTab === "assets" && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">Test Assets</p>
                <p className="text-xs text-zinc-500 mb-3">
                  Mint{" "}
                  <span className="font-medium text-zinc-300">{MINT_AMOUNT_MULTIPLIER.toString()} {tokenSymbol}</span>{" "}
                  to your wallet on Sepolia. Official Zama testnet tokens only.
                </p>
                <div className="mb-4 flex flex-wrap items-center gap-4 rounded-lg border border-zinc-700/40 bg-zinc-800/30 px-3 py-2.5">
                  <div>
                    <p className="text-xs text-zinc-600">Wallet</p>
                    <p className="text-xs font-mono text-zinc-400">{shortAddress(userAddress!)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-600">Current balance</p>
                    <p className="text-xs text-zinc-200">{balLoading ? "…" : `${parseFloat(balanceDisplay).toFixed(4)} ${tokenSymbol}`}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-600">Underlying token</p>
                    <a href={`${network.explorerBaseUrl}/address/${pair.tokenAddress}`} target="_blank" rel="noopener noreferrer" className="text-xs font-mono hover:underline" style={{ color: "#FFD208" }}>
                      {shortAddress(pair.tokenAddress)}
                    </a>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <TxButton onClick={handleMint} status={mintAction.status} idleLabel={`Mint ${MINT_AMOUNT_MULTIPLIER.toString()} ${tokenSymbol}`} />
                  {mintAction.status === "success" && <AgainButton label="Mint again" onClick={mintAction.reset} />}
                </div>
                <ErrorNote error={mintAction.error as Error | null} />
                {mintAction.status === "success" && mintAction.hash && (
                  <VerificationDetails action="Mint" network={network.name} explorerBaseUrl={network.explorerBaseUrl}
                    tokenAddress={pair.tokenAddress} tokenSymbol={tokenSymbol}
                    wrapperAddress={pair.confidentialTokenAddress} wrapperSymbol={wrapperSymbol}
                    txHash={mintAction.hash} />
                )}
              </div>
            )}

            {/* ── Approve ── */}
            {activeTab === "approve" && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">Approve Wrapper</p>
                <p className="text-xs text-zinc-500 mb-3">
                  Authorize the ERC-7984 wrapper to spend your <span className="text-zinc-300">{tokenSymbol}</span>.
                </p>
                <div className="mb-4 flex flex-wrap items-center gap-4 rounded-lg border border-zinc-700/40 bg-zinc-800/30 px-3 py-2.5">
                  <div>
                    <p className="text-xs text-zinc-600">Your balance</p>
                    <p className="text-xs text-zinc-200">{balLoading ? "…" : `${parseFloat(balanceDisplay).toFixed(4)} ${tokenSymbol}`}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-600">Current allowance</p>
                    <p className="text-xs text-zinc-200">{balLoading ? "…" : `${parseFloat(allowanceDisplay).toFixed(4)} ${tokenSymbol}`}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-600">Spender</p>
                    <a href={`${network.explorerBaseUrl}/address/${pair.confidentialTokenAddress}`} target="_blank" rel="noopener noreferrer" className="text-xs font-mono hover:underline" style={{ color: "#FFD208" }}>
                      {shortAddress(pair.confidentialTokenAddress)}
                    </a>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="mb-1.5 block text-xs text-zinc-500">Amount to approve ({tokenSymbol})</label>
                  <input type="number" min="0" step="any" value={wrapAmountInput} onChange={(e) => setWrapAmountInput(e.target.value)}
                    placeholder="0.0" className="w-full rounded-lg border border-zinc-700/50 bg-zinc-800/60 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-[#FFD208]/30" />
                  {!wrapAmountInput && <p className="mt-1 text-xs text-zinc-600">Enter an amount to approve.</p>}
                </div>
                {isAllowanceSufficient ? (
                  <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <p className="text-xs text-emerald-400">Allowance is sufficient — proceed to Wrap.</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <TxButton onClick={handleApprove} status={approveAction.status} idleLabel={`Approve ${wrapAmountInput || "…"} ${tokenSymbol}`} disabled={!wrapAmountParsed} />
                    {approveAction.status === "success" && <AgainButton label="Approve again" onClick={approveAction.reset} />}
                  </div>
                )}
                <ErrorNote error={approveAction.error as Error | null} />
                {approveAction.status === "success" && approveAction.hash && (
                  <VerificationDetails action="Approve" network={network.name} explorerBaseUrl={network.explorerBaseUrl}
                    tokenAddress={pair.tokenAddress} tokenSymbol={tokenSymbol}
                    wrapperAddress={pair.confidentialTokenAddress} wrapperSymbol={wrapperSymbol}
                    txHash={approveAction.hash} />
                )}
              </div>
            )}

            {/* ── Wrap ── */}
            {activeTab === "wrap" && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">Wrap into ERC-7984</p>
                <p className="text-xs text-zinc-500 mb-3">
                  Convert <span className="text-zinc-300">{tokenSymbol}</span> into encrypted{" "}
                  <span className="text-zinc-300">{wrapperSymbol}</span>. Ensure allowance covers the amount first.
                </p>
                <div className="mb-4 flex flex-wrap items-center gap-4 rounded-lg border border-zinc-700/40 bg-zinc-800/30 px-3 py-2.5">
                  <div>
                    <p className="text-xs text-zinc-600">Your balance</p>
                    <p className="text-xs text-zinc-200">{balLoading ? "…" : `${parseFloat(balanceDisplay).toFixed(4)} ${tokenSymbol}`}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-600">Allowance</p>
                    <p className={`text-xs ${isAllowanceSufficient ? "text-emerald-400" : "text-amber-400"}`}>
                      {balLoading ? "…" : `${parseFloat(allowanceDisplay).toFixed(4)} ${tokenSymbol}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-600">Wrapper rate</p>
                    <p className="text-xs text-zinc-400">{pair.rate != null ? pair.rate.toString() : "Unavailable"}</p>
                  </div>
                </div>
                {pair.rate != null && (
                  <p className="mb-3 text-xs text-zinc-600">Amounts may be rounded according to the wrapper rate.</p>
                )}
                <div className="mb-3">
                  <label className="mb-1.5 block text-xs text-zinc-500">Amount to wrap ({tokenSymbol})</label>
                  <input type="number" min="0" step="any" value={wrapAmountInput} onChange={(e) => setWrapAmountInput(e.target.value)}
                    placeholder="0.0" className="w-full rounded-lg border border-zinc-700/50 bg-zinc-800/60 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-[#FFD208]/30" />
                </div>
                {!isAllowanceSufficient && wrapAmountParsed !== null && (
                  <p className="mb-3 text-xs text-amber-500">Insufficient allowance. Approve at least {wrapAmountInput} {tokenSymbol} first.</p>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <TxButton onClick={handleWrap} status={wrapAction.status} idleLabel={`Wrap ${wrapAmountInput || "…"} ${tokenSymbol}`} disabled={!wrapAmountParsed || !isAllowanceSufficient} />
                  {wrapAction.status === "success" && <AgainButton label="Wrap again" onClick={wrapAction.reset} />}
                </div>
                <ErrorNote error={wrapAction.error as Error | null} />
                {wrapAction.status === "success" && wrapAction.hash && (
                  <>
                    <VerificationDetails action="Wrap" network={network.name} explorerBaseUrl={network.explorerBaseUrl}
                      tokenAddress={pair.tokenAddress} tokenSymbol={tokenSymbol}
                      wrapperAddress={pair.confidentialTokenAddress} wrapperSymbol={wrapperSymbol}
                      txHash={wrapAction.hash} />
                    <div className="mt-3 flex items-center gap-2 rounded-lg border px-3 py-2.5" style={{ borderColor: "rgba(255,210,8,0.18)", background: "rgba(255,210,8,0.05)" }}>
                      <span className="text-sm" style={{ color: "#FFD208" }}>◎</span>
                      <p className="text-xs text-zinc-400">
                        Wrapped successfully. Use the <strong style={{ color: "#FFD208" }}>Private Reveal</strong> tab to decrypt your confidential balance.
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── Private Reveal ── */}
            {activeTab === "reveal" && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">Private Reveal</p>
                <p className="text-xs text-zinc-500 mb-3">
                  Decrypt your encrypted <span className="text-zinc-300">{wrapperSymbol}</span> balance.
                  Your wallet signs a one-time EIP-712 request — the plaintext never leaves your device.
                </p>

                {/* Smart wallet warning */}
                <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2.5">
                  <span className="mt-0.5 flex-shrink-0 text-amber-400">⚠</span>
                  <p className="text-xs text-amber-400/80">
                    Private Reveal works best with standard EOA wallets like MetaMask.
                    Smart wallets may not support this signature flow.
                  </p>
                </div>

                {/* Info card: handle + FHE status */}
                <div className="mb-4 flex flex-wrap items-start gap-4 rounded-lg border border-zinc-700/40 bg-zinc-800/30 px-3 py-2.5">
                  <div>
                    <p className="text-xs text-zinc-600">Wallet</p>
                    <p className="text-xs font-mono text-zinc-400">{shortAddress(userAddress!)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-600">Encrypted handle</p>
                    <p className="text-xs font-mono text-zinc-400">
                      {handleLoading
                        ? "…"
                        : hasHandle
                        ? `${confidentialHandle!.slice(0, 10)}…${confidentialHandle!.slice(-6)}`
                        : <span className="text-zinc-600 not-italic">None — wrap first</span>}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-600">FHE SDK</p>
                    <p className={`text-xs ${
                      fhevmStatus === "ready" ? "text-emerald-400"
                      : fhevmStatus === "loading" ? "text-[#FFD208]"
                      : fhevmStatus === "error" ? "text-red-400"
                      : "text-zinc-600"
                    }`}>
                      {fhevmStatus === "idle" ? "Idle"
                        : fhevmStatus === "loading" ? "Initialising…"
                        : fhevmStatus === "ready" ? "Ready"
                        : "Error"}
                    </p>
                  </div>
                </div>

                {/* FHE init error */}
                {fhevmStatus === "error" && fhevmInitError && (
                  <p className="mb-3 rounded bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-400">
                    FHE SDK failed to initialise: {fhevmInitError.message}
                  </p>
                )}

                {/* No handle state */}
                {!hasHandle && !handleLoading && (
                  <div className="mb-3 flex items-center gap-2 rounded-lg border border-zinc-700/40 bg-zinc-800/20 px-3 py-2.5">
                    <span className="text-zinc-600 text-sm">◎</span>
                    <p className="text-xs text-zinc-500">
                      No confidential balance found. Wrap tokens first using the <strong className="text-zinc-300">Wrap</strong> tab.
                    </p>
                  </div>
                )}

                {/* Decrypt button */}
                {hasHandle && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={decrypt}
                      disabled={!canDecrypt || isDecrypting || fhevmStatus !== "ready"}
                      className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                        isRevealed
                          ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 cursor-default"
                          : isDecrypting
                          ? "border border-zinc-600/50 bg-zinc-800 text-zinc-400 cursor-wait"
                          : !canDecrypt || fhevmStatus !== "ready"
                          ? "border border-zinc-700/40 bg-zinc-800/40 text-zinc-600 cursor-not-allowed"
                          : "border border-[#FFD208]/30 bg-[#FFD208]/8 text-[#FFD208] hover:bg-[#FFD208]/12"
                      }`}
                    >
                      {isDecrypting && <Spinner size={14} />}
                      {isRevealed
                        ? "✓ Revealed"
                        : isDecrypting
                        ? decryptMsg || "Decrypting…"
                        : fhevmStatus === "loading"
                        ? "Initialising FHE…"
                        : "Reveal privately"}
                    </button>
                  </div>
                )}

                {/* Decryption progress message */}
                {isDecrypting && decryptMsg && (
                  <p className="mt-2 text-xs" style={{ color: "rgba(255,210,8,0.75)" }}>{decryptMsg}</p>
                )}

                {/* Error + Try again */}
                <StringErrorNote error={decryptError} />
                {decryptError && (
                  <button
                    onClick={decrypt}
                    disabled={!canDecrypt}
                    className="mt-2 text-xs text-zinc-500 hover:text-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Try again
                  </button>
                )}

                {/* Revealed balance */}
                {isRevealed && decryptedValue !== undefined && (
                  <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-4">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-emerald-400">
                      Confidential Balance
                    </p>
                    <p className="text-2xl font-bold text-white tabular-nums">
                      {parseFloat(formatUnits(decryptedValue, wrapperDecimals)).toFixed(4)}{" "}
                      <span className="text-lg" style={{ color: "#FFD208" }}>{wrapperSymbol}</span>
                    </p>
                    <p className="mt-2 text-xs text-zinc-500">
                      Visible only to you. Plaintext is not stored on-chain.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ── Unwrap ── */}
            {activeTab === "unwrap" && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">Unwrap ERC-7984 → ERC-20</p>
                <p className="text-xs text-zinc-500 mb-3">
                  Return your confidential <span className="text-zinc-300">{wrapperSymbol}</span> tokens to
                  underlying <span className="text-zinc-300">{tokenSymbol}</span>.
                  This is a two-step process using Zama Gateway public decryption.
                </p>

                {/* Smart wallet warning */}
                <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2.5">
                  <span className="mt-0.5 flex-shrink-0 text-amber-400">⚠</span>
                  <p className="text-xs text-amber-400/80">
                    Works best with standard EOA wallets (MetaMask).
                    Smart wallets may not support the required signature flow.
                  </p>
                </div>

                {/* Empty state — no confidential balance yet */}
                {fhevmStatus === "ready" && !hasHandle && !handleLoading && unwrapState.step === "idle" && (
                  <div className="mb-3 flex items-center gap-2 rounded-lg border border-zinc-700/40 bg-zinc-800/20 px-3 py-2.5">
                    <span className="text-zinc-600 text-sm">◎</span>
                    <p className="text-xs text-zinc-500">
                      Nothing to unwrap yet. Wrap tokens first using the{" "}
                      <button className="text-zinc-300 underline" onClick={() => setActiveTab("wrap")}>Wrap</button>{" "}
                      tab, then come back here.
                    </p>
                  </div>
                )}

                {/* FHE SDK status */}
                {fhevmStatus !== "ready" && (
                  <div className="mb-4 flex items-center gap-2 rounded-lg border border-zinc-700/40 bg-zinc-800/30 px-3 py-2.5">
                    <span className={`text-xs ${fhevmStatus === "loading" ? "text-[#FFD208]" : fhevmStatus === "error" ? "text-red-400" : "text-zinc-600"}`}>
                      FHE SDK: {fhevmStatus === "loading" ? "Initialising…" : fhevmStatus === "error" ? "Error" : "Idle"}
                    </span>
                    {fhevmStatus === "loading" && <Spinner size={12} />}
                  </div>
                )}
                {fhevmStatus === "error" && fhevmInitError && (
                  <p className="mb-3 rounded bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-400">
                    FHE SDK failed to initialise: {fhevmInitError.message}
                  </p>
                )}

                {/* Idle: amount input */}
                {(unwrapState.step === "idle" || unwrapState.step === "error") && (
                  <div>
                    {pair.rate != null && pair.rate > 1n && (
                      <p className="mb-2 text-xs text-zinc-600">
                        Rate: 1 {wrapperSymbol} = {pair.rate.toString()} {tokenSymbol}.
                        Unwrap uses wrapper token units.
                      </p>
                    )}
                    <div className="mb-3">
                      <label className="mb-1.5 block text-xs text-zinc-500">
                        Amount to unwrap ({wrapperSymbol})
                      </label>
                      <input
                        type="number" min="0" step="any"
                        value={unwrapAmountInput}
                        onChange={(e) => setUnwrapAmountInput(e.target.value)}
                        placeholder="0.0"
                        disabled={fhevmStatus !== "ready"}
                        className="w-full rounded-lg border border-zinc-700/50 bg-zinc-800/60 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-[#FFD208]/25 disabled:opacity-50"
                      />
                    </div>
                    {unwrapState.step === "error" && unwrapState.errorMessage && (
                      <p className="mb-3 rounded bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-400">
                        {unwrapState.errorMessage}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => void startUnwrap()}
                        disabled={!unwrapAmountParsed || fhevmStatus !== "ready"}
                        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                          !unwrapAmountParsed || fhevmStatus !== "ready"
                            ? "border border-zinc-700/40 bg-zinc-800/40 text-zinc-600 cursor-not-allowed"
                            : "border border-[#FFD208]/30 bg-[#FFD208]/8 text-[#FFD208] hover:bg-[#FFD208]/12"
                        }`}
                      >
                        Start Unwrap
                      </button>
                      {unwrapState.step === "error" && (
                        <button onClick={resetUnwrap} className="text-xs text-zinc-500 hover:text-zinc-300">
                          Reset
                        </button>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-zinc-600">
                      Unwrap uses Zama Gateway public decryption and may take time.
                    </p>
                  </div>
                )}

                {/* In-progress states: encrypt → sign → confirm → gateway */}
                {(unwrapState.step === "encrypting" ||
                  unwrapState.step === "signing" ||
                  unwrapState.step === "confirming" ||
                  unwrapState.step === "awaiting_gateway") && (() => {
                  const s = unwrapState.step;
                  const done = (step: typeof s, current: typeof s) =>
                    ["encrypting","signing","confirming","awaiting_gateway"].indexOf(step) <
                    ["encrypting","signing","confirming","awaiting_gateway"].indexOf(current);
                  const active = (step: typeof s) => step === s;
                  return (
                    <div className="space-y-3">
                      <div className="flex flex-col gap-2">
                        {(["encrypting","signing","confirming","awaiting_gateway"] as const).map((step, i) => {
                          const labels: Record<string, string> = {
                            encrypting: "Encrypting amount",
                            signing: "Confirm in wallet",
                            confirming: "Transaction confirming",
                            awaiting_gateway: "Zama Gateway decryption",
                          };
                          const isDone = done(step, s);
                          const isActive = active(step);
                          return (
                            <div key={step} className="flex items-center gap-2 rounded-lg border px-3 py-2.5 transition-colors"
                              style={isActive ? { borderColor: "rgba(255,210,8,0.28)", background: "rgba(255,210,8,0.06)" }
                                : isDone ? { borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }
                                : { borderColor: "rgba(255,255,255,0.05)", opacity: 0.4 }}>
                              <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
                                style={{ background: isDone ? "#22c55e" : isActive ? "#FFD208" : "#3d3d3d",
                                         animation: isActive ? "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite" : undefined }} />
                              <span className={`text-xs ${isActive ? "text-zinc-200" : isDone ? "text-zinc-400" : "text-zinc-600"}`}>
                                {i + 1}. {labels[step]}
                              </span>
                              {isActive && <Spinner size={12} />}
                            </div>
                          );
                        })}
                      </div>

                      {/* Debug details — always visible during in-progress */}
                      <div className="rounded-lg border border-zinc-700/30 bg-zinc-900/40 px-3 py-2.5 space-y-1.5">
                        <p className="text-xs text-zinc-600">
                          State: <span className="text-zinc-400 font-mono">{unwrapState.step}</span>
                        </p>
                        {unwrapTxHash ? (
                          <p className="text-xs text-zinc-600">
                            Tx:{" "}
                            <a href={explorerTxUrl(network.explorerBaseUrl, unwrapTxHash)} target="_blank" rel="noopener noreferrer" className="font-mono hover:underline" style={{ color: "#FFD208" }}>
                              {shortHash(unwrapTxHash)}
                            </a>
                          </p>
                        ) : (
                          <p className="text-xs text-zinc-600">Tx: waiting for hash…</p>
                        )}
                        {unwrapState.unwrapRequestId && (
                          <p className="text-xs text-zinc-600">
                            Request ID:{" "}
                            <span className="font-mono text-zinc-400">
                              {unwrapState.unwrapRequestId.slice(0, 12)}…{unwrapState.unwrapRequestId.slice(-8)}
                            </span>
                          </p>
                        )}
                        {unwrapState.step === "awaiting_gateway" && (
                          <p className="text-xs text-zinc-600">
                            Gateway may take 10–60 s depending on Zama relayer load.
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Finalize ready */}
                {unwrapState.step === "finalize_ready" && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <p className="text-xs text-emerald-400">
                        Gateway decrypted:{" "}
                        <span className="font-semibold text-emerald-300">
                          {formatUnits(unwrapState.clearAmount ?? 0n, wrapperDecimals)} {wrapperSymbol}
                        </span>
                      </p>
                    </div>
                    <p className="text-xs text-zinc-500">
                      Click to finalise and receive{" "}
                      <span className="text-zinc-300">
                        {pair.rate != null
                          ? `${formatUnits((unwrapState.clearAmount ?? 0n) * pair.rate, decimals)} ${tokenSymbol}`
                          : `${formatUnits(unwrapState.clearAmount ?? 0n, decimals)} ${tokenSymbol}`}
                      </span>.
                    </p>
                    <button
                      onClick={finalizeUnwrap}
                      className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all" style={{ borderColor: "rgba(255,210,8,0.35)", background: "rgba(255,210,8,0.10)", color: "#FFD208" }}
                    >
                      Finalize Unwrap
                    </button>
                  </div>
                )}

                {/* Finalizing / finalize confirming */}
                {(unwrapState.step === "finalizing" || unwrapState.step === "finalize_confirming") && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 rounded-lg border px-3 py-3" style={{ borderColor: "rgba(255,210,8,0.18)", background: "rgba(255,210,8,0.04)" }}>
                      <Spinner size={14} />
                      <p className="text-xs" style={{ color: "#FFD208" }}>
                        {unwrapState.step === "finalizing" ? "Confirm in wallet…" : "Finalizing transaction confirming…"}
                      </p>
                    </div>
                    {finalizeTxHash && (
                      <p className="text-xs text-zinc-600">
                        Tx:{" "}
                        <a href={explorerTxUrl(network.explorerBaseUrl, finalizeTxHash)} target="_blank" rel="noopener noreferrer" className="font-mono hover:underline" style={{ color: "#FFD208" }}>
                          {shortHash(finalizeTxHash)}
                        </a>
                      </p>
                    )}
                  </div>
                )}

                {/* Complete */}
                {unwrapState.step === "complete" && (
                  <>
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-4">
                      <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-emerald-400">
                        Unwrap Complete
                      </p>
                      <p className="text-2xl font-bold text-white tabular-nums">
                        {pair.rate != null
                          ? `${parseFloat(formatUnits((unwrapState.clearAmount ?? 0n) * pair.rate, decimals)).toFixed(4)}`
                          : `${parseFloat(formatUnits(unwrapState.clearAmount ?? 0n, decimals)).toFixed(4)}`}{" "}
                        <span className="text-lg text-zinc-300">{tokenSymbol}</span>
                      </p>
                      <p className="mt-2 text-xs text-zinc-500">
                        ERC-20 tokens released to your wallet.
                      </p>
                    </div>

                    {unwrapTxHash && finalizeTxHash && (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <div className="rounded-lg border border-zinc-700/40 bg-zinc-800/30 px-3 py-2">
                          <p className="text-xs text-zinc-600">Unwrap tx</p>
                          <a href={explorerTxUrl(network.explorerBaseUrl, unwrapTxHash)} target="_blank" rel="noopener noreferrer" className="font-mono text-xs hover:underline" style={{ color: "#FFD208" }}>{shortHash(unwrapTxHash)}</a>
                        </div>
                        <div className="rounded-lg border border-zinc-700/40 bg-zinc-800/30 px-3 py-2">
                          <p className="text-xs text-zinc-600">Finalize tx</p>
                          <a href={explorerTxUrl(network.explorerBaseUrl, finalizeTxHash)} target="_blank" rel="noopener noreferrer" className="font-mono text-xs hover:underline" style={{ color: "#FFD208" }}>{shortHash(finalizeTxHash)}</a>
                        </div>
                      </div>
                    )}

                    <button onClick={resetUnwrap} className="mt-3 text-xs text-zinc-500 hover:text-zinc-300">
                      Unwrap again
                    </button>
                  </>
                )}
              </div>
            )}

          </div>
        </>
      )}
    </div>
  );
}
