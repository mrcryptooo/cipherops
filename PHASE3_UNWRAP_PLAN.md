# Phase 3: Unwrap Lifecycle — Implementation Plan

Researched against `zama-ai/protocol-apps` @ main + `OpenZeppelin/openzeppelin-confidential-contracts`.
Contract source: `ERC7984ERC20WrapperUpgradeable.sol`
Interface source: `IERC7984ERC20Wrapper.sol` (OpenZeppelin, confirmed authoritative)
Tests verified: `ConfidentialWrapper.test.ts` + `ConfidentialWrapperV3.test.ts`

**Verified 2026-06-02 — All UNCERTAIN flags resolved.**

---

## Q1 & Q2 — Exact unwrap function names and signatures (CONFIRMED)

### `unwrap` — 4-param overload (use this from frontend)
```solidity
function unwrap(
    address from,
    address to,
    externalEuint64 encryptedAmount,  // → bytes32 in ABI
    bytes calldata inputProof
) external returns (bytes32 unwrapRequestId);
```

**Selector:** `unwrap(address,address,bytes32,bytes)`

### `finalizeUnwrap` — CONFIRMED SIGNATURE
```solidity
function finalizeUnwrap(
    bytes32 unwrapRequestId,
    uint64 unwrapAmountCleartext,   // ✅ CONFIRMED: uint64
    bytes calldata decryptionProof
) external;
```

**Source:** OpenZeppelin `IERC7984ERC20Wrapper` interface (authoritative).

**Why tests pass `abiEncodedClearValues` (bytes) as uint64:**
`publicDecrypt` returns `abiEncodedClearValues = abi.encode([uint64_value])` which is a 32-byte hex
string like `0x0000...0064`. Both ethers v6 and viem interpret this hex string as BigInt `100n` when
the ABI slot is `uint64`. The coercion works correctly because the padded hex value equals the
integer value. However, the cleaner frontend approach is to use `clearValues[requestId]` (the
already-decoded `bigint`) directly — this is explicit and type-safe with viem.

### Events (CONFIRMED from IERC7984ERC20Wrapper)
```solidity
event UnwrapRequested(address indexed receiver, bytes32 indexed unwrapRequestId, euint64 amount);
event UnwrapFinalized(
    address indexed receiver,
    bytes32 indexed unwrapRequestId,
    euint64 encryptedAmount,
    uint64 cleartextAmount
);
event Wrap(address indexed to, uint256 roundedAmount, euint64 encryptedWrappedAmount);
```

---

## Q3 — How to create encrypted amount for unwrap

```ts
// 1. Create encrypted input targeting the wrapper contract + user address
const encInput = instance
  .createEncryptedInput(wrapperAddress, userAddress)
  .add64(amountBigInt);   // amount in WRAPPER token units (NOT underlying ERC-20 units)

const { handles, inputProof } = await encInput.encrypt();

// 2. Call unwrap with 4-param overload
writeContract({
  address: wrapperAddress,
  abi: WRAPPER_ABI,
  functionName: "unwrap",
  args: [from, to, handles[0], inputProof],
});
// → emit UnwrapRequested(to, unwrapRequestId, amount)
```

`add64` is the correct builder method — `euint64` is the encrypted integer type used by these wrappers.
`amount` in wrapper units: if `rate() = 1000`, then 1 wrapper token = 1000 underlying tokens,
so `1` wrapper unit passed to unwrap returns `1000` underlying tokens.

---

## Q4 — Async lifecycle

```
1. User enters amount (in wrapper token units)
2. Frontend: instance.createEncryptedInput(wrapper, user).add64(amount).encrypt()
3. Frontend: write unwrap(from, to, handles[0], inputProof) → tx mined
4. Frontend: listen for UnwrapRequested event → extract unwrapRequestId (bytes32)
5. Frontend: const { clearValues, decryptionProof } = await instance.publicDecrypt([unwrapRequestId])
   → SDK polls Zama gateway internally, resolves when gateway decrypts the handle
6. Frontend: const cleartextAmount = clearValues[unwrapRequestId] as bigint
7. Frontend: write finalizeUnwrap(unwrapRequestId, cleartextAmount, decryptionProof)
8. Tx mined → UnwrapFinalized event → underlying ERC-20 transferred to `to`
```

Step 5 is the async bottleneck (seconds to minutes). The SDK polls internally.

---

## Q5 — publicDecrypt return type (CONFIRMED)

```ts
type PublicDecryptResults = Readonly<{
  clearValues: Readonly<Record<`0x${string}`, bigint | boolean | `0x${string}`>>;
  abiEncodedClearValues: `0x${string}`;
  decryptionProof: `0x${string}`;
}>;

// Usage:
const { clearValues, decryptionProof } = await instance.publicDecrypt([unwrapRequestId]);
const cleartextAmount = clearValues[unwrapRequestId as `0x${string}`] as bigint;
// → pass cleartextAmount (bigint) as uint64, decryptionProof as bytes
```

