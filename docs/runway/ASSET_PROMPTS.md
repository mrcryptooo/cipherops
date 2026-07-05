# Runway — Asset Prompts (ChatGPT Image, production-ready)

Copy `MASTER_STYLE` once into your own notes if your tool doesn't retain conversation
context between generations. Every asset prompt below is written to be pasted **on its own**
directly after `MASTER_STYLE` has been established in the same conversation — it only
contains the subject and any asset-specific requirements. Never re-paste the entire
`MASTER_STYLE` block per asset; that's exactly what this document exists to avoid.

No prompt below names another game, franchise, or artist. Every stylistic reference
describes the visual target directly.

---

## MASTER_STYLE

```
Medium: digital illustration rendered to read like a real color photograph — soft
painterly brushwork standing in for photographic grain, not a cartoon, not anime, not a
3D render, not flat vector art.

Lighting: one practical light source per scene (a desk lamp, a monitor's glow, window
light), warm amber key light falling off into near-black ambient shadow. Soft shadow
edges. No hard rim lighting, no studio softbox look.

Palette: near-black backgrounds in the range #050505–#0d0d0d, warm neutral skin/wood/
fabric tones, and exactly one saturated accent color — a warm gold-yellow, hex #FFD208 —
which may only appear as a light source, a screen glow, or one small object. Never as
clothing, never as a full-scene wash, never doubled with any other bright color.

Camera: documentary/editorial framing with a slightly imperfect, candid composition —
never a posed studio headshot. Shallow depth of field, a 35–50mm equivalent lens feel,
very slight film grain.

Mood: quiet, intimate, a little tired, a little hopeful — a small real company working
late, not a polished tech-ad office.

Detail level: believable, lived-in clutter (cables, coffee cups, sticky notes, worn
edges) rendered softly — never crisp, never sterile.

Absolute rules: no text, no logos, no UI chrome, no watermarks, no signatures anywhere in
the image. No other bright or saturated colors besides the single gold-yellow accent.
```

### Format A — Character Portrait

```
Square 1:1 frame, full-bleed (the subject's background fills the entire frame — no
transparency, no vignette border). Head-and-upper-shoulders bust crop, three-quarter
angle, subject looking slightly off-camera rather than directly into the lens — candid,
not a posed headshot. Face and shoulders centered inside the frame's inscribed circle,
since the UI displays this image inside a circular mask — keep all essential detail out
of the four corners, they will be cropped away. Background is a soft, shallow-depth-of-
field blur of the same office palette as MASTER_STYLE, not a plain studio backdrop.
All five character portraits must share this exact framing, lighting setup, and lens
feel so they read as one consistent cast when shown interchangeably in the UI.
```

### Format B — Achievement Badge Emblem

```
Square 1:1 frame, subject centered with roughly 10% even padding on all sides so nothing
is clipped when shown at small list-row thumbnail size. Transparent background (PNG
alpha channel) — no scene, no floor, no wall, just the emblem itself and its own cast
shadow/glow. Composition: a single symbolic badge/emblem design (not a photographic
scene) built from the MASTER_STYLE palette — dark emblem body, warm gold-yellow (#FFD208)
as the one accent (a rim of light, an engraved line, a glowing detail), rendered with the
same soft painterly quality as everything else, not a flat vector icon and not a glossy
game-store trophy sticker. All fourteen badges must share this exact framing, edge
treatment, and rendering style so the full collection reads as one coherent set in a
list.
```

### Format C — Office Prop

```
Square or near-square frame as specified per asset, subject centered with roughly 10%
padding, transparent background (PNG alpha channel) so it can sit inline next to text
with no box around it. Rendered as a small, real object with the same warm, soft,
slightly-worn material quality as everything else in MASTER_STYLE — not a clean product
render, not a flat icon.
```

### Character canon (reference once, reuse verbatim for consistency)

No prior visual bible exists for these five characters — the descriptions below are the
canonical baseline as of this pass. Reuse them verbatim for any future regeneration or
additional pose of the same character, so the cast stays visually consistent across art
that's generated at different times.

- **Mara** (Founder & CEO) — early 30s, warm brown skin, natural curly black hair pulled
  back loosely, an oversized cardigan over a plain tee, energetic posture, expressive
  hands.
- **Priya** (Head of People & Ops) — late 20s, South Asian, sleek low ponytail, small gold
  hoop earrings, a fitted blazer over a plain top, calm and grounded posture.
