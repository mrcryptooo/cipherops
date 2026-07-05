# CipherOps — Design System

**Status:** Frozen. This is design law for CipherOps — not a style reference, a set of standing rules. It defines the product's personality as well as its pixels.

**Precedence:** CipherOps' own established patterns always win over generic design guidance, including the `ui-ux-pro-max` skill installed at `.claude/skills/ui-ux-pro-max/`. That skill is an advisor for genuine gaps, never an authority over this document.

**Read this alongside [PRODUCT_CONSTITUTION.md](PRODUCT_CONSTITUTION.md).** The Constitution defines what CipherOps is. This document defines how it feels.

---

## 1. Product Personality

**How should a page feel?** Calm, precise, quietly confident. Like private banking software, not a trading terminal. Never flashy, never gamified, never styled like generic crypto marketing.

**How should users think while using it?** *"I told it what I want. It's handling the how."* A user should never feel like they're operating a machine with levers — they should feel like they stated an intent and are watching it get carried out.

**How much information is too much?** More than one primary action and one supporting explanation on a screen. If a screen needs more than that, it isn't one screen — it's the next step of a guided flow. Density is earned only inside Overview, where a user has deliberately come to review, not to act.

**When should the interface guide?** Constantly, during any guided flow — starting a Program, preparing an Asset. There is always a visible next step. A user is never left looking at a blank canvas wondering what to do.

**When should it stay silent?** Once a Program is complete. The Verification receipt is the confirmation — it does not need a celebratory banner, a toast, or extra chrome on top of it. Let the proof speak for itself.

**What must never appear:**
- Fake balances, invented transaction hashes, or simulated success states
- Any implied persistence, saved history, or team access that doesn't exist yet
- A raw protocol or engine name (Disperse, Airdrop, Registry, Wrap, Unwrap, ciphertext, relayer) on any primary, business-facing surface
- A second accent color, a gradient, neon, glassmorphism, or any color outside the locked palette
- A modal as the default pattern for anything that could be inline

**What must always remain consistent:**
- The color palette and its single accent color
- The type system
- The card shape and its hover behavior
- The empty-state sentence formula
- The receipt as the one and only "success" pattern

## 2. Typography

**Typeface: Inter, single family, multiple weights.** No heading/body split — one family carries the entire product, which is what keeps nine-plus surfaces feeling like one product instead of a page built per sprint.

| Role | Weight | Size |
|---|---|---|
| Hero / Display | 700, tight tracking | 48px desktop / 32px mobile |
| Section header | 600 | 24–32px |
| Card title | 600 | 18–20px |
| Body | 400 | 16px |
| Label / eyebrow / badge | 500–600, uppercase, +12–18% tracking | 11–12px |

Default to fewer, bigger jumps rather than a dense middle scale. A screen with three sizes of text reads calmer than one with six.

## 3. Color System

Locked. No exceptions, no seasonal variation, no per-page override.

```css
--background:          #000000
--foreground:           #f4f4f4
--accent:               #FFD208   /* the only accent color in the entire product */
--accent-dim:           rgba(255, 210, 8, 0.10)
--accent-border:        rgba(255, 210, 8, 0.22)
--surface:              #0d0d0d
--card:                 #141414
--card-border:          rgba(255, 255, 255, 0.07)
```

Section backgrounds vary in small steps (`#000`, `#050505`, `#070707`) to create depth without introducing a new hue. Secondary text uses a four-step grey ramp: `#888`, `#999`, `#555`, `#444`, from "secondary copy" to "tertiary/footer."

**Exceptions — the only two:** green for a success state, red for an error state. Nothing else. No blue, cyan, purple, pink, indigo, or gradient, anywhere, ever.

## 4. Layout System

- Max content width: `max-w-7xl` for full-bleed sections, `max-w-4xl` for long-form reading.
- Horizontal page padding: `px-4 sm:px-6 lg:px-10` on every surface — one padding ramp for the whole product.
- Vertical section rhythm: `py-16` to `py-20` for standard sections, `py-14 sm:py-20` for hero sections. Sections are chunky and clearly separated, never a continuous tight scroll.
- Sections separate with a hairline top border (`1px solid rgba(255,255,255,0.05)`) plus a background shade shift — never a heavy divider or drop shadow.

## 5. Grid

Flexbox-first layout; CSS grid reserved for genuine grid content (card collections). No 12-column framework. Feature and card grids scale from one column on mobile to two, three, or four on desktop using standard responsive utilities. Decorative grid backgrounds are a hero-only accent — never applied behind real content, where they compete with it.

## 6. Card System

