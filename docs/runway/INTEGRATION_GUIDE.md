# Runway — Art Integration Guide

How each generated asset from `ASSET_PROMPTS.md` replaces its current placeholder. Every
integration is a **one-line change to an existing registration file** — no component,
layout, or trigger logic changes, ever. This is the entire reason those files exist as a
separate layer from the components that render them.

## General steps (same for every asset)

1. Export the approved image from ChatGPT Image as a PNG at the exact filename given in
   `ASSET_PROMPTS.md`.
2. Place it at the exact **final destination path** given for that asset.
3. Open the one registration file that asset belongs to (see table below) and uncomment or
   add the one line pointing to it.
4. Reload `/runway` in the browser and visually confirm it renders in place of the
   placeholder, at every size it appears (see "Appears" column in `ASSET_PROMPTS.md`).
5. Run `npm run build` once after a batch of assets lands, to confirm nothing broke.

No other file needs to change. No import needs to move. No CSS needs adjusting — every
placeholder already occupies the exact footprint the real asset will fill.

## Character portraits → `src/lib/runway/character-art.ts`

Currently:
```ts
const CHARACTER_ART: Partial<Record<CharacterId, string>> = {
  // mara: CHARACTER_ART_META.mara.finalPath,
};
```

After placing `runway-portrait-mara.png` at
`/public/runway/characters/runway-portrait-mara.png`, uncomment (or add) its line:
```ts
const CHARACTER_ART: Partial<Record<CharacterId, string>> = {
  mara: CHARACTER_ART_META.mara.finalPath,
};
```

Repeat per character as each portrait lands — `priya`, `kai`, `dana`, `theo` follow the
identical pattern, each its own key. Partial adoption is safe: any character not yet in this
object automatically keeps rendering the initials-monogram placeholder in `Avatar()`
(`RunwayOffice.tsx`) — there's no broken in-between state.

## Office props → `src/lib/runway/prop-art.ts`

Currently:
```ts
const PROP_ART: Partial<Record<PropKey, string>> = {
  // bell: PROP_ART_META.bell.finalPath,
};
```

Same pattern — uncomment `bell: PROP_ART_META.bell.finalPath,` once
`runway-prop-bell.png` is placed at `/public/runway/office/runway-prop-bell.png`, and
`testimonialNote: PROP_ART_META.testimonialNote.finalPath,` once
`runway-prop-testimonial-note.png` lands. `propIcon()` in `RunwayOffice.tsx` automatically
switches from the inline SVG (`BellIcon`/`NoteIcon`) to the real image the moment
`getPropArt()` returns non-null — no other change needed.

## Achievement badges → `src/lib/runway/achievements.ts`

This one is already fully wired — every achievement's `image.finalPath` already points at
its real destination path (e.g. `/runway/achievements/runway-achievement-first-asset.png`),
computed by the `img()` helper. **There is no placeholder-toggle step for badges** — simply
place each approved PNG at its exact final path from `ASSET_PROMPTS.md` / `ASSET_MANIFEST.md`
and it's live immediately, both in the Career Profile / episode-end UI and in the on-chain
token metadata's `image` field (`buildTokenURI()` in `achievement-contract.ts` reads
`achievement.image.finalPath` directly).

Because of this, badge art can land in any order without touching code at all — just drop
files into `/public/runway/achievements/` as they're approved.

## Office backdrop → `src/lib/runway/office-art.ts`

Not part of this pass (Q1's backdrop, `runway-office-q1-base.png`, is already delivered and
live). For reference, when Q2–Q4 backdrops are eventually produced, the same pattern applies:
add a `2: "/runway/office/runway-office-q2-base.png"` entry (etc.) to the `OFFICE_BACKDROPS`
object.

## Verification after integrating a batch

- [ ] `/runway` office screen shows real portraits instead of initials for every character
      integrated so far
- [ ] Props appear inline exactly where their trigger flag is already known to fire (bell
      after `q1-02`, testimonial note after `q1-08`) — see `RELEASE_NOTES.md` for flag
      details if unsure
- [ ] Career Profile and the episode-end achievement list show real badge art instead of a
      text-only row, for every badge integrated so far
- [ ] `npm run build` still completes clean
- [ ] No console errors on `/runway` after a hard reload

## What never changes during this pass

Per the standing lock on Episode 1: no storylet, beat, mission, achievement requirement,
trigger threshold, or ending changes as part of integrating art. If an asset doesn't look
right at its actual in-game size, the fix is a new prompt iteration in `ASSET_PROMPTS.md`,
never a code or layout change — every placeholder already occupies the correct footprint by
design.
