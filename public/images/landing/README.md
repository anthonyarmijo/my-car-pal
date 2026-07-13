# Landing image attribution

`highway-poster.jpg`, `../../videos/highway-loop.webm`, and `../../videos/highway-loop.mp4`

- Source: https://coverr.co/videos/misty-mountain-road-journey
- License: Coverr license (free for commercial use, no attribution required).
- Notes: Full-viewport, 23.48-second, 1920×1080 highway film that opens the
  landing page. The MP4 is the broadly compatible H.264 CRF22 fallback with
  fast-start metadata (8,624,560 bytes). The preferred VP9/WebM source was
  encoded at CRF24 (6,209,996 bytes, about 28% smaller) and measured SSIM
  0.9899 against the MP4; sampled frames were also checked side by side for
  blocking, banding, color shifts, motion artifacts, and softness. The
  107,618-byte poster is shown while loading and is used instead of autoplay
  for `prefers-reduced-motion` and Save-Data visitors. The source color is
  preserved with a restrained saturation/contrast lift and a faint green-biased
  canopy overlay; dark mode applies a subtler version at a lower exposure.

`garage-hero-scene-900.jpg`

- Source: resized variant of `garage-hero-scene.jpg` (below) for small screens.

`garage-hero-scene.jpg`

- Source: AI-generated image (ChatGPT/DALL·E) created by the project owner for
  My Car Pal; owner holds usage rights per OpenAI terms.
- Notes: Photorealistic sunlit garage backdrop with an open door, greenery,
  and shelving. The landing page composites vehicle imagery separately from
  the scene so model-specific assets can be reused.

`garage-hero-scene-night-neutral.png` and `garage-hero-scene-night.png`

- Source: AI-generated images (ChatGPT/DALL·E) created by the project owner for
  My Car Pal; owner holds usage rights per OpenAI terms.
- Notes: Nighttime variants of the garage scene for dark mode. The current
  landing uses `-night-neutral`; `-night` is an alternate source asset. Like
  the daylight scene, neither contains a vehicle.

`hero-placeholder.svg`

- Source: Original My Car Pal placeholder illustration.
- Notes: Legacy asset from the pre-redesign landing; not used by the current
  landing page.

`camry-preview.svg`

- Source: Original My Car Pal product preview illustration.
- Notes: Legacy asset from the pre-redesign landing; not used by the current
  landing page.

`toyota-camry-le-2020.jpg`

- Source: https://commons.wikimedia.org/wiki/File:Toyota_Camry_LE_2020.jpg
- Author: Lvity
- License: Creative Commons Attribution-Share Alike 4.0 International
- License URL: https://creativecommons.org/licenses/by-sa/4.0/
- Notes: Legacy development placeholder from the pre-redesign landing; still
  referenced by the default vehicle image catalog data, not by the landing page.

`vehicle-cutout-tacoma.png`

- Source: My Car Pal local development placeholder.
- Notes: Temporary Tacoma cutout used by landing previews and the starter default vehicle image catalog until licensed model-specific assets are added.

`vehicle-cutout-subaru-outback-wilderness.png` and `vehicle-cutout-subaru-outback-wilderness.webp`

- Source: https://commons.wikimedia.org/wiki/File:2023_Subaru_Outback_Wilderness_in_Autumn_Green_Metallic,_Front_Left,_04-29-2023.jpg
- Author: Elise240SX
- License: Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
- License URL: https://creativecommons.org/licenses/by-sa/4.0/
- Changes: The background was removed to produce a transparent dashboard cutout; the vehicle is shown as a front-left three-quarter view.
- Notes: The PNG is the transparent master; the WebP is the optimized asset used only in the public landing-page dashboard preview. Any redistribution of either modified asset must preserve this attribution and the CC BY-SA 4.0 license.

`../vehicle-defaults/generic-car.svg`

- Source: Original My Car Pal placeholder illustration.
- Notes: Generic car/truck fallback for vehicles without an uploaded or catalog-matched image.

`../vehicle-defaults/generic-motorcycle.svg`

- Source: Original My Car Pal placeholder illustration.
- Notes: Generic motorcycle/scooter fallback for vehicles without an uploaded or catalog-matched image.
