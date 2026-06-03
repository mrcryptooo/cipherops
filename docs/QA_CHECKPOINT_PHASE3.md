# QA Checkpoint — Phase 3 Complete

**Date:** 2026-06-02  
**Local URL:** http://localhost:3006 (port may vary)  
**Network:** Ethereum Sepolia (chainId 11155111)  
**Wallet:** MetaMask EOA

---

## Tested Pair

| Field | Value |
|---|---|
| ERC-20 (Underlying) | USDCMock |
| ERC-7984 (Wrapper) | cUSDCMock |
| Sepolia Registry | `0x2f0750Bbb0A246059d80e94c454586a7F27a128e` |

---

## Flow Result

| Step | Action | Result |
|---|---|---|
| 1 | **Faucet** — `ERC20.mint(user, 100e18)` | ✅ Pass |
| 2 | **Approve** — `ERC20.approve(wrapper, amount)` | ✅ Pass |
| 3 | **Wrap** — `wrapper.wrap(user, amount)` | ✅ Pass |
| 4 | **Private Reveal** — `confidentialBalanceOf` + EIP-712 user-decrypt | ✅ Pass |
| 5 | **Unwrap request** — `wrapper.unwrap(user, user, encHandle, inputProof)` | ✅ Pass |
| 6 | **Gateway decrypt** — `instance.publicDecrypt([unwrapRequestId])` | ✅ Pass |
| 7 | **Finalize Unwrap** — `wrapper.finalizeUnwrap(requestId, cleartext, proof)` | ✅ Pass |

Full lifecycle confirmed end-to-end with no regressions on Faucet, Approve, Wrap, or Private Reveal.

---

## Transaction Hashes (Sepolia)

| Action | Tx Hash |
|---|---|
| Unwrap request | `0x5ed2b38f…629759` |
| Finalize Unwrap | `0xdd2cbefd…a5f2fe` |

---

## Bugs Fixed During Phase 3

| Bug | Fix |
|---|---|
| UI stuck at "Submit unwrap request" | Added `useEffect` watching `writeContract.error` — user reject / simulation fail now transitions to error state immediately |
| `"hex_.replace is not a function"` | `encrypt()` returns `Uint8Array`, not a hex string. Added `normalizeHex()` using `viem.bytesToHex` before passing to `writeContract` |
| Receipt `status === "reverted"` not handled | Added explicit revert check with clear error message |

---

## Known Caveats

- **Gateway availability**: `publicDecrypt` polls `relayer.testnet.zama.cloud`. DNS or relayer issues have been reported by the Zama community. If stuck at "Awaiting Gateway", retry later.
- **Smart wallets**: Private Reveal and Unwrap both require EIP-712 signatures. Smart wallets (AA) are not supported due to signature format incompatibility.
- **Mainnet**: All write transactions (Faucet, Approve, Wrap, Private Reveal, Unwrap) are Sepolia-only. Mainnet is read-only.
- **Rate**: Some wrapper pairs have `rate() > 1` (e.g. 18-decimal underlying → 6-decimal wrapper). The UI converts amounts using the rate. Verify before finalizing large unwraps.

---

## Protocol Coverage at Checkpoint

| Feature | Status |
|---|---|
| Live Registry (Sepolia + Mainnet) | ✅ Live |
| Testnet Faucet | ✅ Live |
| Wrap | ✅ Live |
| Private Reveal | ✅ Live |
| Unwrap | ✅ Live |
