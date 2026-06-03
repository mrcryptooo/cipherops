# CipherOps Registry

> **Every confidential token. One place.**

CipherOps is an infrastructure layer over Zama's on-chain confidential token registry. It reads every verified ERC-20 ↔ ERC-7984 wrapper pair directly from the chain and exposes a guided lifecycle for wrapping, revealing, and unwrapping assets — no intermediary, no cached index.

---

## In-App Docs

In-app product documentation is available at **[/docs](http://localhost:3000/docs)** — covers what CipherOps is, all flows, verified addresses, privacy model, limitations, and quick start guide.

---

## Current Status

**All lifecycle phases complete and verified on Sepolia. TokenOps Confidential Disperse verified.**

- Protocol coverage: 6/6 live (Registry, Faucet, Wrap, Private Reveal, Unwrap, Mainnet discovery)
- Full end-to-end lifecycle confirmed: Faucet → Approve → Wrap → Private Reveal → Unwrap → Finalize
- **TokenOps Confidential Disperse confirmed** — private multi-recipient token distribution working on Sepolia
- Mainnet: read-only registry discovery (write actions Sepolia-only)
- Responsive: mobile horizontal scroll, full desktop layout

### TokenOps Disperse — Verified ✅ (2 confirmed transactions)

Confidential Disperse is working end-to-end on Sepolia using `@tokenops/sdk@1.0.0` and `@zama-fhe/sdk@3.0.1`.

- Built on top of the `@tokenops/sdk` Disperse singleton (`0x710dD9885Cc9986EfD234E7719483147a6d8DBb4`)
- Works with any ERC-7984 confidential token (including Zama's official registry pairs)
- **Recipient amounts are FHE-encrypted** — no one can see individual payouts on-chain
- Confirmed tx 1: `0x650b5e598d3a…8de07752` (T2A initial verification)
- Confirmed tx 2: `0x8743a9d98d65…c7264d18` (T3 polished form — CSV/campaign UX)
- **CSV/campaign UX** — paste `address,amount,label` lines, validate, preview, import into form
- Campaign summary card, post-success receipt, encrypted amount badge, "Disperse again" reset
- See [`docs/QA_CHECKPOINT_TOKENOPS_DISPERSE.md`](docs/QA_CHECKPOINT_TOKENOPS_DISPERSE.md)

### TokenOps Confidential Airdrop — Verified ✅

Confidential Airdrop is working end-to-end on Sepolia using `@tokenops/sdk@1.0.0`.

- **Create + Fund Campaign** — `useCreateAndFundConfidentialAirdropAndGetAddress` deploys a clone and funds it in one tx
- **Issue Claims** — per-recipient `encryptUint64` + `useSignClaimAuthorization` produces a portable claim JSON
- **Recipient Claim** — paste JSON, wallet auto-matches, `useClaim` submits tx
- **Private Reveal** — claimed confidential balance revealed via existing Registry Private Reveal flow
- Campaign: `0x33C6536FA34416c1e84b6d6E918292E2Da8B5366` · Token: `0x7c5BF4…3639`
- Create/Fund tx: `0x293a7c13…96705` · Claim tx: `0xb68b7293…59d5`
- See [`docs/QA_CHECKPOINT_TOKENOPS_AIRDROP.md`](docs/QA_CHECKPOINT_TOKENOPS_AIRDROP.md)

### TokenOps Confidential Vesting — Verified ✅

Confidential Vesting is working end-to-end on Sepolia using `@tokenops/sdk@1.0.0`.

- **Create Manager** — `useCreateManagerAndGetAddress` deploys a vesting manager clone from the factory
- **Create Schedule** — `useCreateVesting` with 9-field `VestingParams` + FHE-encrypted amount
- **Recipient Claim** — `useRecipientVestings` auto-discovers vestingIds; `useClaim` submits with fee-type discrimination
- **Private Reveal** — claimed confidential balance revealed via existing Registry Private Reveal flow
- Manager: `0xD3B4b66733E1F1Df883581e08f80CcedAF0B5ccE` · Factory: `0xA877…50`
- Deploy tx: `0x046a837c…102b` · Schedule tx: `0x5a7743…501` · Claim tx: `0x398015…67ec`
- See [`docs/QA_CHECKPOINT_TOKENOPS_VESTING.md`](docs/QA_CHECKPOINT_TOKENOPS_VESTING.md)

---

### Documentation

| Doc | Purpose |
|---|---|
| [`docs/SUBMISSION_PACK.md`](docs/SUBMISSION_PACK.md) | Project pitch, feature list, verified lifecycle, known limitations |
| [`docs/DEMO_VIDEO_SCRIPT.md`](docs/DEMO_VIDEO_SCRIPT.md) | 3-minute demo script with timestamps |
| [`docs/SCREENSHOT_CHECKLIST.md`](docs/SCREENSHOT_CHECKLIST.md) | Screenshots to capture for submission |
| [`docs/FINAL_QA_CHECKLIST.md`](docs/FINAL_QA_CHECKLIST.md) | Pre-submission QA checklist |
| [`docs/QA_CHECKPOINT_PHASE3.md`](docs/QA_CHECKPOINT_PHASE3.md) | Phase 3 QA results with Sepolia tx hashes |
| [`docs/QA_CHECKPOINT_TOKENOPS_DISPERSE.md`](docs/QA_CHECKPOINT_TOKENOPS_DISPERSE.md) | TokenOps Disperse QA checkpoint |
| [`docs/QA_CHECKPOINT_TOKENOPS_AIRDROP.md`](docs/QA_CHECKPOINT_TOKENOPS_AIRDROP.md) | TokenOps Airdrop QA checkpoint |
| [`docs/QA_CHECKPOINT_TOKENOPS_VESTING.md`](docs/QA_CHECKPOINT_TOKENOPS_VESTING.md) | TokenOps Vesting QA checkpoint |
| [`docs/TOKENOPS_CLIENT_ANALYSIS.md`](docs/TOKENOPS_CLIENT_ANALYSIS.md) | TokenOps SDK deep analysis and MVP ranking |
| [`PHASE2_DECRYPT_PLAN.md`](PHASE2_DECRYPT_PLAN.md) | Private Reveal SDK research and flow |
| [`PHASE3_UNWRAP_PLAN.md`](PHASE3_UNWRAP_PLAN.md) | Unwrap ABI research and flow |

---

## What it does

- Reads the official Zama wrapper registry on Sepolia and Ethereum Mainnet
- Displays every valid ERC-20 ↔ ERC-7984 confidential token pair with metadata
- Provides a network switcher between testnet and mainnet
- Wallet connection via RainbowKit (MetaMask, Coinbase Wallet, WalletConnect)
- Sepolia: mint test ERC-20 tokens, approve wrapper allowance, wrap into ERC-7984
- Mainnet: read-only (write transactions are Sepolia-only)
- FHE SDK setup: `@zama-fhe/relayer-sdk` + fhevm React helpers + WASM assets in `public/`
- Private Reveal: reads `confidentialBalanceOf(address)` → `bytes32` handle, decrypts via EIP-712 user-decrypt through the Zama relayer SDK, Sepolia only
- Unwrap: two-step lifecycle — `unwrap(from,to,encryptedAmount,inputProof)` + Zama Gateway `publicDecrypt` + `finalizeUnwrap(requestId,cleartext,proof)`, Sepolia only

---

## Roadmap

| Phase | Description | Status |
|---|---|---|
| **0** | Registry Explorer — read-only on-chain pair index | ✅ Live |
| **0.5** | Product Positioning — protocol coverage, privacy lifecycle, guided quickstart | ✅ Live |
| **1** | Faucet + Wrap — mint test tokens, approve ERC-20, wrap into ERC-7984 | ✅ Live |
| **2A** | Phase 2 Research — confirmed SDK, ABI, decrypt flow | ✅ Done |
| **2B.1** | FHE SDK Setup — relayer-sdk installed, fhevm helpers copied, WASM added | ✅ Done |
| **2B.2** | Private Reveal UI — decrypt tab in TokenActionPanel | ✅ Done |
| **3A** | Unwrap research — ABI + flow confirmed | ✅ Done |
| **3B** | Unwrap Lifecycle — two-step unwrap tab in TokenActionPanel | ✅ Done |
| **4A** | Phase 4A Reliability — refresh after operations, error recovery, rate display | ✅ Done |
| **4B** | Phase 4B Responsive — mobile scroll, tab wrapping, nav layout | ✅ Done |
| **4C** | Phase 4C Submission Pack — docs, QA checklist, demo script | ✅ Done |

---

## Core Lifecycle — Verified on Sepolia (2026-06-02)

Full end-to-end test passed on Ethereum Sepolia against the official Zama wrapper registry.

| Step | Contract call | Result |
|---|---|---|
| **Faucet** | `ERC20.mint(user, 100e18)` | ✅ Confirmed |
| **Approve** | `ERC20.approve(wrapper, amount)` | ✅ Confirmed |
| **Wrap** | `wrapper.wrap(user, amount)` | ✅ Confirmed |
| **Private Reveal** | `confidentialBalanceOf` + EIP-712 user-decrypt via relayer | ✅ Confirmed |
| **Unwrap** | `wrapper.unwrap(user, user, encHandle, inputProof)` | ✅ Confirmed |
| **Finalize Unwrap** | `wrapper.finalizeUnwrap(requestId, cleartext, proof)` | ✅ Confirmed |

Tested pair: **cUSDCMock / USDCMock** on Sepolia. See `docs/QA_CHECKPOINT_PHASE3.md`.

---

## Phase 1 Details

### Wallet connection
RainbowKit with dark theme. Works with MetaMask, Coinbase Wallet, and any injected wallet. WalletConnect (mobile) requires `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`.

### Faucet (Sepolia only)
Calls `ERC20.mint(address to, uint256 amount)` on the Zama official Sepolia test token. Mints 100 tokens per click. All pairs sourced from the official registry — no custom contracts deployed.

### Approve
Calls `ERC20.approve(address spender, uint256 amount)` where `spender = confidentialTokenAddress` (the ERC-7984 wrapper). Live allowance is shown and re-fetched every 8 seconds.

### Wrap
Calls `wrapper.wrap(address to, uint256 amount)` on the ERC-7984 confidential token contract. Requires sufficient allowance. `to = connected wallet address`.

### Private Reveal (Phase 2)
Reads `confidentialBalanceOf(address)` → `bytes32` encrypted handle. Uses `instance.userDecrypt()` via `@zama-fhe/relayer-sdk` EIP-712 flow. Sepolia only. Smart wallets not supported (signature format incompatible).

### Unwrap (Phase 3) — two-step
1. `wrapper.unwrap(from, to, encryptedAmount, inputProof)` — burns confidential tokens, triggers Gateway public-decrypt
2. Poll `instance.publicDecrypt([unwrapRequestId])` — Zama Gateway resolves the encrypted handle
3. `wrapper.finalizeUnwrap(requestId, cleartextAmount, decryptionProof)` — transfers underlying ERC-20

### Not implemented / not applicable
- `deposit()` — not called
- `faucet()` — not called (using `mint()` instead)
- No custom contracts deployed

---

## Official Registry Addresses

| Network | Address |
|---|---|
| Ethereum Sepolia | `0x2f0750Bbb0A246059d80e94c454586a7F27a128e` |
| Ethereum Mainnet | `0xeb5015fF021DB115aCe010f23F55C2591059bBA0` |

---

## RPC Setup

The Ankr public endpoints previously used as defaults now require an API key and will return `401 Unauthorized`. You must provide your own RPC URL.

**Fastest option — no sign-up required (PublicNode):**
```bash
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
NEXT_PUBLIC_MAINNET_RPC_URL=https://ethereum-rpc.publicnode.com
```

**With a free API key (more reliable):**
| Provider | Sepolia | Mainnet |
|---|---|---|
| Alchemy | `https://eth-sepolia.g.alchemy.com/v2/KEY` | `https://eth-mainnet.g.alchemy.com/v2/KEY` |
| Infura | `https://sepolia.infura.io/v3/KEY` | `https://mainnet.infura.io/v3/KEY` |

If neither env var is set, viem falls back to the chain's built-in public RPC (`rpc.sepolia.org` / `cloudflare-eth.com`), which may be rate-limited under load.

---

## Setup

```bash
# Copy env template and fill in your RPC URLs
cp .env.local.example .env.local

# Install
npm install

# Dev server
npm run dev

# Production build
npm run build

# Type check
npm run typecheck
```

---

## Browser & Responsive Support

- **Desktop Chrome + MetaMask** — fully tested, all lifecycle flows verified
- **Desktop Firefox / Brave** — should work with any injected wallet; not explicitly tested
- **Mobile browsers** — registry read (Sepolia + Mainnet) works on mobile; write flows (Faucet, Wrap, Private Reveal, Unwrap) require a connected wallet; WalletConnect QR requires `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` to be set
- **Registry table** — horizontally scrollable on narrow viewports with a scroll hint
- **TokenActionPanel tabs** — horizontally scrollable on mobile, no tab wrapping or overflow

---

## Tech Stack

| Tool | Role |
|---|---|
| Next.js 15 (App Router) | Framework |
| TypeScript | Type safety |
| wagmi v2 + viem | Contract reads, writes, multicall |
| @tanstack/react-query | Data fetching and cache |
| RainbowKit v2 | Wallet connection UI |
| Tailwind CSS v4 | Styling |
| Ankr public RPC | Default transport (bring your own for production) |

---

## Architecture

```
src/
  lib/
    registry.ts             — ABIs, network config, helpers (ERC20_FULL_ABI, WRAPPER_ABI)
    wagmi.ts                — RainbowKit getDefaultConfig
  hooks/
    useRegistryPairs.ts     — registry + metadata multicall
    useTokenBalances.ts     — balanceOf + allowance reads (auto-refreshing)
    useTokenActions.ts      — useMintAction / useApproveAction / useWrapAction
  types/
    registry.ts             — shared TypeScript interfaces
  components/
    wallet/
      ConnectButton.tsx     — custom RainbowKit ConnectButton
    registry/
      RegistryExplorer.tsx  — network switcher, selected-pair state, panel host
      RegistryTable.tsx     — pair table, active Faucet/Wrap on Sepolia
      TokenActionPanel.tsx  — tabbed panel: Test Assets / Approve / Wrap
      VerificationDetails.tsx — post-tx confirmation card
    ui/
      ProtocolCoverage.tsx
      PrivacyLifecycle.tsx
      GuidedQuickstart.tsx
      Badge.tsx / Spinner.tsx / NetworkSwitcher.tsx
    Providers.tsx           — WagmiProvider + QueryClientProvider + RainbowKitProvider
  app/
    layout.tsx              — RainbowKit CSS import
    page.tsx
    globals.css
```

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_SEPOLIA_RPC_URL` | Ankr public | Sepolia JSON-RPC endpoint |
| `NEXT_PUBLIC_MAINNET_RPC_URL` | Ankr public | Mainnet JSON-RPC endpoint |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | `""` | WalletConnect Cloud project ID (optional for injected wallets) |

Public Ankr RPCs are fine for development. For production traffic, use a dedicated provider such as Alchemy, Infura, or QuickNode.

---

## Competition Context

Built for the **Zama Developer Program Mainnet Season 3**.

The integration covers direct reads from Zama's official wrapper registry, displays all valid ERC-20 ↔ ERC-7984 pairs, and implements the full Sepolia write lifecycle: mint → approve → wrap.
