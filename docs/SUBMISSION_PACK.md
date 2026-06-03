# CipherOps Registry — Submission Pack

---

## Project name
**CipherOps Registry**

## One-line pitch
A production-grade explorer and lifecycle UI for Zama's on-chain confidential token wrapper registry.

## Product explanation
CipherOps reads the official Zama wrapper registry contracts on Sepolia and Ethereum Mainnet and turns them into a usable product. Every entry in the registry maps a public ERC-20 token to its encrypted ERC-7984 confidential counterpart. CipherOps exposes the full lifecycle in a professional dark-themed interface: discover pairs, mint test tokens, wrap, decrypt balances privately, and unwrap — all against official deployed contracts with no intermediaries.

## Problem solved
The Zama wrapper registry is a foundational on-chain primitive, but accessing it requires raw ABI calls and manual FHE SDK integration. Developers and users have no clean interface to discover which confidential wrappers exist, interact with them, or understand the full lifecycle. CipherOps closes that gap — it is the UI layer that the registry has been missing.

## Why it matters for the Zama ecosystem
- Makes the official wrapper registry visible and usable for any EVM user
- Demonstrates the complete FHE lifecycle in a production-quality frontend
- Establishes a reference implementation for building on top of Zama's infrastructure
- Covers all phases: registry discovery, ERC-20→ERC-7984 wrapping, private balance reveal, and two-step async unwrap via Zama Gateway

---

## Core features

| Feature | Detail |
|---|---|
| Registry Explorer | Live read from Zama's official on-chain registry; Sepolia + Mainnet |
| Network switcher | Sepolia (full lifecycle) ↔ Mainnet (read-only discovery) |
| Token metadata | Symbol, name, decimals, rate via multicall |
| Wallet connection | RainbowKit v2 — MetaMask, Coinbase Wallet, WalletConnect |
| Testnet Faucet | `ERC20.mint(address, uint256)` on official Sepolia mock tokens |
| Approve | `ERC20.approve(wrapper, amount)` with live allowance display |
| Wrap | `wrapper.wrap(address, uint256)` — ERC-20 → ERC-7984 |
| Private Reveal | `confidentialBalanceOf` + EIP-712 user-decrypt via Zama relayer SDK |
| Unwrap | `wrapper.unwrap(from, to, encryptedAmount, inputProof)` + Gateway |
| Finalize Unwrap | `wrapper.finalizeUnwrap(requestId, cleartext, proof)` |
| Protocol Coverage panel | 6/6 features live |
| Privacy Lifecycle display | Public Asset → Confidential → Reveal → Unwrap |
| Guided Quickstart | 5-step interactive lifecycle walkthrough |
| **Operations Studio** | **TokenOps Confidential Disperse — private multi-recipient token distribution** |
| Confidential Disperse | `@tokenops/sdk` Disperse singleton; amounts FHE-encrypted per recipient |
| Register + Operator | `register(token)` + `setOperator(singleton, deadline)` pre-flight |
| CSV Recipient Import | Paste `address,amount,label` CSV → validate → preview → populate form |
| Campaign Summary | Token, recipient count, total, mode, readiness at a glance |
| Post-success Receipt | Tx hash, recipient list, encrypted-amount badge, "Disperse again" reset |
| **Confidential Airdrop** | **TokenOps Airdrop — create campaign, issue per-recipient claims, recipient claim + reveal** |
| Airdrop Create + Fund | `useCreateAndFundConfidentialAirdropAndGetAddress` — clone deployed + funded in one tx |
| Issue Claims | `encryptUint64` per recipient + `useSignClaimAuthorization` → portable claim JSON |
| Recipient Claim | Paste JSON, wallet auto-match, `useClaim` → claim tx; reveal via Private Reveal |
| Airdrop Reveal | Existing Registry Private Reveal tab reveals claimed confidential balance |
| **Confidential Vesting** | **TokenOps Vesting — deploy manager, create time-locked schedules, recipient claim + reveal** |
| Create Manager | `useCreateManagerAndGetAddress({ token, userSalt })` — manager clone from factory |
| Allow Manager | `setOperator(managerAddress, deadline)` — manager as ERC-7984 operator |
| Create Schedule | `useCreateVesting` with 9-field `VestingParams` + FHE-encrypted allocation |
| Recipient Claim | `useRecipientVestings` auto-discovers vestingIds; `useClaim` + `useManagerFeeInfo` |
| Vesting Reveal | Existing Registry Private Reveal tab reveals claimed confidential balance |

---

## Protocol Coverage Checklist

- [x] Live Registry (Sepolia + Mainnet)
- [x] Testnet Faucet
- [x] Wrap (ERC-20 → ERC-7984)
- [x] Private Reveal (EIP-712 user decrypt)
- [x] Unwrap + Finalize (2-step Gateway public decrypt)
- [x] Mainnet read-only discovery
- [x] **TokenOps Confidential Disperse** (Operations Studio)
- [x] **TokenOps Confidential Airdrop** (Airdrop — Create / Issue / Claim)
- [x] **TokenOps Confidential Vesting** (Vesting — Manager / Schedule / Claim)

