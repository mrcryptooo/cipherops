# QA Checkpoint — TokenOps Confidential Airdrop

**Date:** 2026-06-02
**Network:** Ethereum Sepolia (chainId 11155111)
**Wallet:** MetaMask EOA

---

## Full Flow Passed

| Step | Action | Result |
|---|---|---|
| 1 | **Create + Fund Campaign** — `useCreateAndFundConfidentialAirdropAndGetAddress` | ✅ Pass |
| 2 | **setOperator** — granted airdrop factory as ERC-7984 operator before funding | ✅ Pass |
| 3 | **Issue Claims JSON** — `encryptUint64` per recipient + `useSignClaimAuthorization` per recipient | ✅ Pass |
| 4 | **Recipient Claim** — pasted claim JSON, wallet auto-matched, `useClaim` submitted | ✅ Pass |
| 5 | **Private Reveal** — recipient revealed confidential balance via Registry → Private Reveal tab | ✅ Pass |

---

## Confirmed Transactions

| Action | Value |
|---|---|
| Airdrop campaign address | `0x33C6536FA34416c1e84b6d6E918292E2Da8B5366` |
| Create + Fund tx | `0x293a7c13de17ca77adfa6d2978bd07923e1ec910181375c34b43e54ea6196705` |
| Recipient Claim tx | `0xb68b7293e655cdd83ebe24e2d0f484c32a18d31a779d082441edb227fb4a59d5` |
| ERC-7984 Token | `0x7c5BF43B851c1dff1a4feE8dB225b87f2C223639` |
| Network | Ethereum Sepolia |
| Airdrop Factory | `0xbE6A3B78B36684fFee48De77d47Bc3393F5Acd4c` |
| SDK | `@tokenops/sdk@1.0.0` + `@zama-fhe/sdk@3.0.1` |

---

## Privacy Property

**Claim amounts are FHE-encrypted** per recipient by `@tokenops/sdk`. The on-chain claim transaction reveals only the recipient's wallet address and the airdrop clone address — not the amount. The encrypted balance appears only when the recipient uses the CipherOps **Private Reveal** flow in the Registry, which decrypts locally in the browser using their wallet's EIP-712 authorization.

---

## Caveats

- **Sepolia only** — all write flows are Sepolia-gated in the current UI; mainnet FHE not yet enabled by Zama
- **Claim JSON must match recipient wallet** — the `encryptedInput` proof is bound to `(airdropAddress, recipientAddress)`; connecting the wrong wallet will block the claim
- **Per-recipient encryption + signing** — the admin must run `encryptUint64` + `useSignClaimAuthorization` once per recipient (one MetaMask prompt per recipient for signing); production scale would benefit from a backend batch signer
- **Admin must hold DEFAULT_ADMIN_ROLE** — the `useSignClaimAuthorization` wallet must be the admin set in `AirdropParams.admin` at campaign creation
- **Claim window is time-bounded** — `startTimestamp` / `endTimestamp` in `AirdropParams`; demo used a short test window
- **Zama relayer dependency** — `encryptUint64` requires connectivity to `relayer.testnet.zama.org/v2`

---

## SDK Functions Used

| Step | SDK Call |
|---|---|
| Create + Fund | `useCreateAndFundConfidentialAirdropAndGetAddress({ encryptor, params, userSalt, amount })` |
| Per-recipient encrypt | `encryptUint64({ encryptor, contractAddress: airdropAddress, userAddress: recipient, value })` |
| Per-recipient sign | `useSignClaimAuthorization().mutateAsync({ airdropAddress, recipient, encryptedAmountHandle })` |
| Recipient claim | `useClaim({ address: airdropAddress }).mutate({ encryptedInput, signature })` |
| Reveal balance | Existing Private Reveal tab in Registry — same `confidentialBalanceOf` + `useFHEDecrypt` flow |
