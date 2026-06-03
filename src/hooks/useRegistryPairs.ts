"use client";

import { useReadContract, useReadContracts } from "wagmi";
import { useMemo } from "react";
import { REGISTRY_ABI, ERC20_ABI, ERC7984_ABI, NETWORKS } from "@/lib/registry";
import type { EnrichedPair, RawTokenPair } from "@/types/registry";
import type { Address } from "viem";

export function useRegistryPairs(networkKey: string) {
  const network = NETWORKS[networkKey];

  const {
    data: rawPairs,
    isLoading: pairsLoading,
    error: pairsError,
    refetch,
  } = useReadContract({
    address: network.registryAddress,
    abi: REGISTRY_ABI,
    functionName: "getTokenConfidentialTokenPairs",
    chainId: network.chainId,
  });

  const validPairs = useMemo<RawTokenPair[]>(() => {
    if (!rawPairs) return [];
    return (rawPairs as RawTokenPair[]).filter((p) => p.isValid);
  }, [rawPairs]);

  // Build multicall contracts for ERC-20 metadata
  const erc20Calls = useMemo(
    () =>
      validPairs.flatMap((pair) => [
        {
          address: pair.tokenAddress as Address,
          abi: ERC20_ABI,
          functionName: "symbol" as const,
          chainId: network.chainId,
        },
        {
          address: pair.tokenAddress as Address,
          abi: ERC20_ABI,
          functionName: "name" as const,
          chainId: network.chainId,
        },
        {
          address: pair.tokenAddress as Address,
          abi: ERC20_ABI,
          functionName: "decimals" as const,
          chainId: network.chainId,
        },
      ]),
    [validPairs, network.chainId]
  );

  // Build multicall contracts for ERC-7984 (confidential token) metadata
  const erc7984Calls = useMemo(
    () =>
      validPairs.flatMap((pair) => [
        {
          address: pair.confidentialTokenAddress as Address,
          abi: ERC7984_ABI,
          functionName: "symbol" as const,
          chainId: network.chainId,
        },
        {
          address: pair.confidentialTokenAddress as Address,
          abi: ERC7984_ABI,
          functionName: "name" as const,
          chainId: network.chainId,
        },
        {
          address: pair.confidentialTokenAddress as Address,
          abi: ERC7984_ABI,
          functionName: "decimals" as const,
          chainId: network.chainId,
        },
        {
          address: pair.confidentialTokenAddress as Address,
          abi: ERC7984_ABI,
          functionName: "rate" as const,
          chainId: network.chainId,
        },
      ]),
    [validPairs, network.chainId]
  );

  const { data: erc20Meta, isLoading: erc20Loading } = useReadContracts({
    contracts: erc20Calls,
    query: { enabled: validPairs.length > 0 },
  });

  const { data: erc7984Meta, isLoading: erc7984Loading } = useReadContracts({
    contracts: erc7984Calls,
    query: { enabled: validPairs.length > 0 },
  });

  const enrichedPairs = useMemo<EnrichedPair[]>(() => {
    return validPairs.map((pair, i) => {
      const erc20Base = i * 3;
      const erc7984Base = i * 4;

      const symbol20 = erc20Meta?.[erc20Base]?.result as string | undefined;
      const name20 = erc20Meta?.[erc20Base + 1]?.result as string | undefined;
      const decimals20 = erc20Meta?.[erc20Base + 2]?.result as number | undefined;

      const symbol7984 = erc7984Meta?.[erc7984Base]?.result as string | undefined;
      const name7984 = erc7984Meta?.[erc7984Base + 1]?.result as string | undefined;
      const decimals7984 = erc7984Meta?.[erc7984Base + 2]?.result as number | undefined;
      const rate = erc7984Meta?.[erc7984Base + 3]?.result as bigint | undefined;

      return {
        index: i,
        tokenAddress: pair.tokenAddress,
        confidentialTokenAddress: pair.confidentialTokenAddress,
        isValid: pair.isValid,
        networkKey,
        token:
          symbol20 != null && name20 != null && decimals20 != null
            ? { symbol: symbol20, name: name20, decimals: decimals20 }
            : null,
        confidentialToken:
          symbol7984 != null && name7984 != null && decimals7984 != null
            ? { symbol: symbol7984, name: name7984, decimals: decimals7984 }
            : null,
        rate: rate ?? null,
      };
    });
  }, [validPairs, erc20Meta, erc7984Meta, networkKey]);

  return {
    pairs: enrichedPairs,
    rawCount: (rawPairs as RawTokenPair[] | undefined)?.length ?? 0,
    validCount: validPairs.length,
    isLoading: pairsLoading || (validPairs.length > 0 && (erc20Loading || erc7984Loading)),
    error: pairsError,
    refetch,
  };
}
