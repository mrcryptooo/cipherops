# CipherOps — Final QA Checklist

**Last updated:** 2026-06-02  
Run through every item before Git checkpoint / public demo / submission.

---

## Build

- [ ] `npm run typecheck` — zero TypeScript errors
- [ ] `npm run lint` — zero ESLint warnings/errors
- [ ] `npm run build` — clean production build, all 8 routes prerendered static
- [ ] Routes present: `/`, `/registry`, `/operations`, `/airdrop`, `/vesting`, `/docs`, `/recipient`, `/verification`, `/developers`

---

## Environment

- [ ] `.env.local` exists with `NEXT_PUBLIC_SEPOLIA_RPC_URL` set (non-Ankr endpoint)
- [ ] `.env.local` has `NEXT_PUBLIC_MAINNET_RPC_URL` set
- [ ] `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` set or injected-wallet-only is acceptable
- [ ] `.gitignore` covers `.env*.local`, `node_modules/`, `.next/`
- [ ] No secrets in `.env.local.example`

---

## Wallet + network

- [ ] Connect MetaMask on Sepolia
- [ ] ConnectButton shows correct truncated address + "Sepolia" label
- [ ] Wrong-network guard: non-Sepolia → "Wrong Network" red button
- [ ] Switch-network prompt works in TokenActionPanel, Operations, Airdrop, Vesting

---

## Home page (`/`)

- [ ] Page loads — hero video plays (or fallback card shown)
- [ ] "Every confidential token. One place." headline visible
- [ ] Lifecycle strip (Discover → Wrap → Reveal → Unwrap) visible
- [ ] Feature cards load without broken layout
- [ ] Operations Preview section shows "Coming" note correctly
- [ ] Nav links work: Registry, Operations, Vesting, Verification, Developers
- [ ] Footer links: Zama Docs, dApps, fhEVM

---

## Registry (`/registry`)

- [ ] Page header: "Registry Explorer" + 4 yellow pill badges
- [ ] Sepolia pairs load — at least 1 valid pair
- [ ] Token symbols, names, addresses correct
- [ ] Explorer address links open Sepolia Etherscan
- [ ] **Faucet** — mint succeeds, balance refreshes, "✓ Complete" shown
- [ ] **Approve** — allowance updates, green banner when sufficient
- [ ] **Wrap** — Verification Details with tx hash
- [ ] **Private Reveal** — FHE SDK "Ready", encrypted handle shown, balance revealed
- [ ] **Unwrap** — full 4-step flow; gateway resolves; Finalize confirms
- [ ] Switch to Mainnet → "Mainnet pairs displayed for discovery" banner; write buttons disabled

---

## Operations (`/operations`)

- [ ] Page loads with Confidential Disperse header
- [ ] FHE Encryptor becomes "Ready" on Sepolia
- [ ] **CSV parse** — paste `address,amount,label` → valid/invalid preview
- [ ] **Duplicate detection** — duplicate addresses flagged red
- [ ] **Campaign Summary** — shows token, count, total, readiness
- [ ] **Register wallet** (if not already) → `register(token)` tx
- [ ] **Allow Disperse** → `setOperator(singleton, deadline)` tx
- [ ] **Preflight** — all checks green
- [ ] **Send Confidential Disperse** — FHE-encrypts amounts, tx submitted, receipt shown
- [ ] Post-success: recipient list, encrypted badge, "Disperse again" reset

---

## Airdrop (`/airdrop`)

- [ ] Page loads with 3 tabs: Create Campaign / Issue Claims / Recipient Claim
- [ ] **Tab 1: Create Campaign** — setOperator, createAndFund tx, campaign address returned
- [ ] **Tab 2: Issue Claims** — FHE Encryptor ready, per-recipient encrypt + sign, JSON generated
- [ ] **Copy Claim JSON** — clipboard copy works, "✓ Copied" flash
- [ ] **Download JSON** — file downloads correctly
- [ ] **Tab 3: Recipient Claim** — paste array/single/wrapper JSON, wallet auto-match, `useClaim` tx
- [ ] Post-success: "Open Registry → Private Reveal" CTA

---

## Vesting (`/vesting`)

- [ ] Page loads with 3 tabs: Create Manager / Create Schedules / Recipient Claim
- [ ] **Tab 1: Create Manager** — manager deploy tx, address shown
- [ ] **Tab 2: Create Schedule** — FHE Encryptor ready, setOperator(manager), `useCreateVesting` tx, vestingId shown
- [ ] **Tab 3: Recipient Claim** — `useRecipientVestings` discovers vestingId, `useManagerFeeInfo` shows fee, `useClaim` tx
- [ ] Post-success: "Open Registry → Private Reveal" CTA