---

## Verified lifecycle (Sepolia, 2026-06-02)

```
1. Registry read   → getTokenConfidentialTokenPairs() — 1+ valid pairs found
2. Faucet          → ERC20.mint(user, 100e18) ✓
3. Approve         → ERC20.approve(wrapper, amount) ✓
4. Wrap            → wrapper.wrap(user, amount) ✓
5. Private Reveal  → confidentialBalanceOf → EIP-712 → userDecrypt → plaintext ✓
6. Unwrap request  → wrapper.unwrap(user, user, encHandle, inputProof) ✓
7. Gateway decrypt → instance.publicDecrypt([requestId]) ✓
8. Finalize        → wrapper.finalizeUnwrap(requestId, cleartext, proof) ✓

TokenOps Operations:
9.  Register        → TokenOps register(token) ✓
10. Allow Disperse  → setOperator(singleton, deadline) on ERC-7984 token ✓
11. Disperse (T2A)  → TokenOps Confidential Disperse (direct mode, FHE-encrypted amounts) ✓
    Tx: 0x650b5e598d3a…8de07752
12. Disperse (T3)   → Second confirmed Disperse via polished CSV/campaign form ✓
    Tx: 0x8743a9d98d65…c7264d18
    Token: 0x7c5B…3639 · Recipient: 0x1afB9439…7a5FD282 · Network: Sepolia

TokenOps Airdrop (Steps 9A–9C):
13. Create + Fund    → useCreateAndFundConfidentialAirdropAndGetAddress ✓
    Campaign: 0x33C6536FA34416c1e84b6d6E918292E2Da8B5366
    Tx: 0x293a7c13…96705 · Token: 0x7c5BF4…3639 · Network: Sepolia
14. Issue Claims     → encryptUint64 per recipient + useSignClaimAuthorization ✓
15. Recipient Claim  → useClaim with claim JSON payload ✓
    Tx: 0xb68b7293…59d5
16. Private Reveal   → claimed confidential balance revealed via Registry ✓

TokenOps Vesting (Steps 11A–11C):
17. Create Manager   → useCreateManagerAndGetAddress — factory on Sepolia ✓
    Manager: 0xD3B4b66733E1F1Df883581e08f80CcedAF0B5ccE
    Tx: 0x046a837c…102b · Factory: 0xA877…50
18. Create Schedule  → useCreateVesting with FHE-encrypted allocation ✓
    Tx: 0x5a7743…501 · VestingId: 0x0000…0000
19. Recipient Claim  → useRecipientVestings + useClaim + fee discrimination ✓
    Tx: 0x398015…67ec · Recipient: 0x1afB9439…7a5FD282
20. Private Reveal   → claimed vesting balance revealed via Registry ✓
```

See `docs/QA_CHECKPOINT_PHASE3.md` and `docs/QA_CHECKPOINT_TOKENOPS_DISPERSE.md` for tx hashes.

---

## Networks supported

| Network | Registry | Write actions |
|---|---|---|
| Ethereum Sepolia | `0x2f0750Bbb0A246059d80e94c454586a7F27a128e` | Full lifecycle |
| Ethereum Mainnet | `0xeb5015fF021DB115aCe010f23F55C2591059bBA0` | Read-only |

---

## Tech stack

- Next.js 15 (App Router) + TypeScript
- wagmi v2 + viem — contract reads/writes, multicall
- RainbowKit v2 — wallet connection
- @zama-fhe/relayer-sdk v0.4.3 — FHE encryption, user decrypt, gateway public decrypt
- @tokenops/sdk v1.0.0 — Confidential Disperse, Airdrop, Vesting clients
- @zama-fhe/sdk v3.0.1 — `createSepoliaEncryptorWeb` browser FHE encryptor
- @tanstack/react-query — data fetching
- Tailwind CSS v4

---

## Known limitations

| Limitation | Notes |
|---|---|
| Smart wallets (AA) | EIP-712 signature flow not supported; EOA wallets required for Private Reveal and Unwrap |
| WalletConnect mobile | Requires `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` env var |
| Gateway availability | `publicDecrypt` depends on `relayer.testnet.zama.cloud`; community-reported DNS issues |
| Mainnet writes | Blocked by design; Sepolia only for all write transactions |
| No custom contracts | All interactions use official deployed Zama contracts only |

---

## Professional demo notes

- Load time: FHE SDK initialises from CDN on first Private Reveal click (~2–5s)
- Gateway step: Unwrap gateway decryption may take 10–60s depending on relayer load
- Recommended demo pair: cUSDCMock / USDCMock on Sepolia
- Have MetaMask pre-funded with Sepolia ETH before recording
- The registry table is horizontally scrollable on mobile
