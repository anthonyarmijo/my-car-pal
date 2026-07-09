# Warm Scandinavian Garage — visual direction

Status: **selected direction** (July 2026). Supersedes the "Desert Graphite" authenticated-shell
direction and the dark video-hero landing page.

## Product feeling

My Car Pal should feel like stepping into a clean, sunlit garage — and then into a beautifully
organized digital garage for your vehicle records, reminders, documents, and maintenance history.

The blend we aim for is **Scandinavian Garage × Bright Workshop**: light, warm, calm, premium,
owner-first, practical, polished, and trustworthy. It is explicitly **not** cold minimalism,
dealership software, enterprise fleet management, generic SaaS, or a dark/moody workshop. Premium,
but not pretentious.

## Tagline

> **Take care of your car. We'll handle the rest.**

Use this as the primary hero headline and closing CTA. Tone stays neutral, trustworthy, practical,
and empowering.

## Palette

Warm neutral base with dark green accents. Amber is reserved for warmth/warning, red for danger,
sage for success.

| Role | Value | Notes |
| --- | --- | --- |
| Warm off-white / cream background | `#f6f3ec` / `#F6F1E7` | page backgrounds |
| Porcelain surface | `#fffdf8` | cards, controls |
| Quiet surface | `#f7f3e9` | muted fills |
| Warm graphite text | `#26261f` / `#2A2A24` | primary foreground |
| Muted text | `#6C6353` | secondary copy |
| Stone/sand line | `#e2d9c8` | borders |
| Moss green accent | `#38624C` (`--mcp-color-moss-600`) | primary actions, links, active nav |
| Deep forest green | `#274A38` / `#2C523F` (`--mcp-color-forest-700`) | hover/pressed, high contrast |
| Soft sage fill | `#E4ECDD` | accent-soft chips, active nav background |
| Muted amber / clay | `#b45309`, `#d97706` | warnings, due-soon states |

Dark green is an **accent, not a dominant background**. The only intentionally green-dominant
surface is the final landing CTA strip. Do not introduce a dark green primary pane in the app
shell; the preferred direction is lighter and brighter. Dark mode remains supported as a secondary
theme with a soft sage accent (`#9FC7AB`).

Design-system note: `@my-car-pal/ui` token *names* still live under the `desert-graphite` manifest
for compatibility; `moss.600` / `forest.700` primitives now back `action.primary` /
`action.primary.strong`. Renaming the manifest is a follow-up.

## Typography

Geist (already wired via `next/font`) with warm graphite text. Readable modern faces with warmth
are acceptable alternatives if the stack changes: Inter, Manrope, Plus Jakarta Sans, DM Sans.
Avoid futuristic or decorative display fonts.

## Landing page

Structure (`app/page.tsx`, styles in `app/landing.css`, components in `components/landing/`):

1. **Sunlit garage hero** (`GarageHero`) — full-viewport "living photograph": warm morning light,
   bright garage backdrop (`public/images/landing/garage-hero-scene.svg`), organized tools, plants,
   and a vehicle clearly in the foreground. Tagline, one supporting line, primary + secondary CTA,
   and three proof points. A static/interactive scene today; it is deliberately structured in
   layers so a video loop could replace the backdrop later.
2. **Dashboard reveal** (`DashboardReveal`, `#product`) — as the user scrolls, the digital garage
   rises out of the garage scene: primary vehicle, next service, health, activity, stats.
3. **Features** (`FeatureSection`, `#features`) — six concise, visual cards. No walls of text.
4. **Privacy / ownership** (`PrivacySection`, `#privacy`) — trustworthy, not alarmist. Mentions
   self-hosting and the managed cloud option calmly.
5. **Final CTA** (`FinalCTA`) — tagline restated on the deep forest strip.

## Vehicle image compositing constraint

The long-term plan is a library of hundreds of make/model images (cars, trucks, SUVs,
motorcycles), possibly vectorized or cut out. Therefore:

- The vehicle must **never be integrated into the scene art**. It is a foreground cutout composited
  onto a clean stage/floor plane.
- The shadow is **synthetic and reusable** (a soft radial-gradient ellipse on the stage), so any
  cutout can be swapped in without retouching the background.
- Implemented as the `lp-vehicle-stage` / `lp-vehicle-shadow` / `lp-vehicle-cutout` pattern on the
  landing page and `.home-primary-vehicle-media::after` on the Home dashboard.
- Current placeholder asset: `public/images/landing/vehicle-cutout-tacoma.png` (see `Agents.md`
  imagery milestone).

## Motion principles

Subtle, tasteful, ambient — a living photo, never a flashy marketing video.

- Pointer parallax on the hero (backdrop, vehicle, floating cards move a few pixels on
  `--lp-px`/`--lp-py` custom properties).
- Gentle float on the hero proof cards; soft fade/rise on section entry (IntersectionObserver via
  `useFadeIn`).
- Small hover responses (1–3px lift) on cards and buttons.
- **Every** transform, transition, and animation is disabled under `prefers-reduced-motion`;
  parallax is also skipped for coarse pointers.
- No autoplaying video, no scroll-jacking, no large parallax distances, no attention-grabbing
  loops.

## Accessibility principles

- Strong color contrast: moss `#38624C` on porcelain and white passes WCAG AA for text and UI.
- Visible focus states (`:focus-visible` outlines on landing buttons; `--mcp-focus-ring` in the
  design system).
- Keyboard navigable: all hero/nav/CTA interactions are links and buttons; skip link retained in
  the shell.
- Semantic landmarks: sections are labelled with `aria-labelledby`; decorative scene art and the
  vehicle cutout use empty `alt` and `aria-hidden`.
- Reduced-motion support as above.
- No text baked into imagery; the hero scene SVG is purely decorative.

## Privacy-forward tone

Privacy messaging should feel like quiet confidence, not alarm: "No ads. No data selling.
Self-hostable. Export anytime." The managed cloud is framed as a convenience choice the owner
makes, never as the default that harvests data.

## Future enhancements (wishlist)

- **Seasonal hero**: the garage scene shifts with the seasons (light angle, foliage outside the
  window, small props). The layered SVG backdrop + CSS light overlay was built so a seasonal or
  time-of-day variant can be swapped in without touching the vehicle stage or copy. Not scheduled.
- Replace the static hero backdrop with a slow ambient video loop (same composition).
- Vehicle image library keyed by year/make/model/trim/body style (see `Agents.md`).
- Rename the `desert-graphite` token manifest to a warm-garage name once downstream consumers are
  ready.
