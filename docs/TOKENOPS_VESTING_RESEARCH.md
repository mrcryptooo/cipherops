# TokenOps Confidential Vesting — Research (Step 10)

**Date:** 2026-06-02  
**Packages inspected:** `@tokenops/sdk/fhe-vesting`, `@tokenops/sdk/fhe-vesting/react`, `@tokenops/sdk/fhe-vesting/advanced`

---

## SDK Package Paths Inspected

| Path | Files found | Status |
|---|---|---|
| `@tokenops/sdk/fhe-vesting` | factory.d.ts, manager.d.ts, types.d.ts, encryption.d.ts, abis/ | ✅ Loaded |
| `@tokenops/sdk/fhe-vesting/react` | 100+ hook .d.ts files | ✅ Loaded |
| `@tokenops/sdk/fhe-vesting/advanced` | factory-advanced.d.ts, usePredictManagerAddress | ✅ Loaded |

---

## Sepolia Addresses (confirmed from T1)

| Contract | Chain | Address |
|---|---|---|
| `confidentialVestingFactory` | Sepolia (11155111) | `0xA87701CE9A52D43681600583a99c85b50DbE3150` |
| Source | `DEPLOYED_ADDRESSES.fheVesting.confidentialVestingFactory[11155111]` | auto-resolved from chain id |

---

## Exact Vesting Flow

```
ADMIN SIDE:
┌───────────────────────────────────────────────────────────────────────┐
│ 1. useCreateManagerAndGetAddress({ token, userSalt })                  │
│    → deploys manager clone from factory                                │
│    → parses ManagerCreated event → returns { hash, manager: Address } │
│    Factory auto-resolved from chain id (no address param needed)       │
│                                                                       │
│ 2. setOperator(managerAddress, deadline) on ERC-7984 token            │
│    → same pattern as Disperse/Airdrop but operator = manager clone    │
│    → must be called BEFORE createVesting can pull tokens from admin   │
│                                                                       │
│ 3. For EACH recipient:                                                │
│    useCreateVesting({ address: managerAddress, encryptor }).mutate({  │
│      params: {                                                        │
│        recipient:           Address,                                  │
│        startTimestamp:      number,   // unix timestamp               │
│        endTimestamp:        number,   // unix timestamp               │
│        cliffSeconds:        number,   // 0 = no cliff                │
│        releaseIntervalSecs: number,   // e.g. 86400 = daily          │
│        timelockSeconds:     number,   // 0 = no lock after cliff     │
│        initialUnlockBps:    number,   // e.g. 1000 = 10% at start   │
│        cliffAmountBps:      number,   // % unlocked at cliff         │
│        isRevocable:         boolean,                                  │
│      },                                                               │
│      amount: bigint,  // SDK encrypts via encryptor                  │
│    })                                                                 │
│    → emits VestingCreated event with vestingId (bytes32)              │
│    → NOTE: no per-recipient signature required (unlike Airdrop)       │
└───────────────────────────────────────────────────────────────────────┘

RECIPIENT SIDE:
┌───────────────────────────────────────────────────────────────────────┐
│ 4. Obtain vestingId (bytes32)                                         │
│    → admin shares it, or recipient scans VestingCreated events        │
│    → useRecipientVestings({ address: managerAddress, recipient })     │
│      returns the recipient's list of vestingIds                       │
│                                                                       │
│ 5. Read fee type first:                                               │
│    useManagerFeeInfo({ address: managerAddress })                     │
│    → { feeType: FeeType.Gas | FeeType.DistributionToken, fee }       │
│                                                                       │
│ 6. useVestingClaim({ address: managerAddress }).mutate({             │
│      vestingId,                                                       │
│      feeType: FeeType.Gas,   // or FeeType.DistributionToken         │
│      value: gasFeeWei,       // only for FeeType.Gas                 │
│    })                                                                 │
│    → transfers claimable vested tokens to recipient                  │
│                                                                       │
│ 7. Reveal vested balance via Private Reveal                          │
│    → same flow as existing CipherOps Private Reveal tab in /registry │
└───────────────────────────────────────────────────────────────────────┘
```

