# TokenOps SDK — Client Analysis (T1)

## Versions
- @tokenops/sdk: 1.0.0
- @zama-fhe/sdk: 3.0.1 (already present before install; no version bump triggered)
- @zama-fhe/relayer-sdk: 0.4.3 (existing, pre-install)

## Deployed Addresses

| Product | Contract | Chain | Chain ID | Address |
|---|---|---|---|---|
| fheVesting | confidentialVestingFactory | Sepolia | 11155111 | 0xA87701CE9A52D43681600583a99c85b50DbE3150 |
| fheAirdrop | confidentialAirdropFactory | Sepolia | 11155111 | 0xbE6A3B78B36684fFee48De77d47Bc3393F5Acd4c |
| fheDisperse | disperseConfidentialSingleton | Mainnet | 1 | 0x4fC0d28cBe4B82D512Ad0B42F6787480Cc98cC70 |
| fheDisperse | disperseConfidentialSingleton | Sepolia | 11155111 | 0x710dD9885Cc9986EfD234E7719483147a6d8DBb4 |

All three products are deployed on Sepolia testnet (11155111). fheDisperse is the only product with a mainnet (chainId 1) deployment.

## Dependency Conflict Check

No conflict between @zama-fhe/sdk and @zama-fhe/relayer-sdk. Both coexist in node_modules without errors.

The only peer dep warning flagged during install is pre-existing and unrelated to these packages: `use-sync-external-store@1.2.0` (inside `valtio@1.13.2`) requires `react@^16.8.0 || ^17.0.0 || ^18.0.0` but the project has `react@19.2.7`. npm overrode the conflict. This affects valtio, not the TokenOps or Zama packages.

28 moderate severity vulnerabilities are pre-existing and did not change.

## Module Load Status

| Import path | Status | Notes |
|---|---|---|
| @tokenops/sdk | LOADED | 51 exports; ESM and CJS both resolve identically |
| @tokenops/sdk/fhe | LOADED | 55 exports including createSepoliaEncryptorWeb, createSepoliaEncryptor, createMockEncryptor, createLocalFhevmEncryptor |
| @tokenops/sdk/fhe-airdrop | LOADED | ~52 exports including ConfidentialAirdropClient, ConfidentialAirdropFactoryClient, encryptUint64 |
| @tokenops/sdk/fhe-disperse | LOADED | ~57 exports including ConfidentialDisperseClient, encryptUint64, role constants |
| @tokenops/sdk/fhe-vesting | LOADED | ~61 exports including ConfidentialVestingFactoryClient, ConfidentialVestingManagerClient, encryptUint64 |
| @tokenops/sdk/fhe-airdrop/react | LOADED | 83 exports including all use* hooks |
| @tokenops/sdk/fhe-disperse/react | LOADED | 82 exports including all use* hooks |
| @tokenops/sdk/fhe-vesting/react | LOADED | 122 exports including all use* hooks |
| @tokenops/sdk/fhe/react | LOADED | 5 exports: base error classes + useDecryptedHandle |

No module failed to load. No missing exports were detected.

## Exported Clients Per Module

### Confidential Disperse (fhe-disperse)

- **Client factory:** `createConfidentialDisperseClient`
- **Class:** `ConfidentialDisperseClient`
- **Deployed on:** Sepolia (11155111) and Mainnet (1)
- **Required constructor args:**
  - `publicClient: PublicClient` — required
  - `walletClient?: WalletClient` — optional at construction, required for write methods
  - `address?: Address` — auto-resolved from chain registry if omitted
  - `chainId?: number` — defaults to `publicClient.chain?.id`
  - `encryptor?: EncryptorSource` — optional at construction, required at call-time for `disperse` and `getEncryptedFeeReserve`
  - `aclAddress?: Address` — FHEVM ACL override; required if chain registry cannot resolve it
  - `telemetry?: SdkTelemetry` — optional
