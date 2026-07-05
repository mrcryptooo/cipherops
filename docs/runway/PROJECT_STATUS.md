# Runway — Project Status

**Episode 1: Release Candidate 1. Content-complete and locked.**

## Completion

| Scope | Status |
|---|---|
| Episode 1 (Quarter 1) content | 100% — locked, no further gameplay/story changes planned |
| Episode 1 production packaging | Complete (this pass) |
| Achievement NFT contract — built | 100% — compiles clean, fully tested logic |
| Achievement NFT contract — deployed | Not yet — no funded deployer key present in this environment |
| Multi-episode arc (Q2–Q4) | 0% — not started, planned for a future phase |

## Implemented systems

- Storylet/beat eligibility engine (pure functions, no UI coupling) — `engine.ts`
- Immutable state-transition engine (choice/beat application, mission recording) — `apply.ts`
- Session-scoped save/load/replay, honestly non-persistent across tab closes — `persistence.ts`
- Real on-chain Mission verification against live Sepolia receipts and blocks — `MissionVerify.tsx`
- Soulbound, multi-episode achievement NFT system, on-chain metadata, no external hosting — `achievements.ts`, `achievement-contract.ts`, `contracts/RunwayAchievements.sol`
- Career Profile — reads achievements live from chain when a contract is deployed, falls back
  to session state otherwise — `CareerProfile.tsx`
- Placeholder-art pipeline with four category-specific registration points, all documented
  in `ASSET_MANIFEST.md`

## Implemented missions (4/4)

| Mission | Engine | Route |
|---|---|---|
| Registry | Confidential asset wrap | `/registry` |
| Operations | Private contractor payment | `/operations` |
| Airdrop | Confidential rewards distribution | `/airdrop` |
| Vesting | Confidential equity vesting | `/vesting` |

All four are guaranteed reachable in every playthrough regardless of earlier branching
(verified via adversarial audit and live/synthetic-state playtesting).

## Implemented achievements (14/14)

4 mission-tied (First Confidential Asset, First Secure Payment, First Confidential
Distribution, First Vesting Completion) + 10 milestone-tied (Mission Completion, Confidential
Master, Perfect Mission, Hidden Story, Protected Employee, Team Guardian, Investor Confidence,
Community Builder, Early Adopter, Episode Completion). All independently obtainable across
some playthrough; none require an impossible or contradictory combination of choices.

## Implemented endings (3 variants × 2 closing choices = 6 outcomes)

- **Kai's ending** — requires backing Kai's privacy stance and mentoring Theo. The strongest
  available emotional close; recommended path for demos.
- **Dana's ending** — requires backing Dana's openness stance.
- **Generic ending** — the guaranteed fallback, requires only that the contractor arc resolved.

The engine defers all finale variants until nothing else is eligible, so every playthrough
reaches a real close regardless of which branches were taken.

## Remaining assets

21 of 22 registered artwork slots are still production-safe placeholders (initials monograms,
single-color SVG icons, plain gradient). Full breakdown, dimensions, and priority in
`ASSET_MANIFEST.md`. None block gameplay.

## Known limitations

- **Achievement NFT contract is not deployed.** The contract, deploy script, and full client
  mint flow are all built and tested; the only missing piece is a funded Sepolia deployer key,
  which does not exist in this environment and was never fabricated. See
  `DEPLOY_CHECKLIST.md` step 3 to deploy.
- **The same achievement can be minted more than once across separate playthroughs or
  wallets.** Expected — these are collectible proof-of-play badges, not scarce assets; this
  is not an exploit.
- **No Q2–Q4 content exists yet.** Episode 1 is a complete, self-contained quarter with a
  guaranteed ending — it does not feel truncated, but the wider multi-quarter arc referenced
  in the finale's "bigger next quarter" branch is not yet written.
- **21 artwork placeholders remain outstanding** (see above) — cosmetic only.

## Roadmap after Episode 1

1. Deploy the achievement contract with a real funded key; set
   `NEXT_PUBLIC_ACHIEVEMENT_CONTRACT_ADDRESS` in production.
2. Commission real art in priority order per `ASSET_MANIFEST.md` (character portraits and
   high-priority achievement badges first).
3. Phase 3: author Q2–Q4 storylet/beat/mission content, extending the same engine and
   achievement collection — no new architecture required, per the existing multi-episode
   design (`episode` field already threaded through achievements and the contract).
4. Re-run the full RC1-style adversarial playtest audit against the expanded content before
   locking each subsequent episode.