- **Kai** (Founding Engineer) — late 20s/early 30s, East Asian, undercut hairstyle grown
  out slightly, over-ear headphones resting around his neck, a hoodie over a plain shirt,
  guarded posture, arms often crossed.
- **Dana** (Board Advisor) — mid 40s, Black, short natural coily hair with a few grey
  strands, a sharp tailored blazer, minimal jewelry, composed upright posture.
- **Theo** (Intern) — early 20s, White, messy short hair, an open flannel over a plain
  t-shirt, younger and more eager posture than the rest of the cast, often mid-fidget.

---

## Asset 01 — Mara Portrait

| Field | Value |
|---|---|
| Filename | `runway-portrait-mara.png` |
| Priority | High |
| Category | Character portrait |
| Dimensions | 512×512 |
| Background | Opaque (soft blurred office palette, per Format A) |
| Format | PNG |
| Destination | `/public/runway/characters/runway-portrait-mara.png` |
| Appears | Scene header and office "someone's interrupting you" prompt, wherever Mara is the cast character |
| Unlocked by | Always available — not gated by any game state |
| Replaces placeholder | Yes — replaces the initials monogram ("M") currently rendered by `Avatar` in `RunwayOffice.tsx` |
| Animation applied by code | None baked into the asset — the existing `.fade-in` CSS transition (opacity + translateY, 0.4s ease) already wraps the `Avatar` component; do not add motion to the image itself |
| Safe padding | Keep face and shoulders within the frame's inscribed circle; nothing essential in the four corners |
| Crop-safe area | Center circle, roughly 80% of frame width |
| Focal point | Eyes, upper-third of frame |
| Must match | The other four portraits (Format A framing/lighting exactly) |

**Prompt (paste after MASTER_STYLE + Format A are established):**
```
SUBJECT: Mara, the founder — early 30s, warm brown skin, natural curly black hair pulled
back loosely, wearing an oversized cardigan over a plain tee. She's mid-thought, caught
in a candid moment rather than posing — energetic, a little restless, like she just
looked up from her phone. One hand is slightly raised near her collarbone, as if she was
about to say something. Warm lamp light from off-frame left catches the side of her face;
the rest falls into soft shadow.
```

---

## Asset 02 — Priya Portrait

| Field | Value |
|---|---|
| Filename | `runway-portrait-priya.png` |
| Priority | High |
| Category | Character portrait |
| Dimensions | 512×512 |
| Background | Opaque (Format A) |
| Format | PNG |
| Destination | `/public/runway/characters/runway-portrait-priya.png` |
| Appears | Scene header and office interrupt prompt, wherever Priya is cast |
| Unlocked by | Always available |
| Replaces placeholder | Yes — initials monogram ("P") |
| Animation applied by code | None — inherits existing `.fade-in` |
| Safe padding | Same rule as Asset 01 |
| Crop-safe area | Same rule as Asset 01 |
| Focal point | Eyes, upper-third of frame |
| Must match | The other four portraits |

**Prompt:**
```
SUBJECT: Priya, Head of People & Ops — late 20s, South Asian, hair in a sleek low
ponytail, small gold hoop earrings, a fitted blazer over a plain top. Calm, competent
expression, slightly amused — like she already knows how this conversation ends. Caught
mid-glance toward someone off-frame, not posing for the camera. Same warm single-source
lamp lighting as the rest of the cast, soft shadow falloff to near-black.
```

---

## Asset 03 — Kai Portrait

| Field | Value |
|---|---|
| Filename | `runway-portrait-kai.png` |
| Priority | High |
| Category | Character portrait |
| Dimensions | 512×512 |
| Background | Opaque (Format A) |
| Format | PNG |
| Destination | `/public/runway/characters/runway-portrait-kai.png` |
| Appears | Scene header and office interrupt prompt, wherever Kai is cast |
| Unlocked by | Always available |
| Replaces placeholder | Yes — initials monogram ("K") |
| Animation applied by code | None — inherits existing `.fade-in` |
| Safe padding | Same rule as Asset 01 |
| Crop-safe area | Same rule as Asset 01 |
| Focal point | Eyes, upper-third of frame |
| Must match | The other four portraits |

