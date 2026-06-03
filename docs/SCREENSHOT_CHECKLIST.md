# CipherOps Registry — Screenshot Checklist

Capture these screenshots for submission. Name each file clearly.

---

## Landing / Hero

- [ ] **`01_hero.png`** — Full landing page: headline "Every confidential token. One place.", subline, Protocol Coverage panel (6/6 live)
- [ ] **`02_protocol_coverage_6of6.png`** — Protocol Coverage panel close-up with all 6 items lit green
- [ ] **`03_privacy_lifecycle.png`** — Privacy Lifecycle section showing the 4-step flow
- [ ] **`04_guided_quickstart.png`** — Guided Quickstart with all 5 steps available

---

## Registry Explorer

- [ ] **`05_live_registry_source_badge.png`** — Live Registry Source badge ("Sourced live from Zama on-chain registry") with Sepolia contract address
- [ ] **`06_sepolia_registry_table.png`** — Registry table on Sepolia showing 1+ valid pair rows with addresses and action buttons
- [ ] **`07_mainnet_read_only_note.png`** — Registry on Mainnet with the "Mainnet pairs are displayed for discovery. Write actions are Sepolia-only." banner
- [ ] **`08_mainnet_registry_table.png`** — Mainnet registry table with pairs shown and all write buttons greyed

---

## Lifecycle flow — TokenActionPanel

- [ ] **`09_faucet_success.png`** — Test Assets tab after successful mint: "✓ Complete" button + Verification Details with tx hash
- [ ] **`10_approve_success.png`** — Approve tab: "Allowance is sufficient — proceed to Wrap." green banner
- [ ] **`11_wrap_success.png`** — Wrap tab after confirmation: Verification Details showing Action=Wrap, tx hash, "Private Reveal comes next" note
- [ ] **`12_private_reveal_balance.png`** — Private Reveal tab: decrypted balance displayed in the "Confidential Balance" card with the privacy note
- [ ] **`13_unwrap_gateway_step.png`** — Unwrap tab in "awaiting_gateway" state: 3-step progress, request ID visible
- [ ] **`14_unwrap_finalize_ready.png`** — Unwrap tab: "Gateway decrypted: X wrapperSymbol" green banner with Finalize Unwrap button
- [ ] **`15_unwrap_complete.png`** — Unwrap complete card: underlying ERC-20 amount released, both tx hashes shown

---

## Mobile responsive

- [ ] **`16_mobile_table_scroll.png`** — Narrow browser (375px): table with horizontal scroll hint, scrollbar visible, columns accessible
- [ ] **`17_mobile_panel_tabs.png`** — TokenActionPanel tabs on mobile showing horizontal tab scroll

---

## Notes

- Use Sepolia with MetaMask; wallet should show a real address (not 0x000…)
- All tx hashes should be real Sepolia transactions
- Do not show any private keys, seed phrases, or full wallet balances beyond what's needed
- Crop screenshots to the relevant content area; include browser chrome only where it adds context
