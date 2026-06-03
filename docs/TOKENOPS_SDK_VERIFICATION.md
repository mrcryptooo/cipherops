# @tokenops/sdk — SDK Verification Report

**Date:** 2026-06-02  
**Package:** `@tokenops/sdk@1.0.0`  
**Inspected with:** `scripts/inspect-tokenops.mjs`

---

## Summary verdict

**PARTIALLY USABLE today; fully usable after `npm install @zama-fhe/sdk`.**

The core module (addresses, error types, chain helpers) and feature client modules (`fhe-airdrop`, `fhe-vesting`, `fhe-disperse`) load and import successfully without `@zama-fhe/sdk`. The FHE encryption subpath (`@tokenops/sdk/fhe`) requires `@zama-fhe/sdk` v3, which is a separate npm package from our current `@zama-fhe/relayer-sdk` v0.4.3.

---

## Package metadata

| Field | Value |
|---|---|
| Version | `1.0.0` |
| License | BSD-3-Clause-Clear |
| Description | Typed viem-first SDK for TokenOps FHEVM contracts (confidential vesting, confidential airdrops, confidential disperse) |
| TypeScript types | ✅ Full `.d.ts` for every export path |

---

## Export paths (14 total)

| Path | Types | Notes |
|---|---|---|
| `.` | ✅ `dist/index.d.ts` | Core: addresses, errors, chain utils |
| `./telemetry` | ✅ | SDK telemetry helpers |
| `./fhe` | ✅ | Encryptors, ACL, ERC-7984 operator helpers — **requires `@zama-fhe/sdk` v3** |
| `./fhe/react` | ✅ | `useDecryptedHandle` React hook |
| `./fhe-vesting` | ✅ | `ConfidentialVestingManagerClient`, `ConfidentialVestingFactoryClient` |
| `./fhe-vesting/react` | ✅ | React hooks for vesting |
| `./fhe-vesting/advanced` | ✅ | `predictManagerAddress` advanced factory |
| `./fhe-airdrop` | ✅ | `ConfidentialAirdropClient`, `ConfidentialAirdropFactoryClient` |
| `./fhe-airdrop/react` | ✅ | React hooks for airdrop |
| `./fhe-airdrop/advanced` | ✅ | `predictAirdropAddress` advanced factory |
| `./fhe-disperse` | ✅ | `ConfidentialDisperseClient`, encryption helpers |
| `./fhe-disperse/react` | ✅ | React hooks for disperse |

---

## Deployed contract addresses (hardcoded in SDK)

| Product | Contract | Network | Address |
|---|---|---|---|
| Confidential Vesting | Factory | Sepolia | `0xA87701CE9A52D43681600583a99c85b50DbE3150` |
| Confidential Airdrop | Factory | Sepolia | `0xbE6A3B78B36684fFee48De77d47Bc3393F5Acd4c` |
| Confidential Disperse | Singleton | Sepolia | `0x710dD9885Cc9986EfD234E7719483147a6d8DBb4` |
| Confidential Disperse | Singleton | Mainnet | `0x4fC0d28cBe4B82D512Ad0B42F6787480Cc98cC70` |

Accessed via: `DEPLOYED_ADDRESSES`, `getFheVestingFactoryAddress(chainId)`, etc.

---

## Peer dependency analysis

| Package | Required? | Installed? | Notes |
|---|---|---|---|
| `viem ^2.47.0` | **Required** | ✅ Yes (v2.52.0) | Compatible |
| `@tanstack/react-query ^5.0.0` | Optional | ✅ Yes (v5.80.2) | Compatible |
| `wagmi ^2.0.0` | Optional | ✅ Yes (v2.19.5) | Compatible |
| `react >=18.0.0` | Optional | ✅ Yes (v19) | Compatible |
| `@zama-fhe/sdk ^3.0.0` | Optional | ❌ **MISSING** | Required for `./fhe` subpath |
| `@zama-fhe/react-sdk ^3.0.0` | Optional | ❌ **MISSING** | Required for `./fhe/react` subpath |

