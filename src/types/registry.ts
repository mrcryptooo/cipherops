import type { Address } from "viem";

export interface RawTokenPair {
  tokenAddress: Address;
  confidentialTokenAddress: Address;
  isValid: boolean;
}

export interface TokenMeta {
  symbol: string;
  name: string;
  decimals: number;
}

export interface EnrichedPair {
  index: number;
  tokenAddress: Address;
  confidentialTokenAddress: Address;
  isValid: boolean;
  token: TokenMeta | null;
  confidentialToken: TokenMeta | null;
  rate: bigint | null;
  networkKey: string;
}