```css
background: var(--card) or rgba(255,255,255,0.025)
border: 1px solid var(--card-border)
border-radius: 12px (primary unit); 8px for nested/small elements
padding: px-5 py-4
```

Hover state, card-level elements:
```css
transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
background: rgba(255, 210, 8, 0.04);
border-color: rgba(255, 210, 8, 0.30);
transform: translateY(-2px);
box-shadow: 0 8px 32px rgba(255, 210, 8, 0.06);
```

Lighter elements (rows, tabs, chips) use a smaller lift (`translateY(-1px)`) at a faster timing (0.12s). Reserve the full lift-plus-glow treatment for card-level elements only.

## 7. Motion & Animation

- Micro-interactions: 120–300ms, `ease` or `ease-in-out`. Never `linear`, never above 450ms.
- Animate one or two elements per view at most — never everything that could move.
- Standard entrance: `fadeSlideIn` (opacity 0→1, translateY 12px→0, 0.45s ease), staggered in 0.08s steps for grouped elements.
- One ambient effect exists in the whole system: a slow accent-colored glow-pulse (3s, ease-in-out, infinite), reserved for a single primary call-to-action at a time. Never two glow-pulse elements on one screen.
- Always respect `prefers-reduced-motion`. No exceptions.

## 8. Component Rules

- **Buttons:** exactly two styles. Primary — solid accent background, black text, bold, 12px radius. Secondary — dark card background, subtle border, hover shifts to accent. No third button style, ever.
- **Badges / pills:** fully rounded, dim accent background, accent border, accent text, `text-xs font-medium`.
- **Section labels:** uppercase, `text-xs font-semibold`, accent color, wide letter-spacing. One label style for the entire product.
- **Active nav state:** accent text plus a soft accent-tinted background pill. No underlines, anywhere.
- **Modals are the exception, not the default.** Prefer inline expansion for any flow that can be inline.

## 9. Spacing

An 8px base unit, used consistently:

| Unit | px | Use |
|---|---|---|
| `gap-2` | 8 | Icon + text, inline groups — the default |
| `gap-3` | 12 | Inside a card |
| `gap-4` | 16 | Between sections of a card |
| `gap-6` | 24 | Wide layout splits |

Minimum 8px between any two adjacent interactive elements, without exception — this matters most on mobile tab bars and list rows.

## 10. Icons

Inline SVG only. No icon font, no external icon package. Single-color (`currentColor` or accent), stroke-based, consistent ~20–24px bounding box. One icon system for the whole product — never introduce a second.

## 11. Empty States

One formula, used everywhere a business action requires a precondition that isn't met yet:

```
"Connect your wallet to {action}."
```
Centered, muted secondary text, inside a card, no illustration. The same formula extends to any future "nothing here yet" state — muted, centered, one sentence, never fabricated placeholder content.

## 12. Success States

A receipt, never a toast. Every completed Program or Operation produces a persistent card with the proof — the transaction reference and a link to check it independently — styled identically wherever it appears. This is not just a UI pattern, it's the physical form the Constitution's "every action ends in proof" principle takes. Green is reserved exclusively for this state's accents.

## 13. Error States

Shown inline, next to the action that failed, always with a visible way to retry or reset — never a dead end that requires a page reload. Wrong-network and connection failures get a dedicated, unmistakable state. Red is reserved exclusively for this state's accents.

## 14. Responsive Behavior

- Standard Tailwind breakpoints only — no custom breakpoints.
- Dense tabular data scrolls horizontally with a visible hint on narrow viewports, rather than forcing a broken column collapse.
- No horizontal overflow at 375px width, on any surface, ever — checked on every new page before it ships.

## 15. Interaction Rules

- Every clickable element has a hover state that changes more than just color — position or shadow always accompanies a color shift.
- Inline expansion over modals, everywhere it's possible.
- Copy-to-clipboard uses one pattern: a label that swaps from "Copy" to "Copied," nothing else.

## 16. Forward Compatibility

Nothing in this system needs a new visual language when Layer 2 ships. A future Organization or Asset switcher is built from the existing pill and nav-active patterns. A future Program history list reuses the existing card system and empty-state formula — "no Programs yet" is the same shape as today's connect-wallet empty state, not a new illustration-driven one. A future notification affordance reuses the existing badge vocabulary, not a new bell-and-drawer pattern.

Do not pre-build UI for a Layer 2 feature that doesn't exist. No disabled nav item, no greyed-out tab implying something is coming. Per the Constitution's honesty law, forward compatibility means the design language will scale when the feature is real — not that placeholder UI ships early.

---

*Where this document is silent on a genuinely new situation, consult the `ui-ux-pro-max` skill for guidance — any recommendation it produces that conflicts with a rule in this document is overruled by this document.*