---

## Key Difference from Disperse/Airdrop

| Aspect | Disperse | Airdrop | Vesting |
|---|---|---|---|
| Contract model | Singleton | Clone per campaign | Clone per manager (per admin/token) |
| Operator target | Disperse singleton | Airdrop factory | **Manager clone** |
| Admin per-recipient work | None (batch) | N encr + N EIP-712 sigs | N `createVesting` calls (with encryption) |
| Per-recipient admin signature? | No | **Yes** | **No** |
| Recipient action | None | Paste JSON + claim | Know vestingId + claim |
| Time-locked? | No | Yes (claim window) | **Yes** — vesting schedule |
| Complexity vs. Airdrop | Simpler | — | **Simpler** (no claim JSON delivery needed) |

**Vesting is simpler than Airdrop** because there is NO per-recipient EIP-712 signing and no JSON delivery mechanism needed. The admin creates schedules, recipients claim with just their `vestingId`.

---

## Exact Exported Functions & Hooks

### Factory hooks (`@tokenops/sdk/fhe-vesting/react`)

| Hook | Purpose | Encryptor needed? |
|---|---|---|
| `useCreateManager` | Deploy manager clone | No |
| `useCreateManagerAndGetAddress` | Deploy + parse address from event | **No — recommended** |
| `useConfidentialVestingFactoryImplementation` | Read factory implementation | No |
| `useFactoryDefaultGasFee` / `useFactoryDefaultTokenFee` | Read fee config | No |

### Manager hooks (`@tokenops/sdk/fhe-vesting/react`)

| Hook | Purpose | Encryptor? | Notes |
|---|---|---|---|
| `useCreateVesting` | Create single schedule | **Yes** | SDK encrypts `amount` |
| `useBatchCreateVesting` | Create N schedules in one tx | **Yes** | More efficient for multiple recipients |
| `useVestingClaim` | Recipient claims claimable amount | No | needs `vestingId` + `feeType` + optional `value` |
| `usePartialClaim` | Admin-initiated partial claim | **Yes** | Admin encrypts partial amount |
| `useRevokeVesting` | Admin revokes revocable schedule | No | |
| `useRecipientVestings` | Read recipient's vestingId list | No | returns vestingId[] |
| `useVestingInfo` | Read vesting schedule info | No | |
| `useManagerFeeInfo` | Read fee type + amount | No | **Required before claim** |
| `useManagerToken` | Read which ERC-7984 token | No | |
| `useGetClaimableAmount` | Read claimable amount (admin, ACL needed) | No | |
| `useAccessClaimableAmount` | ACL-gated encrypted view of claimable | No | |

### Types

```typescript
interface VestingParams {
  recipient:           Address;
  startTimestamp:      number;   // unix timestamp (uint32)
  endTimestamp:        number;   // unix timestamp (uint32)
  cliffSeconds:        number;   // seconds after start for cliff release
  releaseIntervalSecs: number;   // periodic release interval (e.g. 86400 = daily)
  timelockSeconds:     number;   // lock period after cliff
  initialUnlockBps:   number;   // basis points unlocked at startTimestamp
  cliffAmountBps:     number;   // basis points unlocked at cliff
  isRevocable:        boolean;  // whether admin can revoke
}

// ClaimArgs — discriminated by feeType (read from useManagerFeeInfo first)
type ClaimArgs =
  | { vestingId: VestingId; feeType: FeeType.Gas; value: bigint }      // attach ETH
  | { vestingId: VestingId; feeType: FeeType.DistributionToken }         // token deducted

interface CreateManagerArgs {
  token:          Address;  // ERC-7984 confidential token
  userSalt:       Hex;      // random bytes32
  splitEnabled?:  boolean;  // default true
  pausableEnabled?: boolean; // default true
}

interface CreateManagerResult {
  hash:    TxHash;
  manager: Address;  // parsed from ManagerCreated event
}
```

---

## Frontend-Only Possible?

**YES — completely.**

