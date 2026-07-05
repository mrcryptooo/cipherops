# Runway — Art Production Queue

Companion to `ASSET_PROMPTS.md`. Work through assets in the order below — it's ordered by
what a judge or player sees first, and by dependency (character canon must be locked before
anything else references it).

## Production order

| # | Asset | Priority | Depends on | Est. generation time* |
|---|---|---|---|---|
| 1 | Asset 01 — Mara Portrait | High | MASTER_STYLE + Format A locked | 2–5 min |
| 2 | Asset 02 — Priya Portrait | High | Asset 01 approved (framing precedent) | 2–5 min |
| 3 | Asset 03 — Kai Portrait | High | Asset 01 approved | 2–5 min |
| 4 | Asset 04 — Dana Portrait | High | Asset 01 approved | 2–5 min |
| 5 | Asset 05 — Theo Portrait | High | Asset 01 approved | 2–5 min |
| 6 | Asset 08 — Achv: Mission Completion | High | MASTER_STYLE + Format B locked | 2–5 min |
| 7 | Asset 09 — Achv: Confidential Master | High | Asset 08 approved (badge edge precedent) | 2–5 min |
| 8 | Asset 10 — Achv: Episode Completion | High | Asset 08 approved | 2–5 min |
| 9 | Asset 11 — Achv: First Confidential Asset | Medium | Asset 08 approved | 2–5 min |
| 10 | Asset 12 — Achv: First Secure Payment | Medium | Asset 08 approved | 2–5 min |
| 11 | Asset 13 — Achv: First Confidential Distribution | Medium | Asset 08 approved | 2–5 min |
| 12 | Asset 14 — Achv: First Vesting Completion | Medium | Asset 08 approved | 2–5 min |
| 13 | Asset 15 — Achv: Perfect Mission | Medium | Asset 08 approved | 2–5 min |
| 14 | Asset 16 — Achv: Early Adopter | Medium | Asset 08 approved | 2–5 min |
| 15 | Asset 06 — Bell Prop | Medium | MASTER_STYLE + Format C locked | 2–5 min |
| 16 | Asset 07 — Testimonial Note Prop | Medium | Asset 06 approved (material precedent) | 2–5 min |
| 17 | Asset 17 — Achv: Hidden Story | Low | Asset 08 approved | 2–5 min |
| 18 | Asset 18 — Achv: Protected Employee | Low | Asset 08 approved | 2–5 min |
| 19 | Asset 19 — Achv: Team Guardian | Low | Asset 18 approved (shares its shield motif) | 2–5 min |
| 20 | Asset 20 — Achv: Investor Confidence | Low | Asset 08 approved | 2–5 min |
| 21 | Asset 21 — Achv: Community Builder | Low | Asset 08 approved | 2–5 min |

*Per-image generation time in ChatGPT Image, excluding review/re-roll time. Budget 1–2
re-rolls per asset for framing consistency, especially for the first portrait and the first
badge — everything after inherits their precedent, so it's worth getting those two exactly
right before moving down the queue.

## Why this order

1. **Portraits first.** They're the highest-priority, most-visible asset (every scene header)
   and establish the "Format A" precedent — generate Mara first, check she matches
   `ASSET_PROMPTS.md`'s framing/lighting spec exactly, then use her as the visual anchor when
   generating the remaining four so the cast feels like one consistent set.
2. **High-priority achievement badges second**, to lock the "Format B" emblem style
   (Asset 08) before generating the other thirteen badges against it.
3. **Medium-priority mission badges third** — these are the four most narratively important
   badges (one per real Mission) and share Asset 08's precedent directly.
4. **Props are independent of the badge/portrait tracks** and can be generated any time after
   MASTER_STYLE is locked — placed here because they're Medium priority and lower-visibility
   than portraits.
5. **Low-priority badges last** — cosmetic, narratively optional achievements (Hidden Story,
   Protected Employee, Team Guardian, Investor Confidence, Community Builder). Team Guardian
   explicitly reuses Protected Employee's shield motif, so generate that pair back-to-back.

## Dependencies summary

- All 21 assets depend on `MASTER_STYLE` being established first (paste it once at the start
  of your ChatGPT Image conversation).
- Portraits (Assets 01–05) additionally depend on `Format A` and share one one framing
  precedent — approve Asset 01 before generating 02–05.
- Achievement badges (Assets 08–21) additionally depend on `Format B` and share one edge
  precedent — approve Asset 08 before generating the rest.
- Props (Assets 06–07) additionally depend on `Format C`.
- No asset depends on any game code change — every one is a drop-in replacement for an
  existing, working placeholder (see `INTEGRATION_GUIDE.md`).

## Integration order

Integrate in the same order as production — don't batch-integrate at the end. Each asset is
a one-line code change (see `INTEGRATION_GUIDE.md`), so verifying one at a time in the running
app catches a framing or crop problem immediately, while the ChatGPT Image conversation
context that produced it is still fresh enough to re-roll cheaply.

## Approval checklist (run per asset before integrating)

- [ ] Matches the filename exactly as specified in `ASSET_PROMPTS.md`
- [ ] Correct dimensions (or larger at the same aspect ratio — downscale on export, never
      upscale)
- [ ] Background transparency matches the spec (opaque for portraits, transparent for props
      and badges)
- [ ] No text, logo, watermark, or UI chrome anywhere in the image
- [ ] Only one saturated accent color present (the warm gold-yellow), nothing else bright
- [ ] For portraits: face and shoulders sit inside the frame's inscribed circle; matches the
      established framing of the previously-approved portraits
- [ ] For badges: centered with even padding; matches the established edge treatment of
      Asset 08
- [ ] For props: silhouette still reads clearly when mentally scaled down to ~16px
- [ ] Exported as PNG at the exact final filename from `ASSET_PROMPTS.md`

Only move to the next asset in the queue once the current one passes every box above.
