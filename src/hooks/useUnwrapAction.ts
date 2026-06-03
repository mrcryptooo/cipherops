"use client";
// Two-step unwrap lifecycle for ERC-7984 confidential tokens.
//
// Flow:
//   1. Encrypt amount with instance.createEncryptedInput().add64().encrypt()
//   2. Call unwrap(from, to, handles[0], inputProof) → UnwrapRequested event
//   3. Call instance.publicDecrypt([unwrapRequestId]) → gateway decrypts
//   4. Call finalizeUnwrap(requestId, clearAmount, decryptionProof)

import { useState, useEffect, useCallback, useRef } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { decodeEventLog, bytesToHex } from "viem";
import type { Address } from "viem";
import type { EnrichedPair } from "@/types/registry";
import { WRAPPER_ABI } from "@/lib/registry";
import type { FhevmInstance } from "@/lib/fhevm/fhevmTypes";

// ─── Hex normalisation ────────────────────────────────────────────────────────
// The relayer-SDK's encrypt() returns Uint8Array values, not 0x-prefixed strings.
// Viem's writeContract needs hex strings; this helper ensures the conversion.

function normalizeHex(value: unknown): `0x${string}` {
  if (typeof value === "string") {
    if (value.startsWith("0x")) return value as `0x${string}`;
    // bare hex string without prefix
    return `0x${value}` as `0x${string}`;
  }
  if (value instanceof Uint8Array) {
    return bytesToHex(value);
  }
  if (Array.isArray(value) && value.every((b) => typeof b === "number")) {
    return bytesToHex(new Uint8Array(value as number[]));
  }
  // Some SDK versions wrap the bytes in an object with a data/bytes/hex property
  if (value !== null && typeof value === "object") {
    const v = value as Record<string, unknown>;
    if (v.data instanceof Uint8Array) return bytesToHex(v.data);
    if (typeof v.hex === "string") return normalizeHex(v.hex);
    if (typeof v.bytes !== "undefined") return normalizeHex(v.bytes);
  }
  throw new Error(
    `Expected hex bytes for unwrap argument, got ${
      value instanceof Uint8Array ? "Uint8Array" : typeof value
    }`
  );
}

// ─── State ────────────────────────────────────────────────────────────────────

export type UnwrapStep =
  | "idle"
  | "encrypting"
  | "signing"        // wallet prompt open
  | "confirming"     // tx in mempool
  | "awaiting_gateway"
  | "finalize_ready"
  | "finalizing"
  | "finalize_confirming"
  | "complete"
  | "error";

export interface UnwrapState {
  step: UnwrapStep;
  unwrapRequestId?: `0x${string}`;
  clearAmount?: bigint;
  decryptionProof?: `0x${string}`;
  errorMessage?: string;
}