**Prompt:**
```
SUBJECT: Kai, the founding engineer — late 20s to early 30s, East Asian, an undercut
hairstyle grown out slightly, over-ear headphones resting around his neck rather than on
his ears, a hoodie over a plain shirt. Guarded, unreadable expression, arms not quite
crossed but close to it. Looking slightly past the camera, not at it. The same warm lamp
key light as the rest of the cast, with a faint cool glow from an off-frame monitor just
touching one side of his face.
```

---

## Asset 04 — Dana Portrait

| Field | Value |
|---|---|
| Filename | `runway-portrait-dana.png` |
| Priority | High |
| Category | Character portrait |
| Dimensions | 512×512 |
| Background | Opaque (Format A) |
| Format | PNG |
| Destination | `/public/runway/characters/runway-portrait-dana.png` |
| Appears | Scene header and office interrupt prompt, wherever Dana is cast |
| Unlocked by | Always available |
| Replaces placeholder | Yes — initials monogram ("D") |
| Animation applied by code | None — inherits existing `.fade-in` |
| Safe padding | Same rule as Asset 01 |
| Crop-safe area | Same rule as Asset 01 |
| Focal point | Eyes, upper-third of frame |
| Must match | The other four portraits |

**Prompt:**
```
SUBJECT: Dana, the board advisor — mid 40s, Black, short natural coily hair with a few
grey strands showing, a sharp tailored blazer, minimal jewelry (one structured ring).
Composed, upright posture, a small dry almost-smile — someone who has seen a lot and
isn't rattled by much. Direct but not hard eye line, slightly past the camera. Same warm
single-source lighting as the rest of the cast.
```

---

## Asset 05 — Theo Portrait

| Field | Value |
|---|---|
| Filename | `runway-portrait-theo.png` |
| Priority | High |
| Category | Character portrait |
| Dimensions | 512×512 |
| Background | Opaque (Format A) |
| Format | PNG |
| Destination | `/public/runway/characters/runway-portrait-theo.png` |
| Appears | Scene header and office interrupt prompt, wherever Theo is cast — including the two WOW-moment scenes (`q1-reveal`, and cameo context around it) |
| Unlocked by | Always available |
| Replaces placeholder | Yes — initials monogram ("T") |
| Animation applied by code | None — inherits existing `.fade-in` |
| Safe padding | Same rule as Asset 01 |
| Crop-safe area | Same rule as Asset 01 |
| Focal point | Eyes, upper-third of frame |
| Must match | The other four portraits |

**Prompt:**
```
SUBJECT: Theo, the intern — early 20s, White, messy short hair, an open flannel over a
plain t-shirt. Younger, more eager posture than the rest of the cast — leaning slightly
forward, like he's mid-fidget with a pen just out of frame. Earnest, a little unsure of
himself, small hopeful expression. Same warm single-source lamp lighting as the rest of
the cast.
```

---

## Asset 06 — Bell Prop

| Field | Value |
|---|---|
| Filename | `runway-prop-bell.png` |
| Priority | Medium |
| Category | Office prop |
| Dimensions | 300×300 |
| Background | Transparent (Format C) |
| Format | PNG |
| Destination | `/public/runway/office/runway-prop-bell.png` |
| Appears | Inline next to the office ambience line, rendered at 16×16 via `propIcon("bell")` in `RunwayOffice.tsx` |
| Unlocked by | `bell-built` flag (set once the player lets Theo ring it in `q1-02`) |
| Replaces placeholder | Yes — replaces the inline single-color `BellIcon` SVG |
| Animation applied by code | None — rendered as a static inline `<img>`; inherits the parent scene's `.fade-in` only |
| Safe padding | ~10% margin on all sides so the silhouette isn't clipped when scaled down to 16px |
| Crop-safe area | Centered, bold enough silhouette to read at icon size |
| Focal point | The bell's dome and handle, viewed from a ¾ front-top angle so both read clearly even tiny |
| Must match | No other asset directly, but must use the same warm lighting/material language as MASTER_STYLE — a real, slightly worn hardware-store desk bell, not a clean 3D render |

**Prompt:**
```
SUBJECT: a small worn brass desk bell, the cheap hardware-store kind with a push-button
top, sitting alone with nothing around it. Warm lamp-light glint on the brass dome, soft
shadow beneath it. A little scuffed, not shiny-new — it's been sitting on a desk for a
while. Viewed from a three-quarter front-top angle so the dome and the push button both
read clearly.
```

