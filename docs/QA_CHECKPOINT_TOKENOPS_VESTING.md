# QA Checkpoint — TokenOps Confidential Vesting

**Date:** 2026-06-02
**Network:** Ethereum Sepolia (chainId 11155111)
**Wallet:** MetaMask EOA

---

## Full Flow Passed

| Step | Action | Result |
|---|---|---|
| 1 | **Create Vesting Manager** — `useCreateManagerAndGetAddress({ token, userSalt })` — factory auto-resolved from chainId | ✅ Pass |
| 2 | **setOperator** — granted manager clone as ERC-7984 operator before creating schedules | ✅ Pass |
| 3 | **Create Vesting Schedule** — `useCreateVesting({ address: manager, encryptor })` with 9-field `VestingParams` + encrypted amount | ✅ Pass |
| 4 | **Recipient Claim** — `useClaim({ address: manager })` with `vestingId`, `feeType`, `value` auto-resolved from `useManagerFeeInfo` | ✅ Pass |
| 5 | **Private Reveal** — claimed confidential balance revealed via Registry → Private Reveal flow | ✅ Pass |

---

## Confirmed Transactions

| Field | Value |
|---|---|
| Factory | `0xA87701CE9A52D43681600583a99c85b50DbE3150` |
| Manager address | `0xD3B4b66733E1F1Df883581e08f80CcedAF0B5ccE` |
| Manager deploy tx | `0x046a837cac4a8a2a6969a86cc90cc0509ef683d90c2c18d6ce95c393cc97102b` |
| Vesting schedule tx | `0x5a7743fabe923e26a298454d4e1957e212506253de862440c48594c2a11f9501` |
| Vesting claim tx | `0x398015f3e413b40fc0d14ff79797e8aeca4c5d772e2a87b60d77082804c467ec` |
| Vesting ID | `0x0000000000000000000000000000000000000000000000000000000000000000` |
| Recipient | `0x1afB9439693797FA7D5798B4706be7a27a5FD282` |
| Token | `0x7c5BF43B851c1dff1a4feE8dB225b87f2C223639` |
| Network | Ethereum Sepolia |
| SDK | `@tokenops/sdk@1.0.0` + `@zama-fhe/sdk@3.0.1` |

---

## Privacy Property

**Vesting claim amounts are FHE-encrypted** by `@tokenops/sdk` before the schedule is created. The on-chain vesting schedule reveals only the recipient address, timing parameters, and the encrypted handle — not the token amount. Each recipient can use the CipherOps **Private Reveal** flow in the Registry (`/registry` → select pair → Private Reveal tab) to decrypt their own claimed balance.

---

## SDK Functions Used

| Step | SDK Call |
|---|---|
| Create Manager | `useCreateManagerAndGetAddress({ token, userSalt })` |
| Allow Manager | `setOperator(managerAddress, ERC7984_OPERATOR_MAX_DEADLINE)` via `erc7984OperatorAbi` |
| Create Schedule | `useCreateVesting({ address: manager, encryptor }).mutate({ params: VestingParams, amount })` |
| Discover vestingIds | `useRecipientVestings({ address: manager, recipient })` |
| Read fee config | `useManagerFeeInfo({ address: manager })` → `{ feeType, fee }` |
| Claim | `useClaim({ address: manager }).mutate({ vestingId, feeType, value? })` |
| Reveal balance | Existing Registry Private Reveal tab — `confidentialBalanceOf` + `useFHEDecrypt` |

---

## Caveats

- **Sepolia only** — all write flows are Sepolia-gated; mainnet FHE not yet enabled by Zama
- **Vesting schedules are time-based** — recipient must wait until tokens are vested before claim succeeds
- **Claim may require waiting** — Step 11B demo used `startOffset=60s, duration=300s`; real schedules use longer horizons
- **Claimed balances remain confidential** — the claim amount is FHE-encrypted on-chain until the recipient runs Private Reveal
- **Zama relayer dependency** — `useCreateVesting` encrypts the amount via `relayer.testnet.zama.org/v2`; relayer downtime blocks schedule creation
- **vestingId = zero hash** — first schedule on a fresh manager produces `vestingId = 0x0000…0000`; this is valid and expected
- **Transient encryptor config error** — one intermittent `CONFIGURATION` error occurred on first attempt in Step 11B; retry succeeded; same class as prior Disperse fix
