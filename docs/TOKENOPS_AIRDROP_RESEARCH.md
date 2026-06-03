# TokenOps Confidential Airdrop — Research (Step 8)

**Date:** 2026-06-02  
**Packages inspected:** `@tokenops/sdk/fhe-airdrop`, `@tokenops/sdk/fhe-airdrop/react`, `@tokenops/sdk/fhe-airdrop/advanced`

---

## SDK Package Paths Inspected

| Path | Files found | Status |
|---|---|---|
| `@tokenops/sdk/fhe-airdrop` | factory.d.ts, airdrop.d.ts, types.d.ts, encryption.d.ts, abis/ | ✅ Loaded |
| `@tokenops/sdk/fhe-airdrop/react` | 60+ hook .d.ts files | ✅ Loaded |
| `@tokenops/sdk/fhe-airdrop/advanced` | factory-advanced.d.ts, usePredictAirdropAddress | ✅ Loaded |

---

## Sepolia Addresses (confirmed from T1)

| Contract | Chain | Address |
|---|---|---|
| `confidentialAirdropFactory` | Sepolia (11155111) | `0xbE6A3B78B36684fFee48De77d47Bc3393F5Acd4c` |
| Source | `DEPLOYED_ADDRESSES.fheAirdrop.confidentialAirdropFactory[11155111]` | auto-resolved from chain id |

---

## Exact Airdrop Flow

```
ADMIN SIDE:
┌───────────────────────────────────────────────────────────────────────┐
│ 1. setOperator(factoryAddress, deadline) on ERC-7984 token            │
│    → same pattern as Disperse but operator = factory (not singleton)  │
│                                                                       │
│ 2. createAndFundConfidentialAirdrop({                                 │
│      params: { token, startTimestamp, endTimestamp,                   │
│               canExtendClaimWindow, admin },                          │
│      userSalt: randomBytes32,                                         │
│      amount: bigint,       // plaintext — SDK encrypts via encryptor  │
│      encryptor: lazy ref                                              │
│    })                                                                 │
│    → deploys clone + funds it in ONE tx                              │
│    → returns { hash: TxHash, airdrop: Address }                      │
│                                                                       │
│ 3. For EACH recipient:                                                │
│    a. encryptUint64({ value: amount, type: "euint64",                 │
│                       contractAddress: airdropAddress,                │
│                       userAddress: RECIPIENT_ADDRESS })               │
│       → { handles: [bytes32], inputProof: Uint8Array }                │
│    b. useSignClaimAuthorization.mutateAsync({                         │
│         airdropAddress,                                               │
│         recipient: RECIPIENT_ADDRESS,                                  │
│         encryptedAmountHandle: handles[0]                             │
│       })                                                              │
│       → EIP-712 signature (admin must hold DEFAULT_ADMIN_ROLE)        │
│    c. Deliver { encryptedInput, signature } to recipient              │
└───────────────────────────────────────────────────────────────────────┘

RECIPIENT SIDE:
┌───────────────────────────────────────────────────────────────────────┐
│ 4. useClaim({ address: airdropAddress }).mutate({                    │
│      encryptedInput,   // from admin — MUST match signed handle      │
│      signature,        // admin EIP-712 sig                          │
│    })                                                                 │
│    → recipient sends claim tx, attaches gasFee() ETH as msg.value    │
│    → receives encrypted allocation from clone                         │
│                                                                       │
│ 5. Reveal claimed balance via Private Reveal                          │
│    → same flow as existing CipherOps Private Reveal tab in /registry │
└───────────────────────────────────────────────────────────────────────┘
```

---

## Key Difference from Disperse

| Aspect | Disperse | Airdrop |
|---|---|---|
| Contract | Singleton (auto-resolved) | Clone per campaign (must deploy) |
| Operator target | Disperse singleton | Airdrop **factory** |
| Encryption | One batch for all recipients | **Per-recipient**: inputProof bound to `userAddress: recipient` |
| Admin signs? | No per-recipient signature | **Yes** — EIP-712 per recipient |
| Recipient action | None | Recipient must call `claim(encryptedInput, signature)` |
| gasFee on claim | N/A | Recipient attaches ETH value = `gasFee()` |

---

## Critical Constraint: Per-Recipient Encryption

**The Zama input proof is bound to `userAddress`.** The admin MUST call `encryptUint64()` once per recipient with `userAddress: recipient`. The same encrypted input cannot be reused for different recipients — the contract's `FHE.fromExternal` will reject it.