- **Encryption:** `encryptUint64` and `encryptUint64Batch` available and confirmed as functions
- **DisperseArgs shape:** `{ token: Address, mode: DisperseMode, recipients: Address[], amounts: bigint[], gasFeeOverride?: bigint, account?: Account | Address }`
- **DisperseMode values:** `"wallet" | "wallet-token-fee" | "direct"`
- **Role constants exported:** FEE_COLLECTOR_ROLE, FEE_MANAGER_ROLE, PAUSER_ROLE, WITHDRAWER_ROLE, DEFAULT_ADMIN_ROLE
- **Frontend-only possible:** Yes — user connects wallet, creates encryptor via `createSepoliaEncryptorWeb`, calls `disperse` with their own signer. No backend required for the core flow. `usePreflightDisperse` and `useRegister` hooks available.
- **Admin/signer required:** The transacting user must be a registered wallet (`register()` must be called once per user address before first disperse). This is a one-time on-chain step the user can self-execute in the frontend.

### Confidential Airdrop (fhe-airdrop)

- **Factory client:** `createConfidentialAirdropFactoryClient`
- **Instance client:** `createConfidentialAirdropClient`
- **Deployed on:** Sepolia (11155111) only
- **Required args for factory deploy:**
  - `publicClient: PublicClient` — required
  - `walletClient?: WalletClient` — required for writes
  - `address?: Address` — auto-resolved from chain registry
  - `encryptor?: EncryptorSource` — required at call-time for `createAndFundConfidentialAirdrop` and `fundConfidentialAirdrop`
- **CreateAndFundAirdropArgs:** Discriminated union — either `amount: bigint` (SDK encrypts) or `encryptedInput: EncryptedInput` (pre-encrypted). `params: AirdropParams`, `userSalt: Hex` are required in both branches.
- **FundAirdropArgs:** Requires `token`, `params`, `userSalt`, `deployer`, `gasFee` (bigint matching on-chain fee at creation time). `gasFee` must match what was set at clone creation — obtain via `factory.getCustomFee(deployer)` or `factory.defaultGasFee()`.
- **Claim flow:** `signClaimAuthorization` utility available; `ClaimArgs` requires a signed authorization. Errors: `AlreadyClaimedError`, `ClaimNotStartedError`, `ClaimWindowClosedError`.
- **Frontend-only:** Partially — the factory deployer (airdrop creator) must fund the clone with tokens. End-user claiming is fully frontend-capable once a funded airdrop exists. Creating and funding a new airdrop requires the deployer to hold tokens and interact from the frontend.

### Confidential Vesting (fhe-vesting)

- **Factory client:** `createConfidentialVestingFactoryClient`
- **Manager client:** `createConfidentialVestingManagerClient`
- **Deployed on:** Sepolia (11155111) only
- **Factory required args:**
  - `publicClient: PublicClient` — required
  - `walletClient?: WalletClient` — required for writes
  - `address?: Address` — auto-resolved from registry
- **CreateManagerArgs:** `token: Address`, `userSalt: Hex` (required); `splitEnabled?: boolean`, `pausableEnabled?: boolean`, `account?` (optional). Returns `CreateManagerResult` with `hash: TxHash` and `manager: Address`.
- **Manager required args:**
  - `publicClient: PublicClient` — required
  - `address: Address` — REQUIRED (deployed clone address, not auto-resolved)
  - `walletClient?: WalletClient` — required for writes
  - `encryptor?: EncryptorSource` — required at call-time for `createVesting`, `batchCreateVesting`, `partialClaim`, `splitVesting`, `withdrawAdmin`, `withdrawTokenFee`
- **VestingParams fields:** `recipient`, `startTimestamp`, `endTimestamp`, `cliffSeconds`, `releaseIntervalSecs`, `timelockSeconds`, `initialUnlockBps`, `cliffAmountBps` (all number), `isRevocable` (boolean)
- **Special exports:** `DisclosureType` enum, `FeeType` enum, `FHE_SPLIT_DENOMINATOR` constant, `scaleRatio`, `share` utilities
- **Frontend-only:** Partial — the vesting creator must deploy a manager clone first (factory `createManager` tx), then call `createVesting` per recipient. Both steps require a signer and can be done from the frontend. Recipient claiming (`claim`, `partialClaim`) is fully frontend-capable. No dedicated backend required.

## FHE Encryptor (Browser Path)

