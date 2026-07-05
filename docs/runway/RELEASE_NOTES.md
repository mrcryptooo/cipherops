# Runway — Episode 1 Release Candidate 1 (RC1)

**Status: content-complete and locked.** No further gameplay, story, dialogue, pacing, or
architecture changes are planned for this release. This document summarizes what shipped.

## What Runway is

Runway is a narrative business-simulation living inside CipherOps as its own tab. The player
runs a small startup's first quarter. The office is the one persistent location — no
in-game navigation, no menu of pages. A character either interrupts you with something that
needs a decision, or you open your own laptop when it's quiet. Four of those decisions can
only be honestly resolved by leaving the fiction and executing the real CipherOps product on
Sepolia — wrapping a confidential asset, paying a contractor privately, distributing an
airdrop, and vesting an employee's equity. The game verifies the real transaction before the
story is allowed to continue. Nothing is simulated.

## Content in this release

- **34 storylets** — dilemmas, callbacks, and payoffs, several re-cast dynamically depending
  on which character's state currently qualifies.
- **19 ambient beats** — pure texture, no stakes, keeping the office feeling lived-in between
  real decisions.
- **4 real Missions** — Registry, Operations, Airdrop, Vesting — each requires a genuine
  Sepolia transaction, verified against a live receipt and block before the story continues.
  All four are guaranteed reachable in every playthrough regardless of earlier branching.
- **14 achievements** — 4 tied to a specific verified Mission transaction, 10 tied to broader
  session facts (a flag, a count, or live on-chain mint supply). All are real, soulbound
  ERC-721 mints once a contract is deployed; none are ever fabricated.
- **3 narrative endings**, each with 2 closing-choice variants (6 distinct outcomes),
  deferred by the engine until nothing else is left so every playthrough reaches a real close.
- **3 guaranteed emotional payoffs** ("WOW moments") — Theo privately revealing his own vested
  balance, Kai realizing the system replaced the need to trust people, and Mara realizing she
  could announce something true without exposing everything behind it. All three are reachable
  regardless of branch.
- **Session-only save/replay** — honest by design: closing the tab ends the session, matching
  the rest of the product's Layer-1 honesty rule. No fake cloud save.

## What makes this different from a typical hackathon demo

The FHE/Zama technology is never explained to the player. It's discovered — through a
contractor payment that has to stay private, an airdrop that can't become a public
leaderboard, an employee who doesn't want his equity compared to everyone else's, and a
moment where that same employee decrypts his own number and no one else in the building can.
The four real Missions aren't a form bolted onto a story; they're the only honest way the
plot's dilemmas can resolve.

## Verification performed before this release

- Every Mission, every ending variant, every achievement, and every major branch was traced
  for reachability, including a full adversarial audit that found and fixed one real
  softlock risk (an achievement that was silently unobtainable due to an unreachable
  narrative trigger).
- `tsc --noEmit`, lint, and `next build` all pass clean.
- Zero console errors across extensive live and synthetic-state playtesting.
- Replay verified to reset session state completely and cleanly.

## Known limitations

See `PROJECT_STATUS.md` for the full list. Headline items: the achievement NFT contract has
no deployer key in this environment yet, so live minting isn't active in every deployment;
21 of 22 registered artwork slots are still placeholders (see `ASSET_MANIFEST.md`), all
production-safe to demo as-is; Q2–Q4 content does not exist yet — Episode 1 is a complete,
self-contained quarter with a guaranteed ending.