`clearValues[handle]` is the already-decoded bigint. Use this — not `abiEncodedClearValues` —
for the `uint64` parameter in `finalizeUnwrap`. Both work, but `clearValues` is explicit.

---

## Q6 — UI state machine

| State | Label | Description |
|---|---|---|
| `idle` | — | Amount entry form shown |
| `encrypting` | "Encrypting amount…" | createEncryptedInput + encrypt() |
| `requesting` | "Confirm in wallet…" / "Pending…" | unwrap tx in-flight |
| `awaiting_gateway` | "Waiting for gateway decrypt…" | SDK polling publicDecrypt |
| `finalize_ready` | "Ready to finalise" | have cleartext + proof |
| `finalizing` | "Confirm in wallet…" / "Pending…" | finalizeUnwrap tx in-flight |
| `complete` | "✓ Unwrap complete" | ERC-20 released |
| `error` | error message | any step failed |

---

## Q7 — ABI additions for WRAPPER_ABI (CONFIRMED, no UNCERTAIN flags)

```ts
// Add to WRAPPER_ABI in src/lib/registry.ts:

{
  name: "unwrap",
  type: "function",
  stateMutability: "nonpayable",
  inputs: [
    { name: "from",            type: "address" },
    { name: "to",              type: "address" },
    { name: "encryptedAmount", type: "bytes32" },  // externalEuint64 → bytes32 in ABI
    { name: "inputProof",      type: "bytes"   },
  ],
  outputs: [{ name: "", type: "bytes32" }],   // unwrapRequestId
},
{
  name: "finalizeUnwrap",
  type: "function",
  stateMutability: "nonpayable",
  inputs: [
    { name: "unwrapRequestId",       type: "bytes32" },
    { name: "unwrapAmountCleartext", type: "uint64"  },  // ✅ confirmed uint64
    { name: "decryptionProof",       type: "bytes"   },
  ],
  outputs: [],
},
// Events (needed for useWatchContractEvent):
{
  name: "UnwrapRequested",
  type: "event",
  inputs: [
    { name: "receiver",        type: "address", indexed: true },
    { name: "unwrapRequestId", type: "bytes32", indexed: true },
    { name: "amount",          type: "bytes32" },              // euint64 → bytes32
  ],
},
{
  name: "UnwrapFinalized",
  type: "event",
  inputs: [
    { name: "receiver",                type: "address", indexed: true },
    { name: "unwrapRequestId",         type: "bytes32", indexed: true },
    { name: "encryptedAmount",         type: "bytes32" },              // euint64 → bytes32
    { name: "cleartextAmount",         type: "uint64"  },
  ],
},
```

---

## Q8 — Failure cases

| Failure | Cause | Notes |
|---|---|---|
| Insufficient confidential balance | `_burn` reverts | Will revert on unwrap step |
| Invalid inputProof | `FHE.fromExternal` reverts | Must use wrapper + user address when encrypting |
| Gateway timeout | `publicDecrypt` hangs | Zama relayer DNS issues reported on Sepolia |
| `finalizeUnwrap` too early | Handle not yet publicly decrypted | `FHE.checkSignatures` reverts |
| Wrong chain | Sepolia only | Write guard already in place |
| Amount × rate mismatch | underlying = cleartext × rate() | rate() can be >1 for 18-decimal tokens |
| `from` ≠ caller without operator | `ERC7984UnauthorizedSpender` revert | Use `msg.sender` as `from` |

---

## Q9 — Phase 3B implementation sequence

1. Add `unwrap`, `finalizeUnwrap`, `UnwrapRequested`, `UnwrapFinalized` to `WRAPPER_ABI`.
2. Create `src/hooks/useUnwrapAction.ts`:
   - 8-state machine (idle → encrypting → requesting → awaiting_gateway → finalize_ready → finalizing → complete / error)
   - Step 1: `instance.createEncryptedInput(wrapper, user).add64(amount).encrypt()`
   - Step 2: `useWriteContract` → `unwrap(from, to, handles[0], inputProof)`
   - Step 3: `useWatchContractEvent` for `UnwrapRequested` → get `unwrapRequestId`
   - Step 4: `instance.publicDecrypt([unwrapRequestId])` → `{ clearValues, decryptionProof }`
   - Step 5: `clearValues[unwrapRequestId] as bigint` → `useWriteContract` → `finalizeUnwrap`
3. Add "Unwrap" tab to `TokenActionPanel` (same Sepolia + FHE instance guards as Private Reveal).
4. After complete: show `cleartextAmount × rate()` underlying ERC-20 units returned.
5. Update `ProtocolCoverage`: Unwrap → live.
6. Update `GuidedQuickstart`: step 5 → available.
7. `npm run typecheck && npm run lint && npm run build`.

No new npm dependencies needed — `instance.publicDecrypt` is already on the `FhevmInstance`
from Phase 2B.1.
