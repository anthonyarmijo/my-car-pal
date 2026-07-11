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

The tagline lives on the highway film that opens the page and is restated on the closing CTA
strip; the garage scene beneath carries the product-focused heading instead. Tone stays neutral,
trustworthy, practical, and empowering.

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
shell; the preferred direction is lighter and brighter.

### Theming

The theme defaults to the **system preference**; the landing header exposes a single sun/moon
icon that shows the theme you would switch *to* and, when clicked, moves from system-following to
an explicit manual choice. Dark mode is theme-matched rather than merely dimmed: the garage
backdrop swaps to a photographic night scene
(`public/images/landing/garage-hero-scene-night-neutral.png`), the highway film gets its own
exposure treatment per theme, the dashboard/browser preview carries a complete dark palette, and
the accent softens to sage (`#9FC7AB`). The signed-in app keeps the three-way
Auto/Light/Dark toggle.

Design-system note: `@my-car-pal/ui` token *names* still live under the `desert-graphite` manifest
for compatibility; `moss.600` / `forest.700` primitives now back `action.primary` /
`action.primary.strong`. Renaming the manifest is a follow-up.

## Typography

Geist (already wired via `next/font`) with warm graphite text. Readable modern faces with warmth
are acceptable alternatives if the stack changes: Inter, Manrope, Plus Jakarta Sans, DM Sans.
Avoid futuristic or decorative display fonts.

## Landing page

Structure (`app/page.tsx`, styles in `app/landing.css`, components in `components/landing/`):

1. **Highway film opener** (in `GarageHero`) — a full-viewport muted highway loop
   (`public/videos/highway-loop.mp4`, poster fallback for reduced motion and loading) owns the
   first screen, with the tagline overlaid and a bouncing scroll-cue arrow. The site header sits
   transparently on top of the film, Porsche-style: centered logo lockup, quiet white nav links
   left, the sun/moon theme icon plus transparent Log In / outlined Start Free pills right.
2. **Sunlit garage scene** (`#garage`) — after a short crossfade band, the garage rises in: a
   photorealistic open-door garage "living photograph"
   (`public/images/landing/garage-hero-scene.jpg` by day, the night variant in dark mode) with
   **no vehicle in it** — deliberately open, quiet space. The copy sits centered over the clean
   floor: "Your digital garage / Everything about your car, in one calm place.", a
   dashboard-focused supporting line, primary + secondary CTA, and three proof points behind a
   soft local scrim. Subtle pointer parallax moves the backdrop only.
3. **Dashboard reveal** (`DashboardReveal`, `#product`) — a realistic neutral-gray browser mockup
   (tab strip, toolbar, padlocked address bar) framing the product shell: left sidebar navigation,
   greeting bar, primary-vehicle card with the composited cutout, Upcoming list, stats, and
   health/activity panels. This is where the vehicle appears — it reads as *your car in the app*.
4. **Features** (`FeatureSection`, `#features`) — six concise cards with moss-green line icons,
   closed by "Built for owners, not dealerships." No walls of text.
5. **Privacy / ownership** (`PrivacySection`, `#privacy`) — trustworthy, not alarmist. Mentions
   self-hosting and the managed cloud option calmly.
6. **Final CTA + footer** (`FinalCTA`, `SiteFooter`) — tagline restated on the deep forest strip,
   then a quiet footer with product/company/trust links.

## Vehicle image compositing constraint

The long-term plan is a library of hundreds of make/model images (cars, trucks, SUVs,
motorcycles), possibly vectorized or cut out. Therefore:

- The vehicle must **never be integrated into the scene art**. It is a foreground cutout composited
  onto a clean stage/floor plane.
- The shadow is **synthetic and reusable** (a soft radial-gradient ellipse on the stage), so any
  cutout can be swapped in without retouching the background.
- Implemented as the `lp-vehicle-stage` / `lp-vehicle-shadow` / `lp-vehicle-cutout` pattern in the
  landing dashboard preview and `.home-primary-vehicle-media::after` on the Home dashboard. The
  garage hero itself is intentionally vehicle-free — the empty scene is the point, and the car
  shows up inside the product preview instead.
- Current placeholder asset: `public/images/landing/vehicle-cutout-tacoma.png` (see `Agents.md`
  imagery milestone).

## Motion principles

Subtle, tasteful, ambient — a living photo, not a flashy marketing reel.

- One ambient film: the muted, warm-graded highway loop at the top (autoplay, no audio, poster
  fallback under `prefers-reduced-motion`).
- Pointer parallax on the garage backdrop only (a few pixels on `--lp-px`/`--lp-py` custom
  properties); the scene's content stays still.
- Soft fade/rise on section entry (IntersectionObserver via `useFadeIn`); the garage scene uses a
  longer ~1.2s rise after a deliberate breathing-space band below the film.
- A gently nudging scroll-cue arrow on the film; small hover responses (1–3px lift) on cards and
  buttons.
- **Every** transform, transition, and animation is disabled under `prefers-reduced-motion`;
  parallax is also skipped for coarse pointers.
- No scroll-jacking, no large parallax distances, no attention-grabbing loops.

## Accessibility principles

- Strong color contrast: moss `#38624C` on porcelain and white passes WCAG AA for text and UI.
- Visible focus states (`:focus-visible` outlines on landing buttons; `--mcp-focus-ring` in the
  design system).
- Keyboard navigable: all hero/nav/CTA interactions are links and buttons; skip link retained in
  the shell.
- Semantic landmarks: sections are labelled with `aria-labelledby`; decorative scene art and the
  vehicle cutout use empty `alt` and `aria-hidden`.
- Reduced-motion support as above.
- No text baked into imagery; scene photography and the film are purely decorative
  (`aria-hidden`, empty `alt`).

## Privacy-forward tone

Privacy messaging should feel like quiet confidence, not alarm: "No ads. No data selling.
Self-hostable. Export anytime." The managed cloud is framed as a convenience choice the owner
makes, never as the default that harvests data.

## Future enhancements (wishlist)

- **Seasonal hero**: the garage scene shifts with the seasons (light angle, foliage outside the
  door, small props). The layered structure (backdrop image → wash → copy) means a seasonal
  variant is just another image swap — the day/night pair in dark mode already proves the
  mechanism. Not scheduled.
- Higher-resolution highway footage: the current Coverr source is 720p; a 1080p+ clip (or a
  generated golden-hour loop matched to the palette) would sharpen the opener.
- Vehicle image library keyed by year/make/model/trim/body style (see `Agents.md`).
- Rename the `desert-graphite` token manifest to a warm-garage name once downstream consumers are
  ready.
