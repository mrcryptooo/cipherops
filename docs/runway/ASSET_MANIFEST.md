# Runway — Asset Manifest

Every piece of artwork Episode 1 references, delivered or outstanding. This is the single
authoritative list — the four code-level registration points below are where these paths
are actually wired into the game, but this document is the one place to see everything at once.

**Registration points (code, do not consolidate — each is a distinct asset category):**
- `src/lib/runway/character-art.ts` — character portraits
- `src/lib/runway/prop-art.ts` — office props (flag-triggered)
- `src/lib/runway/office-art.ts` — office backdrop, per quarter
- `src/lib/runway/achievements.ts` (`img()` helper, inline per achievement) — achievement badge art

Until an asset lands at its final path, every one of these renders an honest placeholder
(initials monogram for portraits, a single-color inline SVG icon for props, a plain dark
gradient for the backdrop) — never a fake illustration. Swapping in the real asset is a
one-file, one-line change at the registration point; no layout, trigger, or component logic
needs to change.

## Delivered

| Filename | Dimensions | Purpose | Priority | Final path |
|---|---|---|---|---|
| `runway-office-q1-base.png` | 3840×2160 (source) | Q1 office backdrop — the persistent single location the whole episode plays inside | Critical | `/runway/office/runway-office-q1-base.png` |

## Outstanding — Character portraits

Square, so the initials-monogram placeholder they replace changes zero layout math.

| Filename | Dimensions | Purpose | Priority | Final path |
|---|---|---|---|---|
| `runway-portrait-mara.png` | 512×512 | Founder & CEO — scene header, office interrupt prompt | High |`/runway/characters/runway-portrait-mara.png` |
| `runway-portrait-priya.png` | 512×512 | Head of People & Ops — scene header, office interrupt prompt | High | `/runway/characters/runway-portrait-priya.png` |
| `runway-portrait-kai.png` | 512×512 | Founding Engineer — scene header, office interrupt prompt | High | `/runway/characters/runway-portrait-kai.png` |
| `runway-portrait-dana.png` | 512×512 | Board Advisor — scene header, office interrupt prompt | High | `/runway/characters/runway-portrait-dana.png` |
| `runway-portrait-theo.png` | 512×512 | Intern — scene header, office interrupt prompt | High | `/runway/characters/runway-portrait-theo.png` |

## Outstanding — Office props

Appear only once their trigger flag is set — the room's physical memory of what happened.

| Filename | Dimensions | Purpose | Priority | Trigger flag | Final path |
|---|---|---|---|---|---|
| `runway-prop-bell.png` | 300×300 | Theo's desk bell, visible once built | Medium | `bell-built` | `/runway/office/runway-prop-bell.png` |
| `runway-prop-testimonial-note.png` | 250×320 | Printed customer testimonial taped up once shared | Medium | `testimonial-public` | `/runway/office/runway-prop-testimonial-note.png` |

## Outstanding — Achievement badge art

All square 800×800, all rendered inline in the on-chain token metadata's `image` field
(a `finalPath`, not an uploaded file — no external hosting needed once art exists).

| Filename | Purpose | Priority | Final path |
|---|---|---|---|
| `runway-achievement-mission-completion.png` | Completed first real Mission | High | `/runway/achievements/runway-achievement-mission-completion.png` |
| `runway-achievement-confidential-master.png` | All 4 real Missions completed | High | `/runway/achievements/runway-achievement-confidential-master.png` |
| `runway-achievement-episode-completion.png` | Finished Episode 1 | High | `/runway/achievements/runway-achievement-episode-completion.png` |
| `runway-achievement-first-asset.png` | Registry Mission complete | Medium | `/runway/achievements/runway-achievement-first-asset.png` |
| `runway-achievement-first-payment.png` | Operations Mission complete | Medium | `/runway/achievements/runway-achievement-first-payment.png` |
| `runway-achievement-first-distribution.png` | Airdrop Mission complete | Medium | `/runway/achievements/runway-achievement-first-distribution.png` |
| `runway-achievement-first-vesting.png` | Vesting Mission complete | Medium | `/runway/achievements/runway-achievement-first-vesting.png` |
| `runway-achievement-perfect-mission.png` | All 4 Missions handled the best way | Medium | `/runway/achievements/runway-achievement-perfect-mission.png` |
| `runway-achievement-early-adopter.png` | Among the first minted into the collection | Medium | `/runway/achievements/runway-achievement-early-adopter.png` |
| `runway-achievement-hidden-story.png` | Chose "neither" in the Dana/Kai hallway scene | Low | `/runway/achievements/runway-achievement-hidden-story.png` |
| `runway-achievement-protected-employee.png` | Backed Kai's privacy stance | Low | `/runway/achievements/runway-achievement-protected-employee.png` |
| `runway-achievement-team-guardian.png` | Protected Kai's stance and Theo, separately | Low | `/runway/achievements/runway-achievement-team-guardian.png` |
| `runway-achievement-investor-confidence.png` | Backed openness and owned a mistake personally | Low | `/runway/achievements/runway-achievement-investor-confidence.png` |
| `runway-achievement-community-builder.png` | Delivered rewards and made a testimonial public | Low | `/runway/achievements/runway-achievement-community-builder.png` |

**Total: 22 registered assets — 1 delivered, 21 outstanding placeholders.** None of the 21
block any gameplay, mission, achievement, or ending; every fallback is intentional and
production-safe to demo as-is.

## Out of scope for this manifest

Office backdrops for Q2–Q4 have no registration entry yet — Episode 1 is Quarter 1 only.
When Phase 3 content is authored, add entries to `OFFICE_BACKDROPS` in `office-art.ts` and to
this manifest at the same time.
