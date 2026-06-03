# CipherOps Registry — Demo Video Script

**Target length:** 3 minutes  
**Style:** screen recording + narration; professional, no music  
**Demo pair:** cUSDCMock / USDCMock on Sepolia  
**Wallet:** MetaMask connected to Sepolia

---

## 0:00 – 0:25 | Context

**[Show: landing page hero, Protocol Coverage 6/6 panel]**

> "On-chain confidential tokens are powerful — but without tooling, the ecosystem is invisible to most users. The Zama wrapper registry maps every verified ERC-20 to its encrypted ERC-7984 counterpart, but accessing it means writing raw ABI calls."
>
> "CipherOps turns that registry into a usable product. This is a live explorer and lifecycle UI that reads the official registry contracts directly, with no intermediary. Let's walk through the full flow."

---

## 0:25 – 0:55 | Live registry + network discovery

**[Show: Registry Explorer section; Sepolia tab active showing pairs; switch to Mainnet]**

> "The registry is queried on-chain in real time — here on Sepolia, and also on Ethereum Mainnet for read-only discovery. You can see every valid ERC-20 to ERC-7984 wrapper pair with token metadata, addresses, and explorer links. Mainnet data is purely for discovery; write actions are Sepolia-only."
>
> "Let's switch back to Sepolia and open the cUSDCMock pair."

---

## 0:55 – 1:25 | Faucet → Approve → Wrap

**[Show: Click Faucet on a row → panel opens on Test Assets tab → mint → Approve tab → approve → Wrap tab → wrap → Verification Details]**

> "Clicking Faucet opens the action panel for this pair. We're on the Test Assets tab — this calls `ERC20.mint` on the official Sepolia mock token to fund the wallet."
>
> **[After mint confirmation]**
>
> "Moving to the Approve tab — we set an allowance so the wrapper contract can spend our tokens, calling `ERC20.approve`."
>
> **[After approve]**
>
> "Now Wrap. This calls `wrapper.wrap`, transfers the underlying ERC-20 to the contract, and mints an equivalent encrypted ERC-7984 balance. Balance is now on-chain but confidential — the number is hidden using FHE."

---

## 1:25 – 1:55 | Private Reveal

**[Show: Switch to Private Reveal tab → FHE SDK initialises → handle shown → click Reveal → MetaMask EIP-712 prompt → balance displayed]**

> "The Private Reveal tab reads the encrypted balance handle from the chain. To see the actual number, the wallet signs a one-time EIP-712 request — this is a user-decrypt operation through the Zama relayer SDK."
>
> **[After signing]**
>
> "The balance decrypts locally. The plaintext never touches the network — it's visible only to the wallet holder. This is ERC-7984 working as intended."

---

## 1:55 – 2:30 | Unwrap + Finalize

**[Show: Switch to Unwrap tab → enter amount → Start Unwrap → step indicators → wallet prompt → await gateway → Finalize button appears → finalize → complete]**

> "Unwrap is a two-step process. First, we encrypt the amount using the FHE SDK and call `wrapper.unwrap` — this burns the confidential tokens and signals the Zama Gateway to perform a public decryption."
>
> "The Gateway resolves the encrypted handle — this takes a few seconds — and returns a cleartext amount plus a cryptographic proof. We then call `wrapper.finalizeUnwrap` with that proof. The contract verifies the proof on-chain and releases the underlying ERC-20 back to the wallet."
>
> **[Show complete card with both tx hashes]**
>
> "Two transactions, one flow. The full lifecycle is complete."

---

## 2:30 – 3:00 | Ecosystem value / closing

**[Show: Protocol Coverage 6/6 lit up; Guided Quickstart all steps available; Mainnet pairs]**

> "CipherOps covers the full Zama confidential token lifecycle — from discovery to wrap, private reveal, and unwrap — against the official registry contracts on both Sepolia and Mainnet."
>
> "This is infrastructure tooling that makes confidential tokens accessible. The registry is live, the SDK integration is open source, and the same pattern works for any token pair registered in the official Zama registry."
>
> "CipherOps. Every confidential token. One place."

---

## Recording checklist

- [ ] MetaMask pre-connected to Sepolia with ETH
- [ ] Registry table visible and loaded (no spinner)
- [ ] FHE SDK ready before starting reveal section
- [ ] Ensure Sepolia RPC is reliable (use Alchemy/Infura, not public RPC)
- [ ] Record at 1920×1080 or 1440×900
- [ ] Pause 1–2s after each MetaMask confirmation for visual clarity