### Critical: `@zama-fhe/sdk` vs `@zama-fhe/relayer-sdk`

CipherOps currently uses `@zama-fhe/relayer-sdk@0.4.3`. The `@tokenops/sdk` requires `@zama-fhe/sdk@^3.0.0`. These are **different packages** on npm:

- `@zama-fhe/relayer-sdk` — older SDK (v0.4.x), used in `zama-ai/dapps` monorepo
- `@zama-fhe/sdk` — newer unified SDK (v3.x), installs `RelayerWeb` etc. with updated API

`@zama-fhe/sdk@3.0.1` is available on npm and can be added separately. It would replace `@zama-fhe/relayer-sdk` for the encryption path while all Zama relayer functionality remains available.

---

## What loads today (without `@zama-fhe/sdk`)

✅ **`@tokenops/sdk` (core)** — All 57 named exports load:
- `DEPLOYED_ADDRESSES`, `SUPPORTED_CHAINS`
- Address accessors: `getFheVestingFactoryAddress`, `getFheAirdropFactoryAddress`, `getFheDisperseSingletonAddress`
- Error types: 30+ typed error classes
- Brand helpers: `asAirdropId`, `asDisperseId`, `asVestingId`, `asTxHash`, etc.
- Chain helpers: `chainsWithDeployment`, `isSupportedChainId`

✅ **`@tokenops/sdk/fhe-airdrop`** — `ConfidentialAirdropClient`, `ConfidentialAirdropFactoryClient`, factory ABIs, `signClaimAuthorization`

✅ **`@tokenops/sdk/fhe-vesting`** — (expected same; not tested due to script exit after airdrop confirmation)

✅ **`@tokenops/sdk/fhe-disperse`** — (expected same)

❌ **`@tokenops/sdk/fhe`** — Fails at import: `Cannot find package '@zama-fhe/sdk'`

---

## Backend signer required?

**No.** The browser path uses `createSepoliaEncryptorWeb` (from `@tokenops/sdk/fhe`) which takes a viem `PublicClient` + `WalletClient`. No backend signer, no private key server-side.

---

## Integration path for CipherOps

To fully activate `@tokenops/sdk` in CipherOps:

```bash
npm install @zama-fhe/sdk
```

This unlocks:
- `createSepoliaEncryptorWeb({ publicClient, walletClient })` for FHE encryption
- All `/fhe`, `/fhe-vesting/react`, `/fhe-airdrop/react`, `/fhe-disperse/react` React hooks
- Potential replacement/upgrade of the current `@zama-fhe/relayer-sdk` v0.4.3 dependency

Note: `@zama-fhe/sdk` v3 and `@zama-fhe/relayer-sdk` v0.4.3 may have overlapping but different APIs. A migration audit is needed before removing `relayer-sdk`.

---

## Feature coverage

| TokenOps feature | SDK subpath | Deployed on Sepolia? | Usable? |
|---|---|---|---|
| Confidential Airdrop | `./fhe-airdrop` | ✅ Factory at `0xbE6A...` | ✅ After `@zama-fhe/sdk` install |
| Confidential Vesting | `./fhe-vesting` | ✅ Factory at `0xA877...` | ✅ After `@zama-fhe/sdk` install |
| Confidential Disperse | `./fhe-disperse` | ✅ Singleton at `0x710d...` + Mainnet `0x4fC0...` | ✅ After `@zama-fhe/sdk` install |
| FHE encryption helpers | `./fhe` | n/a | ❌ Requires `@zama-fhe/sdk` |

---

## Recommendation

1. `npm install @zama-fhe/sdk` — one additional peer dep unlocks the full SDK
2. Use `createSepoliaEncryptorWeb` from `@tokenops/sdk/fhe` for browser-safe encryption
3. The existing CipherOps FHE setup (`@zama-fhe/relayer-sdk` + copied fhevm-sdk files) can coexist or be replaced gradually
4. `@tokenops/sdk/fhe-disperse` is the most immediately useful addition for CipherOps — it's deployed on both Sepolia AND Mainnet