---

## Asset 07 — Testimonial Note Prop

| Field | Value |
|---|---|
| Filename | `runway-prop-testimonial-note.png` |
| Priority | Medium |
| Category | Office prop |
| Dimensions | 250×320 |
| Background | Transparent (Format C) |
| Format | PNG |
| Destination | `/public/runway/office/runway-prop-testimonial-note.png` |
| Appears | Inline next to the office ambience line, rendered via `propIcon("testimonialNote")` in `RunwayOffice.tsx` |
| Unlocked by | `testimonial-public` flag (set once the player shares a customer testimonial wider in `q1-08`) |
| Replaces placeholder | Yes — replaces the inline single-color `NoteIcon` SVG |
| Animation applied by code | None — same as Asset 06 |
| Safe padding | ~10% margin on all sides |
| Crop-safe area | Centered, bold silhouette for tiny-icon legibility |
| Focal point | The printed sheet's slightly curled top-right corner, where it's taped |
| Must match | No other asset directly; same material/lighting language as MASTER_STYLE |

**REGENERATION REQUIRED — v1 rejected.** The first delivered version showed a fully
legible handwritten note reading "Theo, your work made this possible — Priya," despite
the v1 prompt already asking for illegible text. That's wrong on two counts: it's an
internal note between two colleagues, not a customer testimonial (this prop's own trigger
flag is `testimonial-public` — a customer's words, shared outside the company), and its
text is fully readable rather than abstracted. v2 below is stricter about both.

**Prompt (v2):**
```
SUBJECT: a single sheet of printer paper, slightly curled at one corner, taped up by that
corner with a small strip of tape, hanging as if pinned to a office wall or door frame.
The sheet shows a printed screenshot-style block of body text in a plain sans-serif font
— rendered only as abstracted grey text lines/blocks with no legible individual letters
or words, at any zoom level. No handwriting, no signature, no names, no logos. The
context is a customer's product feedback printed out and shared, not a personal note —
keep it looking like an impersonal printed page, not a handwritten card. Warm lamp light
catching the paper's texture, soft shadow behind it. A little worn, like it's been up for
a few days already.
```

---

## Asset 08 — Achievement: Mission Completion

| Field | Value |
|---|---|
| Filename | `runway-achievement-mission-completion.png` |
| Priority | High |
| Category | Achievement badge |
| Dimensions | 800×800 |
| Background | Transparent (Format B) |
| Format | PNG |
| Destination | `/public/runway/achievements/runway-achievement-mission-completion.png` |
| Appears | Career Profile achievement list; episode-end achievement list; embedded as the `image` field in this achievement's on-chain token metadata |
| Unlocked by | Completing any one real Mission (`state.missionLog.length >= 1`) |
| Replaces placeholder | Yes — no visual currently renders for badges; this is the first pass of real art for the achievement list, which currently shows text-only rows |
| Animation applied by code | None baked in — badge images render inside the existing `.fade-in` list container in `CareerProfile.tsx` and the episode-end screen |
| Safe padding | ~10% even padding (Format B) |
| Crop-safe area | Centered emblem, symmetrical |
| Focal point | Dead center |
| Must match | The other thirteen achievement badges (Format B framing/edge treatment exactly) |

**Prompt:**
```
SUBJECT: a simple round emblem representing a single completed step — a single filled
circle centered inside a slightly larger open ring, like one checkpoint reached on a
longer path. The ring is dark, engraved-looking; the inner filled circle glows faintly
with the one warm gold-yellow accent. No text, no numerals, no additional symbols.
```

---

## Asset 09 — Achievement: Confidential Master

| Field | Value |
|---|---|
| Filename | `runway-achievement-confidential-master.png` |
| Priority | High |
| Category | Achievement badge |
| Dimensions | 800×800 |
| Background | Transparent (Format B) |
| Format | PNG |
| Destination | `/public/runway/achievements/runway-achievement-confidential-master.png` |
| Appears | Career Profile and episode-end achievement lists; token metadata `image` |
| Unlocked by | All 4 real Missions completed (Registry, Operations, Airdrop, Vesting) |
| Replaces placeholder | Yes |
| Animation applied by code | None baked in — see Asset 08 |
| Safe padding | Format B |
| Crop-safe area | Centered emblem |
| Focal point | Dead center |
| Must match | The other thirteen achievement badges |

**Prompt:**
```
SUBJECT: a round emblem built from four small filled shapes — a square, a coin, a
triangle, and a diamond, each rendered simply and small — arranged evenly around the
inside edge of one larger dark ring, all four touching a single glowing point at the
center where their lines converge. The four small shapes and the center point are the
only things rendered in the warm gold-yellow accent; the ring itself stays dark. Reads as
one unified emblem, not four separate icons.
```

---

## Asset 10 — Achievement: Episode Completion

| Field | Value |
|---|---|
| Filename | `runway-achievement-episode-completion.png` |
| Priority | High |
| Category | Achievement badge |
| Dimensions | 800×800 |
| Background | Transparent (Format B) |
| Format | PNG |
| Destination | `/public/runway/achievements/runway-achievement-episode-completion.png` |
| Appears | Career Profile and episode-end achievement lists; token metadata `image` |
| Unlocked by | `episode-complete` flag (reaching any finale variant) |
| Replaces placeholder | Yes |
| Animation applied by code | None baked in — see Asset 08 |
| Safe padding | Format B |
| Crop-safe area | Centered emblem |
| Focal point | Dead center |
| Must match | The other thirteen achievement badges |

**Prompt:**
```
SUBJECT: a round emblem showing a single door or archway shape, slightly ajar, with warm
gold-yellow light spilling through the gap onto the dark ring around it. Suggests an
ending that's also an opening onto something next — quiet, not triumphant.
```

---

## Asset 11 — Achievement: First Confidential Asset

| Field | Value |
|---|---|
| Filename | `runway-achievement-first-asset.png` |
| Priority | Medium |
| Category | Achievement badge |
| Dimensions | 800×800 |
| Background | Transparent (Format B) |
| Format | PNG |
| Destination | `/public/runway/achievements/runway-achievement-first-asset.png` |
| Appears | Career Profile and episode-end achievement lists; token metadata `image` |
| Unlocked by | Completing the Registry Mission (`q1-reg`) |
| Replaces placeholder | Yes |
| Animation applied by code | None baked in — see Asset 08 |
| Safe padding | Format B |
| Crop-safe area | Centered emblem |
| Focal point | Dead center |
| Must match | The other thirteen achievement badges |

**Prompt:**
```
SUBJECT: a round emblem centered on a simple sealed box or vault-like shape, closed, with
one small keyhole-like slit glowing warm gold-yellow. Reads as "something made secure,"
not literal or technical.
```

---

## Asset 12 — Achievement: First Secure Payment

| Field | Value |
|---|---|
| Filename | `runway-achievement-first-payment.png` |
| Priority | Medium |
| Category | Achievement badge |
| Dimensions | 800×800 |
| Background | Transparent (Format B) |
| Format | PNG |
| Destination | `/public/runway/achievements/runway-achievement-first-payment.png` |
| Appears | Career Profile and episode-end achievement lists; token metadata `image` |
| Unlocked by | Completing the Operations Mission (`q1-04`) |
| Replaces placeholder | Yes |
| Animation applied by code | None baked in — see Asset 08 |
| Safe padding | Format B |
| Crop-safe area | Centered emblem |
| Focal point | Dead center |
| Must match | The other thirteen achievement badges |

**Prompt:**
```
SUBJECT: a round emblem centered on a simple folded envelope or note shape, sealed shut
with a small dot of warm gold-yellow wax-like light where the flap closes. Reads as
"something given quietly, just between two people."
```

---

## Asset 13 — Achievement: First Confidential Distribution

| Field | Value |
|---|---|
| Filename | `runway-achievement-first-distribution.png` |
| Priority | Medium |
| Category | Achievement badge |
| Dimensions | 800×800 |
| Background | Transparent (Format B) |
| Format | PNG |
| Destination | `/public/runway/achievements/runway-achievement-first-distribution.png` |
| Appears | Career Profile and episode-end achievement lists; token metadata `image` |
| Unlocked by | Completing the Airdrop Mission (`q1-air`) |
| Replaces placeholder | Yes |
| Animation applied by code | None baked in — see Asset 08 |
| Safe padding | Format B |
| Crop-safe area | Centered emblem |
| Focal point | Dead center |
| Must match | The other thirteen achievement badges |

**Prompt:**
```
SUBJECT: a round emblem centered on several small identical dots radiating outward from
one central glowing point, each dot the same size and evenly spaced — like light being
shared out equally, not a leaderboard or ranking. Only the center point and dots are the
warm gold-yellow accent.
```

---

## Asset 14 — Achievement: First Vesting Completion

| Field | Value |
|---|---|
| Filename | `runway-achievement-first-vesting.png` |
| Priority | Medium |
| Category | Achievement badge |
| Dimensions | 800×800 |
| Background | Transparent (Format B) |
| Format | PNG |
| Destination | `/public/runway/achievements/runway-achievement-first-vesting.png` |
| Appears | Career Profile and episode-end achievement lists; token metadata `image` |
| Unlocked by | Completing the Vesting Mission (`q1-vest`) |
| Replaces placeholder | Yes |
| Animation applied by code | None baked in — see Asset 08 |
| Safe padding | Format B |
| Crop-safe area | Centered emblem |
| Focal point | Dead center |
| Must match | The other thirteen achievement badges |

**Prompt:**
```
SUBJECT: a round emblem centered on a small sapling or single sprouting plant shape,
simple and few-lined, with the topmost leaf tip rendered in the warm gold-yellow accent
as if catching light. Reads as "something that grows and becomes properly someone's own."
```

---

## Asset 15 — Achievement: Perfect Mission

| Field | Value |
|---|---|
| Filename | `runway-achievement-perfect-mission.png` |
| Priority | Medium |
| Category | Achievement badge |
| Dimensions | 800×800 |
| Background | Transparent (Format B) |
| Format | PNG |
| Destination | `/public/runway/achievements/runway-achievement-perfect-mission.png` |
| Appears | Career Profile and episode-end achievement lists; token metadata `image` |
| Unlocked by | All 4 Missions handled the most generous/careful way (specific flag combination) |
| Replaces placeholder | Yes |
| Animation applied by code | None baked in — see Asset 08 |
| Safe padding | Format B |
| Crop-safe area | Centered emblem |
| Focal point | Dead center |
| Must match | The other thirteen achievement badges |

**Prompt:**
```
SUBJECT: a round emblem centered on four small identical dots, evenly spaced in a
perfect diamond arrangement, each connected to the center by a thin glowing line — all
four fully lit in the warm gold-yellow accent, no dimmer or unlit ones. Reads as
"everything, done fully," without looking like a scoreboard or checklist.
```

---

## Asset 16 — Achievement: Early Adopter

| Field | Value |
|---|---|
| Filename | `runway-achievement-early-adopter.png` |
| Priority | Medium |
| Category | Achievement badge |
| Dimensions | 800×800 |
| Background | Transparent (Format B) |
| Format | PNG |
| Destination | `/public/runway/achievements/runway-achievement-early-adopter.png` |
| Appears | Career Profile and episode-end achievement lists; token metadata `image` |
| Unlocked by | Minting while live on-chain `totalMinted()` is still below the cutoff (checked at mint time, not authorable in advance) |
| Replaces placeholder | Yes |
| Animation applied by code | None baked in — see Asset 08 |
| Safe padding | Format B |
| Crop-safe area | Centered emblem |
| Focal point | Dead center |
| Must match | The other thirteen achievement badges |

**Prompt:**
```
SUBJECT: a round emblem centered on a small single flame or spark shape, simple and
compact, rendered in the warm gold-yellow accent against the dark ring, with the faintest
suggestion of a few unlit, smaller sparks trailing behind it — like being first through a
door that's still opening.
```

---

## Asset 17 — Achievement: Hidden Story

| Field | Value |
|---|---|
| Filename | `runway-achievement-hidden-story.png` |
| Priority | Low |
| Category | Achievement badge |
| Dimensions | 800×800 |
| Background | Transparent (Format B) |
| Format | PNG |
| Destination | `/public/runway/achievements/runway-achievement-hidden-story.png` |
| Appears | Career Profile and episode-end achievement lists; token metadata `image` |
| Unlocked by | Choosing "neither" in the Dana/Kai hallway scene (`q1-23`) |
| Replaces placeholder | Yes |
| Animation applied by code | None baked in — see Asset 08 |
| Safe padding | Format B |
| Crop-safe area | Centered emblem |
| Focal point | Dead center |
| Must match | The other thirteen achievement badges |

**Prompt:**
```
SUBJECT: a round emblem centered on a small shape half in warm gold-yellow light and half
left in dark shadow, split cleanly down a vertical center line — neither side dominant.
Reads as "the option that refuses to pick a side," without any literal symbol.
```

---

## Asset 18 — Achievement: Protected Employee

| Field | Value |
|---|---|
| Filename | `runway-achievement-protected-employee.png` |
| Priority | Low |
| Category | Achievement badge |
| Dimensions | 800×800 |
| Background | Transparent (Format B) |
| Format | PNG |
| Destination | `/public/runway/achievements/runway-achievement-protected-employee.png` |
| Appears | Career Profile and episode-end achievement lists; token metadata `image` |
| Unlocked by | Backing Kai's privacy stance (`privacy-chosen-once` flag) |
| Replaces placeholder | Yes |
| Animation applied by code | None baked in — see Asset 08 |
| Safe padding | Format B |
| Crop-safe area | Centered emblem |
| Focal point | Dead center |
| Must match | The other thirteen achievement badges |

**Prompt:**
```
SUBJECT: a round emblem centered on a small closed shield-like shape, simple and rounded
rather than angular or militaristic, with a single warm gold-yellow line tracing just its
inner edge. Quiet and protective, not defensive or aggressive.
```

---

## Asset 19 — Achievement: Team Guardian

| Field | Value |
|---|---|
| Filename | `runway-achievement-team-guardian.png` |
| Priority | Low |
| Category | Achievement badge |
| Dimensions | 800×800 |
| Background | Transparent (Format B) |
| Format | PNG |
| Destination | `/public/runway/achievements/runway-achievement-team-guardian.png` |
| Appears | Career Profile and episode-end achievement lists; token metadata `image` |
| Unlocked by | `privacy-chosen-once` + `theo-protected` flags both set |
| Replaces placeholder | Yes |
| Animation applied by code | None baked in — see Asset 08 |
| Safe padding | Format B |
| Crop-safe area | Centered emblem |
| Focal point | Dead center |
| Must match | The other thirteen achievement badges |

**Prompt:**
```
SUBJECT: a round emblem centered on two small closed shield-like shapes (same shield
motif as Asset 18), overlapping slightly, both traced with the same single warm
gold-yellow inner-edge line. Reads as the same protective idea, extended to more than one
person.
```

---

## Asset 20 — Achievement: Investor Confidence

| Field | Value |
|---|---|
| Filename | `runway-achievement-investor-confidence.png` |
| Priority | Low |
| Category | Achievement badge |
| Dimensions | 800×800 |
| Background | Transparent (Format B) |
| Format | PNG |
| Destination | `/public/runway/achievements/runway-achievement-investor-confidence.png` |
| Appears | Career Profile and episode-end achievement lists; token metadata `image` |
| Unlocked by | `openness-chosen-once` + `mistake-owned` flags both set |
| Replaces placeholder | Yes |
| Animation applied by code | None baked in — see Asset 08 |
| Safe padding | Format B |
| Crop-safe area | Centered emblem |
| Focal point | Dead center |
| Must match | The other thirteen achievement badges |

**Prompt:**
```
SUBJECT: a round emblem centered on a small open ledger or open-book shape, rendered
plainly, with a single straight warm gold-yellow line running across both open pages —
nothing hidden, nothing crossed out. Reads as "kept it straight," not literal finance
iconography.
```

---

## Asset 21 — Achievement: Community Builder

| Field | Value |
|---|---|
| Filename | `runway-achievement-community-builder.png` |
| Priority | Low |
| Category | Achievement badge |
| Dimensions | 800×800 |
| Background | Transparent (Format B) |
| Format | PNG |
| Destination | `/public/runway/achievements/runway-achievement-community-builder.png` |
| Appears | Career Profile and episode-end achievement lists; token metadata `image` |
| Unlocked by | `rewards-delivered` + `testimonial-public` flags both set |
| Replaces placeholder | Yes |
| Animation applied by code | None baked in — see Asset 08 |
| Safe padding | Format B |
| Crop-safe area | Centered emblem |
| Focal point | Dead center |
| Must match | The other thirteen achievement badges |

**Prompt:**
```
SUBJECT: a round emblem centered on several small identical dots arranged in a loose
open ring around the center, each connected to its two neighbors by a thin line, all
rendered in the warm gold-yellow accent — a small connected circle of points, not a
crowd icon or literal people symbols.
```