- **createSepoliaEncryptorWeb:** AVAILABLE — confirmed exported from `@tokenops/sdk/fhe`
- **Requires:** `publicClient: PublicClient` and `walletClient: WalletClient` (both viem types)
- **Optional config:** `relayerUrl?: string` (defaults to Zama public Sepolia relayer `https://relayer.testnet.zama.org/v2`), `chainId?: number` (defaults to `SEPOLIA_CHAIN_ID` = 11155111), `logger?: SepoliaEncryptorLogger`
- **Returns:** `SepoliaEncryptorWeb` — implements the `Encryptor` interface; exposes `instance` (underlying `RelayerWeb`) for `userDecrypt`/`publicDecrypt` and explicit `terminate()` on page unload
- **Compatible with current wagmi v2 setup:** Yes — wagmi v2 uses viem `PublicClient` and `WalletClient` internally; these are extracted via `usePublicClient()` and `useWalletClient()` hooks. The `createSepoliaEncryptorWeb` call should be wrapped in a lazy factory function passed as `EncryptorSource` to avoid stale wallet-switch proof invalidation (SDK docs note this pattern explicitly for React/Vue).
- **Replaces @zama-fhe/relayer-sdk:** Partially — `createSepoliaEncryptorWeb` wraps `@zama-fhe/sdk`'s `RelayerWeb` and satisfies the `Encryptor` interface used by all TokenOps SDK methods. For encrypt-and-submit flows, it fully replaces direct `@zama-fhe/relayer-sdk` usage. For `userDecrypt`/`publicDecrypt` (reading plaintext from on-chain handles), the underlying `RelayerWeb` instance is exposed but typed as `unknown`; cast to `import("@zama-fhe/sdk").RelayerWeb` at the use site. The existing `@zama-fhe/relayer-sdk@0.4.3` may still be needed for any decrypt flows not already covered by the TokenOps SDK.

## cUSDCMock / cUSDTMock Compatibility

Yes — all three TokenOps products take a `token: Address` parameter pointing at an ERC-7984 compliant confidential token. The CipherOps registry's `cUSDCMock` and `cUSDTMock` contracts implement ERC-7984 (confirmed by the project's existing erc7984 ABI exports and operator pattern). Disperse and Airdrop accept any ERC-7984 token address; Vesting also accepts `token: Address` on the manager factory. Therefore:

- Disperse: pass `cUSDCMock` or `cUSDTMock` address as `DisperseArgs.token` — compatible
- Airdrop: pass as `AirdropParams.token` — compatible (UNCERTAIN: need to verify AirdropParams.token field name in full types.d.ts, but the pattern matches)
- Vesting: pass as `CreateManagerArgs.token` — compatible

All three products also export `erc7984OperatorAbi` and the `setOperator`/`revokeOperator` helpers from the fhe module, confirming the ERC-7984 operator grant flow is handled inside the SDK.

## MVP Priority Ranking

### 1st: Confidential Disperse

**Reason:** Single deployed singleton on both Sepolia and Mainnet (only product with mainnet presence). No factory clone deployment step — users interact directly with the singleton after a one-time `register()` call. The `usePreflightDisperse` hook enables instant UI validation. `DisperseArgs.amounts` are encrypted by the SDK, hiding individual recipient amounts while the total is visible on-chain — this is the most immediately compelling FHE demo: provably private payroll/airdrop dispatch. React hooks are comprehensive (82 exports). Least setup overhead.

**Feasibility:** 5/5

**Demo value:** 5/5 — "pay multiple people with hidden amounts" is immediately understandable to judges

**Implementation time:** Fast (1–2 days for a working frontend)

**Frontend-only:** Yes — user registers, approves token, calls disperse. All via frontend with wagmi + createSepoliaEncryptorWeb.

---

### 2nd: Confidential Airdrop

**Reason:** Factory + clone pattern adds one deploy step but enables a compelling "private airdrop" story — deployer funds a clone, recipients claim without revealing amounts to others. `signClaimAuthorization` enables gasless claim authorization. React hooks are comprehensive (83 exports). Sepolia-only limits mainnet story but testnet demo is fully functional.

**Feasibility:** 4/5

**Demo value:** 4/5 — "airdrop where no one knows what others received" is a clear narrative