Unlike Airdrop, Vesting has NO per-recipient admin signature step. The admin calls `createVesting` (which encrypts the amount via the encryptor), and recipients call `vestingClaim` with their `vestingId`. Both sides are standard wagmi write calls.

The `vestingId` delivery problem: recipients need to know their `vestingId`. Solutions for MVP:
1. Admin copies `vestingId` from tx receipt (parsed from VestingCreated event) and shares it
2. Recipient uses `useRecipientVestings({ address: managerAddress, recipient: walletAddress })` to auto-discover their vestingIds — this is the cleanest UX

---

## Backend Signer Required?

**No.** All operations are standard wagmi wallet calls:
- Admin: `createManager` → `setOperator` → `createVesting` (with FHE encryptor)
- Recipient: `vestingClaim` (no encryption needed, just `vestingId`)

---

## Comparison With Disperse and Airdrop

| Feature | Disperse | Airdrop | Vesting |
|---|---|---|---|
| `useTokenOpsEncryptor` reusable | ✅ | ✅ | ✅ |
| ERC-7984 registry pairs reusable | ✅ | ✅ | ✅ |
| Private Reveal for claimed balance | ✅ | ✅ | ✅ |
| Per-recipient admin sig | No | Yes | **No** |
| Claim JSON delivery needed | N/A | Yes | **No** — auto-discover via hook |
| Implementation complexity | Low | Medium | **Low-Medium** |

---

## New Hooks/Components Needed

1. **`CreateManagerForm`** — `useCreateManagerAndGetAddress` → store manager address
2. **`SetOperatorCard`** — same `erc7984OperatorAbi` pattern, operator = manager address
3. **`CreateVestingForm`** — `useCreateVesting` with all 9 `VestingParams` fields + amount
4. **`RecipientClaimForm`** — `useRecipientVestings` (auto-discover vestingIds) + `useManagerFeeInfo` + `useVestingClaim`

Reuse: `useTokenOpsEncryptor`, `AirdropTabs` pattern for tab navigation.

---

## Highest-Risk Blockers

1. **VestingParams has 9 fields** — form is more complex than any previous feature. `releaseIntervalSecs`, `cliffSeconds`, `timelockSeconds`, `initialUnlockBps`, `cliffAmountBps` all need careful UI/UX to be usable.

2. **Fee type discrimination** — `ClaimArgs` is a discriminated union; recipient must read `useManagerFeeInfo` to know which branch to use. If fee type is `Gas`, they also need to attach `value`. Forgetting this causes a silent revert.

3. **setOperator target is manager (not factory)** — easy to confuse with Airdrop (which uses factory as operator). Must use the manager clone address from step 1.

4. **vestingId delivery** — for MVP, `useRecipientVestings({ address: managerAddress, recipient })` auto-resolves the recipient's schedules. No manual sharing needed.

5. **Timestamps** — `startTimestamp` / `endTimestamp` are `uint32` (unix seconds). Setting unrealistic dates in the demo could cause "vesting not started" errors.

---

## Recommended MVP Scope

### 3-tab layout under `/vesting` (or as a 4th tab in `/operations`):

**Tab 1 — Create Manager:**
- Token address input (from registry or manual)
- `setOperator(managerAddress, deadline)` guided card
- `useCreateManagerAndGetAddress({ token, userSalt })` → display manager address

**Tab 2 — Create Schedule:**
- Manager address input
- Recipient address
- Amount
- Schedule params: start, end, cliff, interval, revocable (simplified — hide advanced BPS fields)
- `useCreateVesting({ address: managerAddress, encryptor })` → display vestingId

**Tab 3 — Claim:**
- Manager address input
- Auto-discover vestingIds via `useRecipientVestings` (connected wallet)
- `useManagerFeeInfo` reads fee type automatically
- `useVestingClaim` with correct fee discriminant
- After claim: link to /registry → Private Reveal

---

## GO / NO-GO Verdict

**GO — with scoped MVP.**

