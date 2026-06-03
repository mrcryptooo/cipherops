// Re-exports from @zama-fhe/relayer-sdk — types only, no runtime cost.
// Source: packages/fhevm-sdk/src/fhevmTypes.ts (zama-ai/dapps)
import type { FhevmInstance as _FhevmInstance } from "@zama-fhe/relayer-sdk/bundle";
import type { HandleContractPair as _HandleContractPair } from "@zama-fhe/relayer-sdk/bundle";
import type { UserDecryptResults as _UserDecryptResults } from "@zama-fhe/relayer-sdk/bundle";
import type { FhevmInstanceConfig as _FhevmInstanceConfig } from "@zama-fhe/relayer-sdk/bundle";

export type FhevmInstance = _FhevmInstance;
export type FhevmInstanceConfig = _FhevmInstanceConfig;
export type HandleContractPair = _HandleContractPair;
export type UserDecryptResults = _UserDecryptResults;

export type FhevmDecryptionSignatureType = {
  publicKey: string;
  privateKey: string;
  signature: string;
  startTimestamp: number;
  durationDays: number;
  userAddress: `0x${string}`;
  contractAddresses: `0x${string}`[];
  eip712: EIP712Type;
};

export type EIP712Type = {
  domain: {
    chainId: number;
    name: string;
    verifyingContract: `0x${string}`;
    version: string;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  message: any;
  primaryType: string;
  types: {
    [key: string]: {
      name: string;
      type: string;
    }[];
  };
};
