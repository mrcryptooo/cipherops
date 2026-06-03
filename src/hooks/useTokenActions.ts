"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ERC20_FULL_ABI, WRAPPER_ABI } from "@/lib/registry";
import type { Address } from "viem";

export type TxStatus = "idle" | "signing" | "pending" | "success" | "error";

function deriveTxStatus(
  isPending: boolean,
  isConfirming: boolean,
  isSuccess: boolean,
  isError: boolean,
  hash: `0x${string}` | undefined
): TxStatus {
  if (isSuccess) return "success";
  if (isError) return "error";
  if (isConfirming) return "pending";
  if (isPending || !!hash) return "signing";
  return "idle";
}

// ─── Mint (faucet) ────────────────────────────────────────────────────────────

export function useMintAction(tokenAddress: Address) {
  const { writeContract, data: hash, isPending, error: writeError, reset } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash });

  const isError = !!writeError || !!receiptError;
  const status = deriveTxStatus(isPending, isConfirming, isSuccess, isError, hash);
  const error = writeError ?? receiptError ?? null;

  function mint(to: Address, amount: bigint) {
    writeContract({
      address: tokenAddress,
      abi: ERC20_FULL_ABI,
      functionName: "mint",
      args: [to, amount],
    });
  }

  return { mint, hash, status, error, reset };
}

// ─── Approve ─────────────────────────────────────────────────────────────────

export function useApproveAction(tokenAddress: Address) {
  const { writeContract, data: hash, isPending, error: writeError, reset } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash });

  const isError = !!writeError || !!receiptError;
  const status = deriveTxStatus(isPending, isConfirming, isSuccess, isError, hash);
  const error = writeError ?? receiptError ?? null;

  function approve(spender: Address, amount: bigint) {
    writeContract({
      address: tokenAddress,
      abi: ERC20_FULL_ABI,
      functionName: "approve",
      args: [spender, amount],
    });
  }

  return { approve, hash, status, error, reset };
}

// ─── Wrap ─────────────────────────────────────────────────────────────────────

export function useWrapAction(wrapperAddress: Address) {
  const { writeContract, data: hash, isPending, error: writeError, reset } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash });

  const isError = !!writeError || !!receiptError;
  const status = deriveTxStatus(isPending, isConfirming, isSuccess, isError, hash);
  const error = writeError ?? receiptError ?? null;

  function wrap(to: Address, amount: bigint) {
    writeContract({
      address: wrapperAddress,
      abi: WRAPPER_ABI,
      functionName: "wrap",
      args: [to, amount],
    });
  }

  return { wrap, hash, status, error, reset };
}