---

## Recipient Portal (`/recipient`)

- [ ] Page loads with 5 steps and yellow CTAs
- [ ] "Open Registry →" links to `/registry`
- [ ] "View Operations" links to `/operations`
- [ ] "Recent payout receipt" placeholder card shown (no fake data)

---

## Verification Center (`/verification`)

- [ ] Page loads with 5 sections
- [ ] Section 1: 6 lifecycle steps shown (Faucet → Finalize), "6/6 steps confirmed" badge
- [ ] Section 2: 2 TokenOps Disperse receipt cards with real tx hashes + Etherscan links
- [ ] Section 3: Privacy Guarantees bullets (no false claims)
- [ ] Section 4: Doc links (3 clickable app routes + 5 static doc labels)
- [ ] Section 5: CTA buttons work

---

## Docs (`/docs`)

- [ ] Page loads with 13 numbered sections
- [ ] All nav jump links (#what, #zama, #lifecycle, #disperse, #airdrop, #vesting, #addresses, #privacy, #limits, #quickstart) resolve
- [ ] Verified tx hashes are shown and link to Sepolia Etherscan
- [ ] Contract addresses link to Sepolia Etherscan
- [ ] Cards to /recipient, /verification, /developers are present (since these were removed from top nav)
- [ ] CTA buttons link correctly to all app routes
- [ ] No fake data, no unsupported claims

---

## Developer Guide (`/developers`)

- [ ] Page loads with all 6 sections
- [ ] Architecture flow diagram (7 steps)
- [ ] SDK package cards (6 packages with versions)
- [ ] 5 code snippet blocks visible, no private keys
- [ ] Routes table: 6 routes all clickable
- [ ] External links: Zama Docs, dApps, fhEVM, protocol-apps (all ↗)

---

## Color QA

- [ ] No `text-sky-`, `text-cyan-`, `text-blue-`, `text-purple-`, `text-indigo-` in page output
- [ ] Yellow (#FFD208) accents on active states
- [ ] Green only for success states
- [ ] Red only for error states
- [ ] All link colors use yellow or white/zinc

---

## Error states

- [ ] All write actions show clear error on failure/rejection — no stuck states
- [ ] All error states have Reset or Try Again path — no page reload required
- [ ] RPC error shows env var setup instructions in registry table
- [ ] TokenOps SDK errors (CONFIGURATION) show clear message
- [ ] Gateway timeout shown clearly

---

## Mobile responsive

- [ ] Registry table shows scroll hint on narrow viewport; scrolls within container
- [ ] TokenActionPanel tabs scroll horizontally; no tab wrapping
- [ ] All buttons wrap cleanly on mobile
- [ ] No text overflows viewport on mobile

---

## Data integrity

- [ ] No hardcoded/fake pair data — all from live registry
- [ ] No mainnet write transactions possible via UI
- [ ] No private keys, seed phrases, or secret values in any visible output
- [ ] Verified tx hashes match real Sepolia transactions (not invented)

---

## Docs presence

- [ ] `README.md` — complete, has verified tx section, TokenOps products
- [ ] `docs/SUBMISSION_PACK.md` — complete with all features + all 3 TokenOps txs
- [ ] `docs/DEMO_VIDEO_SCRIPT.md` — 3-minute demo script with timestamps
- [ ] `docs/SCREENSHOT_CHECKLIST.md` — screenshot list
- [ ] `docs/FINAL_QA_CHECKLIST.md` — this file
- [ ] `docs/QA_CHECKPOINT_PHASE3.md` — Registry lifecycle txs
- [ ] `docs/QA_CHECKPOINT_TOKENOPS_DISPERSE.md` — Disperse txs
- [ ] `docs/QA_CHECKPOINT_TOKENOPS_AIRDROP.md` — Airdrop txs
- [ ] `docs/QA_CHECKPOINT_TOKENOPS_VESTING.md` — Vesting txs
- [ ] `docs/TOKENOPS_CLIENT_ANALYSIS.md` — SDK analysis
- [ ] `docs/TOKENOPS_AIRDROP_RESEARCH.md` — Airdrop research + 9A/9B/9C notes
- [ ] `docs/TOKENOPS_VESTING_RESEARCH.md` — Vesting research + 11A/11B/11C notes

---

## Pre-commit checklist

- [ ] `npm run build` passes cleanly
- [ ] `.env.local` is NOT staged (`.gitignore` confirms it)
- [ ] `node_modules/` is NOT staged
- [ ] No `console.log` with private data in committed code
- [ ] Git status shows only intended tracked files
