# Phase 2: Private Balance Reveal — Implementation Plan

Researched against `zama-ai/dapps` @ main (2026-06-02).
Reference: `packages/erc7984example/hooks/erc7984/useERC7984Wagmi.tsx`

---

## Confirmed facts

### Package
- **npm package**: `@zama-fhe/relayer-sdk` — current latest: **0.4.3**
- **NOT usable directly for React hooks**: The React wrapper (`fhevm-sdk`) is
  `"private": true` in the dapps monorepo — not published to npm.
- The React hooks (`useFHEDecrypt`, `useFhevm`, `useInMemoryStorage`) live in
  `packages/fhevm-sdk/src/react/` and must be **copied into our project**.

### Contract read
- Function: `confidentialBalanceOf(address account)` → `bytes32`
- Already added to `WRAPPER_ABI` in `src/lib/registry.ts`.
- The returned `bytes32` is an FHE-encrypted handle — not a balance value.

### Decrypt flow (confirmed from source)
```
1. useFhevm({ provider, chainId })         → FhevmInstance
2. useReadContract → confidentialBalanceOf → bytes32 handle
3. useFHEDecrypt({
     instance,                              // FhevmInstance
     ethersSigner,                          // ethers.JsonRpcSigner (NOT viem)
     fhevmDecryptionSignatureStorage,       // GenericStringStorage (from useInMemoryStorage)
     chainId,
     requests: [{ handle, contractAddress }]
   })
   → calls instance.userDecrypt() internally
   → eth_signTypedData_v4 wallet prompt
   → relayer at https://relayer.testnet.zama.cloud
   → returns results: Record<string, bigint>
4. Display results[handle] as plaintext balance
```

### `useFHEDecrypt` return type (confirmed)
```ts
{
  canDecrypt: boolean;
  decrypt: () => void;         // triggers the flow above
  isDecrypting: boolean;
  message: string;
  results: Record<string, string | bigint | boolean>;
  error: string | null;
}
```

### New dependencies needed
| Package | Version | Why |
|---|---|---|
| `@zama-fhe/relayer-sdk` | `^0.4.3` | Core FHE SDK |
| `ethers` | `^6.x` | JsonRpcSigner for useFHEDecrypt |

Note: `ethers` is a new dependency — currently using viem only.
Compatibility note: wagmi v2 ships a viem↔ethers bridge via `useWagmiEthers`.

### Files to copy from zama-ai/dapps
Copy these 4 files verbatim into `src/lib/fhevm/`:
1. `packages/fhevm-sdk/src/react/useFHEDecrypt.ts`
2. `packages/fhevm-sdk/src/react/useFhevm.tsx`
3. `packages/fhevm-sdk/src/react/useInMemoryStorage.tsx`
4. `packages/fhevm-sdk/src/FhevmDecryptionSignature.ts`
5. `packages/fhevm-sdk/src/storage/GenericStringStorage.ts` (dependency of useFHEDecrypt)
6. `packages/fhevm-sdk/src/fhevmTypes.ts` (FhevmInstance type)
7. `packages/fhevm-sdk/src/internal/fhevm.ts` (createFhevmInstance — wraps relayer-sdk)

Then import from `@/lib/fhevm/...` instead of `"fhevm-sdk"`.

### WASM files required
The erc7984example has in `public/`:
- `kms_lib_bg.wasm`
- `tfhe_bg.wasm`
These must be copied to our `public/` directory for browser-side decryption.

### Next.js config changes needed
1. `transpilePackages: ["@zama-fhe/relayer-sdk"]`
2. Webpack fallbacks for Node.js modules:
   - `fs`, `net`, `tls`, `child_process`, `worker_threads` → `false` or empty module
3. Existing fallbacks for `pino-pretty` and `@react-native-async-storage` already done.

### Signer bridge
`useFHEDecrypt` needs `ethers.JsonRpcSigner`.
The dapps example uses `useWagmiEthers` hook to convert the wagmi wallet client
to an ethers signer. We need to implement this bridge using wagmi's
`useConnectorClient` + viem/ethers adapter.

---

## Known failure cases
| Case | Impact |
|---|---|
| Smart wallet (AA) | **Blocked** — signature format incompatible; show warning |
| ACL not granted by wrapper | Decrypt request rejected silently |
| Relayer DNS failure | Timeout — `relayer.testnet.zama.cloud` had DNS issues in 2025 |
| Wrong chain | Instance won't initialize |
| WASM not served | SDK throws at init |

---

## Implementation sequence for Phase 2B

1. `npm install @zama-fhe/relayer-sdk ethers`
2. Update `next.config.ts`: transpilePackages + webpack fallbacks
3. Copy WASM files to `public/`
4. Copy fhevm-sdk source files to `src/lib/fhevm/`
5. Create `src/hooks/useFhevmDecrypt.ts` (thin wrapper composing useFhevm + useFHEDecrypt)
6. Create `src/hooks/useWagmiEthers.ts` (wagmi→ethers signer bridge)
7. Add "Private Reveal" tab to `TokenActionPanel`
8. Update `ProtocolCoverage`: Private Reveal → live
9. Update `GuidedQuickstart`: step 4 → available
10. Typecheck → lint → build → manual test