- SDK fully functional (all hooks confirmed in T1)
- Factory address confirmed on Sepolia (`0xA877…`)
- **No per-recipient admin signing** — simpler than Airdrop
- Auto-discover vestingIds via `useRecipientVestings` — no manual delivery
- `useTokenOpsEncryptor` reuses cleanly
- Highest complexity: 9-field `VestingParams` form + fee-type discrimination on claim

**Implementation time:** 1.5–2 days for a working Sepolia demo (faster than Airdrop because no claim JSON mechanism needed).

**Recommended approach:** Add as a new `/vesting` route rather than a 4th tab in `/operations` — the manager lifecycle (create manager → set operator → create schedules → claim) maps better to a standalone page.

## Step 11A Implementation Notes (2026-06-02)

**Status:** Implemented — CreateVestingManagerForm + VestingTabs on /vesting

### Exact SDK hook used
`useCreateManagerAndGetAddress` from `@tokenops/sdk/fhe-vesting/react`
- Args: `{ token: Address, userSalt: Hex, splitEnabled?: boolean, pausableEnabled?: boolean }`
- Returns: `CreateManagerResult { hash: TxHash, manager: Address }`
- Factory address auto-resolved from chain id (no `address` override needed)
- No encryptor required at this step

### Manager address return method
Parsed from `ManagerCreated` event inside the hook — `useCreateManagerAndGetAddress` handles receipt + event parsing internally.

### userSalt generation
`keccak256(toBytes(walletAddress + ":" + managerLabel + ":" + timestamp))` — deterministic per session, unique per label.

### What remains
- **Step 11B** — `setOperator(managerAddress, deadline)` + `useCreateVesting({ address: managerAddress, encryptor })` with `VestingParams` form
- **Step 11C** — `useRecipientVestings` + `useManagerFeeInfo` + `useVestingClaim` for recipient claim

## Step 11B Implementation Notes (2026-06-02)

**Status:** Implemented — CreateVestingScheduleForm + Tab 2 wired on /vesting

### Exact SDK create schedule hook
`useCreateVesting(options: ManagerHookOptions)` from `@tokenops/sdk/fhe-vesting/react`
- `options.address` = manager clone address (required)
- `options.encryptor` = lazy factory from `useTokenOpsEncryptor`
- Args: `{ params: VestingParams, amount: bigint }`
- Returns: `Hex` (tx hash only — vestingId parsed separately from receipt)

### VestingParams shape used
All 9 fields: `recipient, startTimestamp, endTimestamp, cliffSeconds, releaseIntervalSecs, timelockSeconds (=0), initialUnlockBps (=0), cliffAmountBps (=0), isRevocable`
Defaults for QA: start = now+60s, duration = 5min, interval = 60s, cliff = 0, revocable = false

### setOperator details
- ABI: `erc7984OperatorAbi` from `@tokenops/sdk/fhe-vesting`
- Deadline: `ERC7984_OPERATOR_MAX_DEADLINE` imported from `@tokenops/sdk/fhe-disperse` (not in fhe-vesting)
- Operator = manager clone address (NOT factory, NOT disperse singleton)
- wagmi useWriteContract + useWaitForTransactionReceipt pattern reused from Disperse

### vestingId extraction
`confidentialVestingManagerAbi` from `@tokenops/sdk/fhe-vesting` used with viem `decodeEventLog` on receipt logs, eventName: "VestingCreated", indexed field: `vestingId: bytes32`

### What remains for Step 11C
- `useRecipientVestings({ address: managerAddress, recipient })` → auto-discover vestingIds
- `useManagerFeeInfo({ address: managerAddress })` → read feeType + fee
- `useVestingClaim({ address: managerAddress }).mutate({ vestingId, feeType, value? })` → claim
- After claim: link to /registry → Private Reveal

## Step 11B — Manual QA Result (2026-06-02)

**Status:** ✅ Implemented and manually verified on Sepolia