**Implementation time:** Medium (2–3 days; factory deploy UI adds complexity)

**Frontend-only:** Yes for claiming; Yes for deployment if the demo deployer account is funded and connected.

---

### 3rd: Confidential Vesting

**Reason:** Two-step factory pattern (deploy manager, then create vesting schedules per recipient) is the most complex. `VestingParams` has 9 fields. Manager address must be known before creating the manager client. Most powerful for long-term token distribution but requires the most UI surface area. Best suited as a Phase 2 addition after Disperse and Airdrop are working.

**Feasibility:** 3/5 (relative to time available)

**Demo value:** 4/5 — vesting with confidential amounts is genuinely novel

**Implementation time:** Slow (3–5 days for a polished UI)

**Frontend-only:** Yes for both factory and manager flows, but UX complexity is high.

## Risks and Blockers

1. **Zama relayer availability:** `createSepoliaEncryptorWeb` defaults to `https://relayer.testnet.zama.org/v2`. If this public endpoint is rate-limited or temporarily offline, all FHE encryption calls fail. Mitigation: test relayer uptime before demo; consider a fallback mock encryptor (`createMockEncryptor`) for offline testing.

2. **register() prerequisite for Disperse:** Each user address must call `register()` once before first disperse. This adds a one-time onboarding tx to the UX flow. Mitigation: detect `NotRegisteredError` and prompt the user automatically; the React hook `useRegister` is available.

3. **FheVesting manager address not auto-resolved:** Unlike Disperse (singleton) and Airdrop (factory auto-resolves), the vesting manager client requires an explicit `address` parameter (the deployed clone). The frontend must store and retrieve this address after `createManager`. Mitigation: parse the `ManagerCreated` event from the `createManager` receipt; `CreateManagerResult.manager` provides it.

4. **AirdropParams.token field name UNCERTAIN:** The full `AirdropParams` type was not captured in the research data (factory.d.ts was truncated at line 80 before the type definition). Confirmed it exists but exact field names for token, totalAmount, and startTime/endTime need verification against the full types.d.ts.

5. **react@19.2.7 peer dep mismatch with valtio:** Pre-existing conflict; npm overrode it. No runtime crash observed but could surface issues in production builds with strict peer dep enforcement.

6. **Mainnet FHE not yet enabled:** Disperse has a mainnet address but `MAINNET_CHAIN_ID` is referenced only for future use in the encryptor config. The `createSepoliaEncryptorWeb` docs explicitly note "pass MAINNET_CHAIN_ID for the mainnet relayer once Zama enables it; pre-mainnet this stays Sepolia." All demos must target Sepolia.

7. **encryptUint64 binds to (contractAddress, userAddress):** Encrypted handles cannot be replayed against a different contract or sender. If the user switches wallets mid-session, a new encryptor must be instantiated. Mitigation: use lazy `EncryptorSource` factory pattern (wrap in `() => encryptor`) so the SDK re-resolves on each call.

## Recommended Next Step

**Phase T2 — Confidential Disperse Frontend Integration**

1. Install wagmi v2 + viem (already present per project stack).
2. Add a `useEncryptor` hook that calls `createSepoliaEncryptorWeb({ publicClient, walletClient })` as a lazy factory, refreshing when the wallet address changes.
3. Create `createConfidentialDisperseClient` inside a wagmi-aware hook, passing `publicClient`, `walletClient`, and the lazy `encryptor` factory.
4. Add a `Register` button that calls `useRegister`; detect `NotRegisteredError` and auto-prompt.
5. Build a `DisperseForm` component: token address input (prefill with cUSDCMock or cUSDTMock registry address), recipient list (address + amount per row), mode selector (`wallet` / `wallet-token-fee` / `direct`).
6. Use `usePreflightDisperse` to validate before submission; surface `PreflightReport.recipientChecks` as inline row errors.
7. Call `useDisperse` on submit; poll tx receipt and display encrypted confirmation.
8. For viewing received amounts: call `useGetEncryptedFeeReserve` to get the handle, then pass to `relayerWeb.userDecrypt` for plaintext reveal.

Target: working Sepolia testnet demo with cUSDCMock, 3–5 recipients, hidden amounts, in approximately 1–2 days of implementation.
