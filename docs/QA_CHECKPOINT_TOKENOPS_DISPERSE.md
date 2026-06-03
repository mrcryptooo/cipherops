# QA Checkpoint — TokenOps Confidential Disperse

**Date:** 2026-06-02
**Local URL:** http://localhost:3001/operations
**Network:** Ethereum Sepolia (chainId 11155111)
**Wallet:** MetaMask EOA

---

## Flow Passed

| Step | Action | Result |
|---|---|---|
| 1 | **Preparation** — obtained ERC-7984 confidential token address from Registry Explorer | ✅ Pass |
| 2 | **Operations route** — `/operations` loads, FHE encryptor initialises | ✅ Pass |
| 3 | **Register** — `register(token)` called once per token; `UserRegistered` event confirmed | ✅ Pass |
| 4 | **Allow Disperse** — `setOperator(singletonAddress, ERC7984_OPERATOR_MAX_DEADLINE)` on the confidential token | ✅ Pass |
| 5 | **Preflight** — `usePreflightDisperse` returned `ready: true`; all checks passed | ✅ Pass |
| 6 | **Confidential Disperse** — `useDisperse({ mode: "direct" })` submitted; amounts FHE-encrypted by TokenOps SDK | ✅ Pass |

---

## Confirmed Transaction

| Field | Value |
|---|---|
| Action | Confidential Disperse (direct mode) |
| Network | Ethereum Sepolia |
| Disperse singleton | `0x710dD9885Cc9986EfD234E7719483147a6d8DBb4` |
| SDK | `@tokenops/sdk@1.0.0` |
| Tx hash | `0x650b5e598d3a…8de07752` |
| Explorer | https://sepolia.etherscan.io/tx/0x650b5e598d3a8de07752 |

---

## Privacy Property

**Recipient amounts are FHE-encrypted** by `@tokenops/sdk` before the transaction is broadcast. The on-chain ciphertext reveals only the token address and the number of recipients — not individual amounts. Each recipient can use the **Private Reveal** flow in the CipherOps Registry (`/registry` → select pair → Private Reveal tab) to decrypt their own received balance.

---

## Bugs Fixed During T2A–T2B

| Bug | Fix |
|---|---|
| `disperse[direct]: CONFIGURATION error` | `createSepoliaEncryptorWeb` was missing explicit `chainId: 11155111`. In wagmi v2, `walletClient.chain?.id` can be `undefined`; the Zama SDK needs the chain id explicitly. |
| Stuck at "Submit unwrap request" (Phase 3 bug) | Separate issue fixed earlier — `writeContract.error` was not watched. |

---

## T3 Campaign UX Polish (does not change verified tx flow)

Phase T3 added the following UX improvements on top of the verified submit logic:
- **CSV import**: paste `address,amount,label` lines → parse → validate → preview table → "Use recipients" button
- **Campaign Summary card**: shows token, recipient count, total amount, mode, readiness
- **Post-success card**: tx hash link, recipient list (addresses only, amounts shown as "encrypted"), "Disperse again" reset
- **Validation**: duplicate address detection, invalid rows blocked from import, bad addresses flagged

The verified `usePreflightDisperse`, `useRegister`, `setOperator`, `useDisperse`, and `useTokenOpsEncryptor` hooks are unchanged. The confirmed tx `0x650b5e598d3a…8de07752` was produced by the same submit path.

---

## T3 CSV/Campaign UX Verification

**Date:** 2026-06-02
**Form:** `/operations` with T3 polish (campaign summary + CSV + post-success card)

### UX elements verified

| Element | Status |
|---|---|
| CSV paste textarea visible | ✅ |
| Parse CSV → preview table with address/amount/label/status | ✅ |
| "Use N recipients" button populates manual rows | ✅ |
| Campaign Summary card shows token, count, total, mode, readiness | ✅ |
| Post-success card: tx hash link, recipient list, "Amount encrypted" badge | ✅ |
| "Disperse again" reset button clears success state | ✅ |
| Recipient amounts shown as encrypted (no plaintext leakage) | ✅ |

### Second confirmed transaction (via polished Operations form)

| Field | Value |
|---|---|
| Tx hash | `0x8743a9d98d65…c7264d18` |
| Token | `0x7c5B…3639` |
| Recipient | `0x1afB9439…7a5FD282` |
| Network | Ethereum Sepolia |
| Amount | FHE-encrypted — plaintext not visible on-chain |
| Submit path | Same verified hooks as T2A (unchanged) |

---

## Known Caveats

- **Sepolia only** — current UI enforces Sepolia for all write flows; mainnet FHE not yet enabled by Zama
- **Recipients need Private Reveal** — confidential token recipients must use the EIP-712 `userDecrypt` flow to inspect their received balance
- **Register + operator approval required** — first-time users must call `register(token)` and `setOperator(singleton, deadline)` before the first disperse; the UI auto-detects and prompts for both
- **Smart wallets** — standard EOA wallets only; AA wallets may not support the required EIP-712 signing flow
- **Zama relayer dependency** — FHE encryption requires connectivity to `relayer.testnet.zama.org/v2`