This means the admin workflow is inherently per-recipient. For a demo with 3 recipients, the admin needs 3 encryption calls + 3 signature calls before recipients can claim.

---

## Exact Exported Functions & Hooks

### Factory hooks (`@tokenops/sdk/fhe-airdrop/react`)

| Hook | Purpose | Encryptor needed? |
|---|---|---|
| `useCreateConfidentialAirdrop` | Deploy clone only | No |
| `useCreateConfidentialAirdropAndGetAddress` | Deploy + parse address | No |
| `useCreateAndFundConfidentialAirdrop` | Deploy + fund in one tx | **Yes** |
| `useCreateAndFundConfidentialAirdropAndGetAddress` | Deploy + fund + address | **Yes** |
| `useFundConfidentialAirdrop` | Fund an existing clone | **Yes** |
| `useFactoryDefaultGasFee` | Read default claim gas fee | No |
| `useFactoryCustomFee` | Read custom fee override | No |

### Airdrop clone hooks (`@tokenops/sdk/fhe-airdrop/react`)

| Hook | Purpose |
|---|---|
| `useClaim` | Recipient submits `{ encryptedInput, signature }` |
| `useSignClaimAuthorization` | Admin signs EIP-712 per recipient |
| `useGetClaimAmount` | Read claim amount (admin debug, needs signed pair) |
| `useAirdropToken` | Read which ERC-7984 token the airdrop holds |
| `useAirdropStartTime` / `useAirdropEndTime` | Read claim window |
| `useAirdropHasClaimStarted` / `useAirdropHasClaimEnded` | Check window state |
| `useAirdropIsSignatureClaimed` | Has a specific signature already been used? |
| `useAirdropIsSignatureValid` | Validate handle + signature pair |
| `useExtendClaimWindow` | Extend claim period (admin only) |
| `useWithdraw` | Admin withdraws unclaimed tokens after window closes |
| `useAccessClaimAmount` | Read encrypted claim amount handle (for recipient reveal) |

### Types

```typescript
interface AirdropParams {
  token: Address;          // ERC-7984 confidential token
  startTimestamp: number;  // unix timestamp
  endTimestamp: number;    // unix timestamp
  canExtendClaimWindow: boolean;
  admin: Address;          // must be msg.sender at factory call time
}

interface CreateAndFundAirdropArgs {
  params: AirdropParams;
  userSalt: Hex;           // random bytes32, combined with msg.sender for CREATE2
  amount: bigint;          // plaintext — SDK encrypts via encryptor
  encryptor?: Encryptor;
}

interface ClaimArgs {
  encryptedInput: EncryptedInput;   // admin-produced, bound to recipient address
  signature: Hex;                   // admin EIP-712 sig over handle
  value?: bigint;                   // ETH for gas fee (auto-fetched if omitted)
}

interface CreateAirdropResult {
  hash: TxHash;
  airdrop: Address;  // parsed from ConfidentialAirdropCreated event
}
```

---

## Frontend-Only Possible?

**YES — with important caveat.**

For a demo MVP where admin + recipient are both the same browser session (or the admin manually shares `{ encryptedInput, signature }` with each recipient):
- Admin creates campaign: `useCreateAndFundConfidentialAirdrop` ✅ frontend
- Admin signs per recipient: `useSignClaimAuthorization` ✅ frontend  
- Recipient claims: `useClaim` ✅ frontend
- Recipient reveals balance: existing Private Reveal tab ✅ already built

**In production**, the admin workflow is designed for server-side: batch encrypt N recipients, sign N pairs, store pairs in a DB, recipients fetch their pair and submit. A server signer is not strictly required (frontend admin can do it manually), but the UX would be clunky for large recipient lists.

---

## Backend Signer Required?

**No for MVP demo.** The admin connects wallet in the browser, creates the campaign, signs per-recipient claims using `useSignClaimAuthorization`. All operations are wagmi wallet calls.

**Would be needed for production** to handle large recipient lists (batch sign N pairs without requiring the admin to approve N MetaMask popups).

---

## Reuse from Existing Codebase

| Component | Reusable? |
|---|---|
| `useTokenOpsEncryptor` | ✅ Yes — same pattern, same `createSepoliaEncryptorWeb` |
| ERC-7984 token address from registry | ✅ Yes — same `WRAPPER_ABI` and registry pairs |
| `setOperator` flow | ✅ Yes — same ABI, same pattern; operator = **factory address** (not disperse singleton) |
| Private Reveal tab for claimed balance | ✅ Yes — recipient's confidential balance is on the same ERC-7984 token |
| SiteNav / layout | ✅ Yes |
| Zama FHE encryptor | ✅ Yes — `useTokenOpsEncryptor` hook unchanged |

