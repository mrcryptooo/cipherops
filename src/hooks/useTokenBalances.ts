"use client";

import { useReadContracts } from "wagmi";
import { useMemo } from "react";
import { ERC20_FULL_ABI } from "@/lib/registry";
import type { Address } from "viem";

interface UseTokenBalancesParams {
  tokenAddress: Address;
  wrapperAddress: Address;
  userAddress: Address | undefined;
  chainId: number;
  enabled?: boolean;
}

export interface TokenBalances {
  balance: bigint;
  allowance: bigint;
  isLoading: boolean;
  refetch: () => void;
}

export function useTokenBalances({
  tokenAddress,
  wrapperAddress,
  userAddress,
  chainId,
  enabled = true,
}: UseTokenBalancesParams): TokenBalances {
  const isReady = enabled && !!userAddress;

  const contracts = useMemo(
    () =>
      isReady
        ? [
            {
              address: tokenAddress,
              abi: ERC20_FULL_ABI,
              functionName: "balanceOf" as const,
              args: [userAddress!] as const,
              chainId,
            },
            {
              address: tokenAddress,
              abi: ERC20_FULL_ABI,
              functionName: "allowance" as const,
              args: [userAddress!, wrapperAddress] as const,
              chainId,
            },
          ]
        : [],
    [tokenAddress, wrapperAddress, userAddress, chainId, isReady]
  );

  const { data, isLoading, refetch } = useReadContracts({
    contracts,
    query: { enabled: isReady, refetchInterval: 8_000 },
  });

  return {
    balance: (data?.[0]?.result as bigint | undefined) ?? 0n,
    allowance: (data?.[1]?.result as bigint | undefined) ?? 0n,
    isLoading,
    refetch: () => void refetch(),
  };
}