function errorMsg(err: unknown): string {
  if (!err) return "Unknown error";
  if (typeof err === "object" && "shortMessage" in err) return String((err as {shortMessage: string}).shortMessage);
  if (err instanceof Error) return err.message;
  return String(err);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useUnwrapAction({
  pair,
  amount,
  userAddress,
  fhevmInstance,
  chainId,
}: {
  pair: EnrichedPair;
  amount: bigint | null;
  userAddress: Address | undefined;
  fhevmInstance: FhevmInstance | undefined;
  chainId: number;
}) {
  const [state, setState] = useState<UnwrapState>({ step: "idle" });
  const gatewayRunningRef = useRef(false);
  const wrapperAddress = pair.confidentialTokenAddress;

  // ── wagmi write hooks ────────────────────────────────────────────────────
  const {
    writeContract: writeUnwrap,
    data: unwrapHash,
    isPending: unwrapSigning,
    error: unwrapWriteError,
    reset: resetUnwrap,
  } = useWriteContract();

  const {
    writeContract: writeFinalize,
    data: finalizeHash,
    isPending: finalizeSigning,
    error: finalizeWriteError,
    reset: resetFinalize,
  } = useWriteContract();

  // ── receipt watchers ─────────────────────────────────────────────────────
  const {
    data: unwrapReceipt,
    isError: unwrapReceiptIsError,
    error: unwrapReceiptError,
  } = useWaitForTransactionReceipt({ hash: unwrapHash });

  const {
    data: finalizeReceipt,
    isError: finalizeReceiptIsError,
    error: finalizeReceiptError,
  } = useWaitForTransactionReceipt({ hash: finalizeHash });

  // ── Effect: wallet signing state ─────────────────────────────────────────
  // wagmi's isPending = true while waiting for the wallet to confirm
  useEffect(() => {
    if (unwrapSigning && state.step === "encrypting") {
      // encryption done, wallet prompt is open
      setState((p) => ({ ...p, step: "signing" }));
    }
  }, [unwrapSigning, state.step]);

  // ── Effect: unwrap write error (user rejected / simulation failed) ────────
  useEffect(() => {
    if (!unwrapWriteError) return;
    if (state.step !== "signing" && state.step !== "encrypting") return;
    setState({ step: "error", errorMessage: `Unwrap failed: ${errorMsg(unwrapWriteError)}` });
  }, [unwrapWriteError, state.step]);

  // ── Effect: unwrap hash received → move to confirming ────────────────────
  useEffect(() => {
    if (!unwrapHash) return;
    if (state.step === "signing" || state.step === "encrypting") {
      setState((p) => ({ ...p, step: "confirming" }));
    }
  }, [unwrapHash, state.step]);

  // ── Effect: unwrap receipt network error ─────────────────────────────────
  useEffect(() => {
    if (!unwrapReceiptIsError || !unwrapReceiptError) return;
    if (state.step !== "confirming") return;
    setState({ step: "error", errorMessage: `Network error waiting for receipt: ${errorMsg(unwrapReceiptError)}` });
  }, [unwrapReceiptIsError, unwrapReceiptError, state.step]);

  // ── Effect: unwrap receipt received → parse logs → publicDecrypt ──────────
  useEffect(() => {
    if (!unwrapReceipt || state.step !== "confirming" || gatewayRunningRef.current) return;

    // Check tx status
    if (unwrapReceipt.status === "reverted") {
      setState({ step: "error", errorMessage: "Unwrap transaction reverted on-chain. Check your confidential balance and inputProof." });
      return;
    }

    // Parse UnwrapRequested event from logs
    let requestId: `0x${string}` | null = null;
    for (const log of unwrapReceipt.logs) {
      if (log.address.toLowerCase() !== wrapperAddress.toLowerCase()) continue;
      try {
        const decoded = decodeEventLog({
          abi: WRAPPER_ABI,
          data: log.data,
          topics: log.topics as [`0x${string}`, ...`0x${string}`[]],
          eventName: "UnwrapRequested",
        });
        requestId = (decoded.args as { unwrapRequestId: `0x${string}` }).unwrapRequestId;
        break;
      } catch {
        // wrong log entry, keep scanning
      }
    }

    if (!requestId) {
      setState({ step: "error", errorMessage: "Transaction confirmed but UnwrapRequested event not found in logs. The contract may not have emitted it." });
      return;
    }

    if (!fhevmInstance) {
      setState({ step: "error", errorMessage: "FHE instance unavailable — reconnect wallet and try again." });
      return;
    }

    setState({ step: "awaiting_gateway", unwrapRequestId: requestId });
    gatewayRunningRef.current = true;

    fhevmInstance
      .publicDecrypt([requestId])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((result: any) => {
        gatewayRunningRef.current = false;
        const clearValues = result.clearValues as Record<string, bigint | boolean | string>;
        const decryptionProof = result.decryptionProof as `0x${string}`;
        const rawClear = clearValues[requestId!];
        if (rawClear === undefined) {
          setState({ step: "error", errorMessage: "Gateway returned no value for this handle. The handle may not be publicly decryptable yet." });
          return;
        }
        const clearAmount = typeof rawClear === "bigint" ? rawClear : BigInt(rawClear as string);
        setState({ step: "finalize_ready", unwrapRequestId: requestId!, clearAmount, decryptionProof });
      })
      .catch((err: unknown) => {
        gatewayRunningRef.current = false;
        setState({ step: "error", errorMessage: `Zama Gateway decryption failed: ${errorMsg(err)}` });
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unwrapReceipt, state.step, fhevmInstance, wrapperAddress]);

  // ── Effect: finalize write error ─────────────────────────────────────────
  useEffect(() => {
    if (!finalizeWriteError) return;
    if (state.step !== "finalizing") return;
    setState({ step: "error", errorMessage: `Finalize failed: ${errorMsg(finalizeWriteError)}` });
  }, [finalizeWriteError, state.step]);

  // ── Effect: finalize receipt network error ────────────────────────────────
  useEffect(() => {
    if (!finalizeReceiptIsError || !finalizeReceiptError) return;
    if (state.step !== "finalize_confirming") return;
    setState({ step: "error", errorMessage: `Network error during finalize: ${errorMsg(finalizeReceiptError)}` });
  }, [finalizeReceiptIsError, finalizeReceiptError, state.step]);

  // ── Effect: finalize receipt → complete ──────────────────────────────────
  useEffect(() => {
    if (!finalizeReceipt || state.step !== "finalize_confirming") return;
    if (finalizeReceipt.status === "reverted") {
      setState({ step: "error", errorMessage: "FinalizeUnwrap transaction reverted. The decryption proof may be invalid or the request already finalised." });
      return;
    }
    setState((prev) => ({ ...prev, step: "complete" }));
  }, [finalizeReceipt, state.step]);

  // ── finalize signing state sync ───────────────────────────────────────────
  useEffect(() => {
    if (finalizeSigning && state.step === "finalizing") {
      // still in signing state — no change needed
    }
  }, [finalizeSigning, state.step]);

  useEffect(() => {
    if (!finalizeHash) return;
    if (state.step === "finalizing") {
      setState((p) => ({ ...p, step: "finalize_confirming" }));
    }
  }, [finalizeHash, state.step]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const startUnwrap = useCallback(async () => {
    if (!fhevmInstance || !userAddress || !amount || amount <= 0n) return;
    setState({ step: "encrypting" });
    resetUnwrap();
    resetFinalize();
    gatewayRunningRef.current = false;

    try {
      const encInput = fhevmInstance
        .createEncryptedInput(wrapperAddress, userAddress)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .add64(amount as any);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { handles, inputProof } = await (encInput as any).encrypt();

      // Normalise to 0x-prefixed hex strings — encrypt() returns Uint8Array,
      // which viem cannot accept as-is (it calls .replace() internally).
      const encryptedAmountHex = normalizeHex(handles[0]);
      const inputProofHex = normalizeHex(inputProof);

      // Validate bytes32 length for encryptedAmount (0x + 64 hex chars = 66)
      if (encryptedAmountHex.length !== 66) {
        setState({
          step: "error",
          errorMessage: `Invalid encrypted handle length: expected 66 chars (bytes32), got ${encryptedAmountHex.length}. Value: ${encryptedAmountHex.slice(0, 20)}…`,
        });
        return;
      }
      if (!inputProofHex.startsWith("0x") || inputProofHex.length < 4) {
        setState({
          step: "error",
          errorMessage: `Invalid inputProof: expected non-empty 0x bytes, got ${inputProofHex.slice(0, 20)}`,
        });
        return;
      }

      // writeContract is synchronous — wallet prompt opens asynchronously.
      // State moves to "signing" via the isPending useEffect above.
      writeUnwrap({
        address: wrapperAddress,
        abi: WRAPPER_ABI,
        functionName: "unwrap",
        args: [userAddress, userAddress, encryptedAmountHex, inputProofHex],
        chainId,
      });
    } catch (err) {
      setState({ step: "error", errorMessage: `Encryption failed: ${errorMsg(err)}` });
    }
  }, [fhevmInstance, userAddress, amount, wrapperAddress, chainId, writeUnwrap, resetUnwrap, resetFinalize]);

  const doFinalizeUnwrap = useCallback(() => {
    if (state.step !== "finalize_ready") return;
    if (!state.unwrapRequestId || state.clearAmount === undefined || !state.decryptionProof) return;
    setState((prev) => ({ ...prev, step: "finalizing" }));
    writeFinalize({
      address: wrapperAddress,
      abi: WRAPPER_ABI,
      functionName: "finalizeUnwrap",
      args: [state.unwrapRequestId, state.clearAmount, state.decryptionProof],
      chainId,
    });
  }, [state, wrapperAddress, chainId, writeFinalize]);

  const reset = useCallback(() => {
    setState({ step: "idle" });
    resetUnwrap();
    resetFinalize();
    gatewayRunningRef.current = false;
  }, [resetUnwrap, resetFinalize]);

  return {
    state,
    startUnwrap,
    finalizeUnwrap: doFinalizeUnwrap,
    reset,
    unwrapTxHash: unwrapHash,
    finalizeTxHash: finalizeHash,
  };
}