**New components needed:**
- `useAirdropEncrypt` hook: calls `encryptUint64({ value, contractAddress: airdropAddress, userAddress: recipient })`
- `CreateCampaignForm` component: `AirdropParams`, `userSalt`, `amount`, setOperator step
- `SignRecipientsForm` component: per-recipient address input → `useSignClaimAuthorization` → export pairs
- `ClaimForm` component: paste `{ encryptedInput, signature }` → `useClaim`
- A delivery mechanism for `{ encryptedInput, signature }` pairs (download JSON or copy-paste for MVP)

---

## Highest-Risk Blockers

1. **Per-recipient encryption UX** — the admin must approve one `encrypt()` call per recipient (requires encryptor initialization and a relayer round-trip per call). For 5+ recipients, this means 5+ sequential interactions. Mitigation: batch in a single async loop; show progress in UI.

2. **gasFee on claim** — `useClaim` attaches ETH automatically (`gasFee()` is fetched live), but the recipient needs a small ETH balance on Sepolia. The gas fee value can be zero on Sepolia if the factory has `defaultGasFee = 0`, but this needs verification at runtime.

3. **AirdropParams.admin must equal msg.sender** — when calling `createAndFundConfidentialAirdrop`, the `admin` param must match the connected wallet address. If admin ≠ msg.sender, the contract will accept the call but the admin won't have `DEFAULT_ADMIN_ROLE` and `signClaimAuthorization` will fail.

4. **Claim window timing** — `startTimestamp` and `endTimestamp` must be valid future unix timestamps. Setting a very short window in a demo could cause "claim window not active" errors.

5. **Encrypted input delivery** — recipient needs `{ encryptedInput, signature }` from admin. For a demo, this must be manually passed (copy-paste or JSON download). This is acceptable for MVP but limits UX polish.

---

## Recommended MVP Scope

### Admin tab: "Create Campaign"
1. Token address input (or pick from registry)
2. `setOperator(factoryAddress, deadline)` step (if not already done)
3. Campaign params: start/end timestamps, total amount
4. `useCreateAndFundConfidentialAirdrop` → deploy + fund in one tx
5. Show resulting airdrop clone address

### Admin tab: "Issue Claims"
1. Input: airdrop address + list of recipient addresses + amounts
2. For each: `encryptUint64` → `useSignClaimAuthorization` → collect `{ encryptedInput, signature }`
3. Display payload per recipient (copy or JSON download)

### Recipient tab: "Claim"
1. Input: airdrop address + paste `{ encryptedInput, signature }` JSON
2. `useClaim` → tx confirmed
3. "Reveal your claimed balance" → link to /registry Private Reveal

---

## GO / NO-GO Verdict

**GO — with scoped MVP.**

- SDK is fully functional (confirmed loaded in T1)
- Factory address confirmed on Sepolia (`0xbE6A…`)
- All required hooks exist with clear types
- Frontend-only demo is feasible
- Key constraint (per-recipient encryption) is manageable for small recipient lists
- Existing `useTokenOpsEncryptor`, Private Reveal, and setOperator patterns reuse cleanly

**Recommended scope:** 3-tab Operations expansion — Create Campaign / Issue Claims / Claim — built in `/operations` as a new tab alongside Disperse, or as a separate `/airdrop` route.

**Timeline estimate:** 2–3 days for a working Sepolia demo.

---

## Step 9A Implementation Notes (2026-06-02)

**Status:** Implemented — `/airdrop` route + `CreateAirdropForm` component

### SDK hook used
`useCreateAndFundConfidentialAirdropAndGetAddress` from `@tokenops/sdk/fhe-airdrop/react`
- Returns `CreateAirdropResult { hash: TxHash, airdrop: Address }` after parsing `ConfidentialAirdropCreated` event from receipt
- Takes `CreateAndFundAirdropArgs { params: AirdropParams, userSalt: Hex, amount: bigint }`
- `encryptor` passed via `FactoryHookOptions` at hook level — same lazy factory pattern as Disperse

### setOperator target
- Operator = **Airdrop Factory** (`0xbE6A3B78B36684fFee48De77d47Bc3393F5Acd4c`)
- Same `erc7984OperatorAbi` and `ERC7984_OPERATOR_MAX_DEADLINE` imported from `@tokenops/sdk/fhe-disperse` (re-exported from core)
- Same guided card pattern as Disperse's "Allow Disperse" card

