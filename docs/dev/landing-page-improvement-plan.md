# Landing Page Improvement Plan

## Status
**Draft** — captured from voice memo on 2026-05-25. Not yet prioritized in Linear.

## Problem Statement

The current landing page (`app/page.tsx`, 360 lines) is too text-heavy. It needs more visual energy — real photos, motion, and breathing room — to make a stronger first impression. The app preview pane on the left side also feels cluttered with too many small menu items.

## Improvement Goals

### 1. Add Real Photography

Replace flat/vector illustrations with real car and garage lifestyle photos:

| Current | Proposed |
|---|---|
| `camry-preview.svg` (vector illustration) | Real car photos in context |
| `toyota-camry-le-2020.jpg` (Wikimedia placeholder) | Curated photos of car in garage, on road, maintenance shots |
| No human/context imagery | Warm lifestyle shots — person checking oil, organized glovebox, clean dashboard |

**Photo categories to source:**
- Car exterior hero shot (hero section background or feature card)
- Maintenance/DIY shots (wrench, oil change, tire check)
- Glovebox/docs shot (organized registration + insurance)
- Dashboard/app-in-use mockup (phone or laptop showing My Car Pal)

**Sourcing:** Unsplash, Pexels, or original photography. All must be license-compatible with AGPL-3.0.

### 2. Add Rotating GIF / Hero Video

Inspired by [viori.com](https://viori.com) — a looping visual at the top of the page that grabs attention.

**Options:**
- **Option A:** Looping MP4/WebM video (hero background) — car driving, maintenance montage
- **Option B:** Animated GIF carousel — 3-4 slides rotating through key features with photos
- **Option C:** CSS animation sequence — lighter weight, no video hosting needed

**Recommendation:** Start with Option C (CSS animation + static photos cycling) to keep bundle light, add video later if needed.

**Placement:** Replace or supplement the hero section's text-only area with visual motion.

### 3. Reduce Text Density

Current landing page content is dense. Proposed cuts:

| Section | Current | Proposed |
|---|---|---|
| Hero | 4 lines of text + 2 CTAs | 2 lines max + 1 CTA, let photo/video carry weight |
| Feature cards | 3 cards × 2 lines body | 2-3 cards × 1 line body, add icons/photos |
| Privacy promises | 4 items × 2 lines | 3 items × 1 line, use icon row |
| FAQ | 4 Q&A items, full paragraphs | 3 items, shorter answers, or move to `/about` |
| "Built for" section | Bullet list | Replace with photo grid |
| Footer | Multiple text blocks | Simplify, move legal links inline |

**Net reduction target:** ~40-50% less text, more whitespace.

### 4. Clean Up App Preview Pane

The left-side dashboard preview (shown in the landing page split view) has too many menu items at small size:

**Current issues:**
- Sidebar nav: 9 items (Dashboard, Maintenance, Reminders, Glovebox, Costs, Fuel, Vehicles, Reports, Settings) — too many
- Items are small and hard to scan at preview size
- Cluttered feel

**Proposed:**
- Reduce to 5-6 primary items: Dashboard, Maintenance, Glovebox, Vehicles, Reminders
- Larger icons and labels
- More whitespace between items
- Move secondary items (Costs, Fuel, Reports, Settings) under "More" or remove from preview

### 5. General Visual Direction

- **More photos, less text** — every section should have a visual anchor
- **Whitespace is a feature** — let content breathe
- **Motion where it adds value** — hero area, feature transitions
- **Keep the calm/modern aesthetic** — Things 3 / YNAB inspiration remains

### 6. Explore Color Scheme (Adriana's feedback)

Current scheme: green teal accents on white/light backgrounds. Adriana's input:

- Teal is "cool" but suggested **dark green** or **earth tones**
- "Definitely earth tones" — warmer, more grounded palette

**Options to prototype:**

| Direction | Primary | Accent | Vibe |
|---|---|---|---|
| **Current** | Teal #0EA5A0 | Green #16A34A | Clean, modern, app-like |
| **Dark green** | Forest #1B4332 | Sage #74C69D | Premium, outdoorsy, Subaru-aligned |
| **Earth tones** | Warm brown #8B6914 | Terracotta #C67B4B | Grounded, garage/workshop feel |
| **Slate + moss** | Slate #475569 | Moss #4D7C0F | Professional, calm, car-service vibe |

**Decision:** Prototype 2-3 of these as CSS variable swaps. Pick one that feels right with real photos. Earth tones + real car photography could be a strong combination.

### 7. Accessibility (Adriana's feedback)

> "You should also make it accessible to ppl with disabilities"

She's right — and it's a trust signal for a privacy-forward app. Key wins that aren't hard:

**Quick wins (low effort, high impact):**
- **Color contrast**: Ensure text meets WCAG AA (4.5:1 for body, 3:1 for large text). Current teal-on-white likely passes but dark green/earth tones must be checked.
- **Focus indicators**: Visible `:focus-visible` outlines on all interactive elements (currently may be suppressed by Tailwind's default reset)
- **Alt text**: Every image needs meaningful `alt` — especially important as we add more photos
- **Form labels**: All inputs properly associated with `<label>` — check login, register, contact forms

**Medium effort:**
- **Keyboard navigation**: Tab through every page, verify logical order and no keyboard traps
- **Screen reader audit**: Run through landing page with VoiceOver (built into macOS) — check heading hierarchy, link text, button labels
- **Reduced motion**: Respect `prefers-reduced-motion` for any CSS animations or GIFs we add

**Color-blind considerations (for the color scheme decision):**
- Avoid green/red alone for status (use icons + text, not color alone)
- The upcoming/glovebox statuses ("Good", "Due soon") should use icon + label, not just color

**Tooling:**
- `axe-core` or `@axe-core/react` for automated checks in CI
- Lighthouse accessibility audit (built into Chrome DevTools)
- macOS VoiceOver for manual screen reader testing

## Implementation Plan

| Phase | What | Effort | Priority |
|---|---|---|---|
| 1 | Source and add 3-4 real photos (hero, maintenance, glovebox) | 2-3 hours | High |
| 2 | Text reduction pass — cut 40%+ of copy | 1-2 hours | High |
| 3 | Simplify sidebar preview (fewer items, bigger) | 1-2 hours | High |
| 4 | Add hero motion (CSS animation or GIF) | 2-4 hours | Medium |
| 5 | Replace remaining SVGs with photos | 1-2 hours | Medium |
| 6 | Video/MP4 hero background (if CSS animation isn't enough) | 3-5 hours | Low |
| 7 | Prototype 2-3 color schemes (dark green, earth tones) as CSS variables | 1-2 hours | Medium |
| 8 | Accessibility pass — contrast, focus, alt text, keyboard nav | 2-3 hours | Medium |

## Photo Sourcing Notes

**Priority shots:**
1. Car exterior — clean, modern vehicle (could use Anthony's Outback Wilderness)
2. Maintenance action — hands-on wrench/oil change
3. Organized glovebox/docs — registration + insurance laid out
4. Dashboard/app preview — laptop or phone mockup

**License requirements:** Must be CC0, CC-BY, or original. AGPL-3.0 compatible.

## References

- Current landing page: `app/page.tsx`
- Landing assets: `public/images/landing/`
- Inspiration: [viori.com](https://viori.com) — hero video rotation
- Design direction: Things 3, YNAB — calm, whitespace, modern
