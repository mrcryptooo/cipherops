import { type Address } from "viem";
import { sepolia, mainnet } from "wagmi/chains";

export interface NetworkConfig {
  chainId: number;
  name: string;
  shortName: string;
  registryAddress: Address;
  explorerBaseUrl: string;
}

export const NETWORKS: Record<string, NetworkConfig> = {
  sepolia: {
    chainId: sepolia.id,
    name: "Ethereum Sepolia",
    shortName: "Sepolia",
    registryAddress: "0x2f0750Bbb0A246059d80e94c454586a7F27a128e",
    explorerBaseUrl: "https://sepolia.etherscan.io",
  },
  mainnet: {
    chainId: mainnet.id,
    name: "Ethereum Mainnet",
    shortName: "Mainnet",
    registryAddress: "0xeb5015fF021DB115aCe010f23F55C2591059bBA0",
    explorerBaseUrl: "https://etherscan.io",
  },
};

// Chain IDs
export const SEPOLIA_CHAIN_ID = sepolia.id;
export const MAINNET_CHAIN_ID = mainnet.id;

// Write transactions are Sepolia-only.
// All pairs returned by the official Sepolia registry are Zama mock/test tokens
// that expose mint(address,uint256) for testnet use — no separate allowlist needed
// because the registry IS the authoritative source of official pairs.
export const WRITE_ENABLED_CHAIN_IDS: number[] = [SEPOLIA_CHAIN_ID];

export function isWriteEnabled(chainId: number | undefined): boolean {
  return chainId !== undefined && WRITE_ENABLED_CHAIN_IDS.includes(chainId);
}

// ─── Registry ABI ────────────────────────────────────────────────────────────

export const REGISTRY_ABI = [
  {
    name: "getTokenConfidentialTokenPairs",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "tokenAddress", type: "address" },
          { name: "confidentialTokenAddress", type: "address" },
          { name: "isValid", type: "bool" },
        ],
      },
    ],
  },
  {
    name: "getTokenConfidentialTokenPairsLength",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "getTokenConfidentialTokenPairsSlice",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "from", type: "uint256" },
      { name: "to", type: "uint256" },
    ],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "tokenAddress", type: "address" },
          { name: "confidentialTokenAddress", type: "address" },
          { name: "isValid", type: "bool" },
        ],
      },
    ],
  },
  {
    name: "getTokenConfidentialTokenPair",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "index", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "tokenAddress", type: "address" },
          { name: "confidentialTokenAddress", type: "address" },
          { name: "isValid", type: "bool" },
        ],
      },
    ],
  },
  {
    name: "isConfidentialTokenValid",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "wrapper", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

// ─── ERC-20 read-only ABI (used by useRegistryPairs multicall) ────────────────

export const ERC20_ABI = [
  {
    name: "symbol",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
  {
    name: "name",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
] as const;

// ─── ERC-20 full ABI (includes balance, allowance, approve, mint) ─────────────

export const ERC20_FULL_ABI = [
  ...ERC20_ABI,
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "mint",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
] as const;

// ─── ERC-7984 wrapper ABI ─────────────────────────────────────────────────────

export const ERC7984_ABI = [
  ...ERC20_ABI,
  {
    name: "rate",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export const WRAPPER_ABI = [
  {
    name: "symbol",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
  {
    name: "name",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
  {
    name: "rate",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "wrap",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  // Phase 2: read encrypted balance handle (returns bytes32, NOT plaintext)
  {
    name: "confidentialBalanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "bytes32" }],
  },
  // Phase 3: two-step unwrap lifecycle
  // Step 1 — initiate: burns confidential tokens and requests public gateway decrypt
  {
    name: "unwrap",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "from",            type: "address" },
      { name: "to",              type: "address" },
      { name: "encryptedAmount", type: "bytes32" },  // externalEuint64 → bytes32
      { name: "inputProof",      type: "bytes"   },
    ],
    outputs: [{ name: "", type: "bytes32" }],         // unwrapRequestId
  },
  // Step 2 — finalize: sends underlying ERC-20 after gateway confirms decryption
  {
    name: "finalizeUnwrap",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "unwrapRequestId",       type: "bytes32" },
      { name: "unwrapAmountCleartext", type: "uint64"  },  // confirmed uint64
      { name: "decryptionProof",       type: "bytes"   },
    ],
    outputs: [],
  },
  // Events used for log parsing after unwrap tx and finalize tx
  {
    name: "UnwrapRequested",
    type: "event",
    inputs: [
      { name: "receiver",        type: "address", indexed: true },
      { name: "unwrapRequestId", type: "bytes32", indexed: true },
      { name: "amount",          type: "bytes32" },   // euint64 → bytes32
    ],
  },
  {
    name: "UnwrapFinalized",
    type: "event",
    inputs: [
      { name: "receiver",            type: "address", indexed: true },
      { name: "unwrapRequestId",     type: "bytes32", indexed: true },
      { name: "encryptedAmount",     type: "bytes32" },   // euint64 → bytes32
      { name: "cleartextAmount",     type: "uint64"  },
    ],
  },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function explorerAddressUrl(explorerBaseUrl: string, address: string): string {
  return `${explorerBaseUrl}/address/${address}`;
}

export function explorerTxUrl(explorerBaseUrl: string, hash: string): string {
  return `${explorerBaseUrl}/tx/${hash}`;
}

export function shortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function shortHash(hash: string): string {
  return `${hash.slice(0, 10)}…${hash.slice(-6)}`;
}