### userSalt generation
- `crypto.getRandomValues(new Uint8Array(32))` → `toHex()` — browser-safe, no `ethers` import needed

### Files created
- `src/app/airdrop/page.tsx` — page shell, static prerendered
- `src/components/airdrop/CreateAirdropForm.tsx` — create + fund form
- `SiteNav.tsx` — Airdrop nav link added

### What remains for Step 9B and 9C
- **9B (Issue Claims):** per-recipient `encryptUint64({ userAddress: recipient })` + `useSignClaimAuthorization` + JSON export of `{ encryptedInput, signature }` pairs
- **9C (Recipient Claim):** paste `{ encryptedInput, signature }` → `useClaim` → link to Private Reveal tab in /registry

## Step 9B Implementation Notes (2026-06-02)

**Status:** Implemented — IssueClaimsForm + AirdropTabs on /airdrop

### Exact SDK encryption function
`encryptUint64` from `@tokenops/sdk/fhe-airdrop`
- Args: `{ encryptor, contractAddress: airdropAddress, userAddress: recipient, value: bigint }`
- Returns: `EncryptedInput { handle: Hex, inputProof: Hex }`
- Proof is BOUND to (airdropAddress, recipientAddress) — cannot be reused cross-recipient

### Exact SDK signing function
`useSignClaimAuthorization()` from `@tokenops/sdk/fhe-airdrop/react`
- `mutateAsync({ airdropAddress, recipient, encryptedAmountHandle: handle })`
- Returns: `Hex` (EIP-712 ECDSA signature)
- Admin must hold DEFAULT_ADMIN_ROLE on the airdrop clone

### Generated JSON shape per recipient
```json
{
  "airdropAddress": "0x...",
  "recipient": "0x...",
  "label": "Alice",
  "amountDisplay": "10",
  "encryptedInput": { "handle": "0x...", "inputProof": "0x..." },
  "signature": "0x..."
}
```

### What remains for Step 9C
- Recipient tab: paste JSON payload → `useClaim({ address: airdropAddress }).mutate({ encryptedInput, signature })`
- After claim: link to /registry → Private Reveal to decrypt claimed balance

## Step 9C Implementation Notes (2026-06-02)

**Status:** Implemented — ClaimAirdropForm wired into 3rd tab of AirdropTabs

### Exact SDK claim hook
`useClaim(options: { address: Address })` from `@tokenops/sdk/fhe-airdrop/react`
- `address` is REQUIRED at hook call time — zero address fallback used when no JSON parsed
- `mutate({ encryptedInput: { handle: Hex, inputProof: Hex }, signature: Hex })`
- Returns: `Hex` (tx hash)
- Gas fee attached automatically by SDK

### JSON payload accepted
```json
{
  "airdropAddress": "0x...",
  "recipient": "0x...",
  "label": "Alice",
  "amountDisplay": "10",
  "encryptedInput": { "handle": "0x...", "inputProof": "0x..." },
  "signature": "0x..."
}
```

### Wallet mismatch guard
If `walletAddress !== payload.recipient`, claim button is disabled with clear warning.
The Zama input proof is bound to the recipient address — submitting with a different wallet would cause an on-chain revert.

### What remains
- Step 9A+9B+9C full flow manual QA on Sepolia (create campaign → issue claims → recipient claims → Private Reveal)
- Optional: useAirdropIsSignatureClaimed to detect already-claimed signatures
- Optional: batch claim flow for multiple payloads

## Step 9A / 9B / 9C — Implementation Status (2026-06-02)

**All three steps IMPLEMENTED and MANUALLY VERIFIED.**

| Step | Status | Notes |
|---|---|---|
| 9A Create Campaign | ✅ Verified | `useCreateAndFundConfidentialAirdropAndGetAddress` — campaign `0x33C653…` |
| 9B Issue Claims | ✅ Verified | `encryptUint64` + `useSignClaimAuthorization` per recipient; JSON export with copy/download |
| 9C Recipient Claim | ✅ Verified | `useClaim` with array/object/wrapper JSON parser; wallet auto-match; claim tx confirmed |

**Confirmed txs:**
- Create/Fund: `0x293a7c13de17ca77adfa6d2978bd07923e1ec910181375c34b43e54ea6196705`
- Claim: `0xb68b7293e655cdd83ebe24e2d0f484c32a18d31a779d082441edb227fb4a59d5`

**Full details:** `docs/QA_CHECKPOINT_TOKENOPS_AIRDROP.md`