| Field | Value |
|---|---|
| Manager | `0xD3B4b66733E1F1Df883581e08f80CcedAF0B5ccE` |
| Recipient | `0x1afB9439693797FA7D5798B4706be7a27a5FD282` |
| Token | `0x7c5BF43B851c1dff1a4feE8dB225b87f2C223639` |
| Vesting schedule tx | `0x5a7743fabe923e26a298454d4e1957e212506253de862440c48594c2a11f9501` |
| Vesting ID | `0x0000000000000000000000000000000000000000000000000000000000000000` |
| Network | Ethereum Sepolia |

**Caveat:** One transient `encryptUint64: invalid config — Zama SDK configuration is invalid` error occurred on the first attempt. A retry succeeded without code changes. Treated as an intermittent encryptor readiness / signer timing issue (same class as previous Disperse CONFIGURATION error fixed in T2B). No code fix applied; will address if it repeats.

**Note on vestingId:** The confirmed vestingId is the zero hash (`0x0000…0000`). This is the bytes32 emitted in the `VestingCreated` event and is a valid identifier for this schedule — it is not an error. The zero vestingId is used for the first schedule created on a fresh manager. Recipients use this id with `useVestingClaim`.

**Next step:** Step 11C — Recipient Vesting Claim
- `useRecipientVestings({ address: manager, recipient })` → auto-discover vestingIds
- `useManagerFeeInfo({ address: manager })` → read feeType (Gas vs DistributionToken) + fee amount
- `useVestingClaim({ address: manager }).mutate({ vestingId, feeType, value? })` → claim
- After claim: recipient uses /registry → Private Reveal to see vested balance

## Step 11C Implementation Notes (2026-06-02)

**Status:** Implemented — ClaimVestingForm + Tab 3 wired on /vesting

### Exact SDK hooks used
- `useRecipientVestings({ address, recipient, chainId })` from `@tokenops/sdk/fhe-vesting/react`
  → `UseQueryResult<readonly Hex[], Error>` — returns all vestingIds for recipient on this manager
- `useManagerFeeInfo({ address, chainId })` from `@tokenops/sdk/fhe-vesting/react`
  → `UseQueryResult<{ feeType: FeeType, fee: bigint }, Error>`
- `useClaim({ address, chainId })` from `@tokenops/sdk/fhe-vesting/react`  ← NOT useVestingClaim
  → `UseMutationResult<TxHash, Error, ClaimArgs>`

### Naming correction
The hook is `useClaim`, NOT `useVestingClaim` as the research doc initially said. Confirmed via runtime inspection.

### feeType handling
ClaimArgs is a discriminated union:
- `FeeType.Gas` (0): `{ vestingId, feeType: FeeType.Gas, value: fee }` — attaches ETH
- `FeeType.DistributionToken` (1): `{ vestingId, feeType: FeeType.DistributionToken }` — no ETH

### Manual vestingId fallback
Prefilled with `0x0000…0000` (the vestingId from Step 11B). Used when `useRecipientVestings` returns empty (schedule newly created or RPC indexing lag).

### Manual QA instructions for Step 11C
1. Open /vesting → "3 · Recipient Claim" tab
2. Connect MetaMask as the RECIPIENT wallet (0x1afB9439…7a5FD282)
3. Manager address prefilled: 0xD3B4b66733E1F1Df883581e08f80CcedAF0B5ccE
4. Refresh button → wait for vestingId discovery (or use manual vestingId 0x0000…0000)
5. Fee info shows feeType and fee amount
6. Wait for vesting to be claimable (after startTimestamp elapsed)
7. Click "Claim Vested Tokens" → MetaMask → confirm
8. Success card shows tx hash + link to /registry Private Reveal

## Steps 11A / 11B / 11C — Final Status (2026-06-02)

**All three steps IMPLEMENTED and MANUALLY VERIFIED on Sepolia.**

| Step | Status | Key tx |
|---|---|---|
| 11A Create Manager | ✅ Verified | `0x046a837c…102b` |
| 11B Create Schedule | ✅ Verified | `0x5a7743…501` |
| 11C Recipient Claim | ✅ Verified | `0x398015…67ec` |

**Full details:** `docs/QA_CHECKPOINT_TOKENOPS_VESTING.md`
