#!/usr/bin/env python3
"""Apply dark window tint to vehicle cutouts — replaces background show-through with uniform tinted glass."""
import sys
from pathlib import Path
from PIL import Image, ImageFilter
import numpy as np

CATALOG = Path(__file__).resolve().parent.parent / "public" / "images" / "vehicle-defaults" / "catalog"
TINT_COLOR = np.array([18, 20, 28], dtype=float)  # dark blue-gray
TINT_STRENGTH = 0.85  # blend: 85% tint, 15% original reflection
ALPHA_THRESHOLD_LOW = 5
ALPHA_THRESHOLD_HIGH = 245
EDGE_FEATHER = 3  # px to feather the tint mask edges

def tint_windows(img: Image.Image) -> Image.Image:
    """Detect semi-transparent regions (windows) and apply dark tint."""
    r, g, b, a = img.split()
    a_arr = np.array(a, dtype=float)

    # Semi-transparent = window/glass regions
    window_mask = (a_arr > ALPHA_THRESHOLD_LOW) & (a_arr < ALPHA_THRESHOLD_HIGH)
    if window_mask.sum() < 100:
        return img  # nothing to tint

    # Feather the mask slightly to avoid hard edges
    mask_img = Image.fromarray((window_mask * 255).astype(np.uint8), mode="L")
    mask_img = mask_img.filter(ImageFilter.GaussianBlur(radius=EDGE_FEATHER))
    mask_arr = np.array(mask_img, dtype=float) / 255.0

    r_arr = np.array(r, dtype=float)
    g_arr = np.array(g, dtype=float)
    b_arr = np.array(b, dtype=float)

    # Blend: tint_color * strength + original * (1-strength), modulated by mask
    for ch, orig in [(r_arr, TINT_COLOR[0]), (g_arr, TINT_COLOR[1]), (b_arr, TINT_COLOR[2])]:
        tinted = orig * TINT_STRENGTH + ch * (1 - TINT_STRENGTH)
        ch[:] = ch * (1 - mask_arr) + tinted * mask_arr

    r_out = Image.fromarray(np.clip(r_arr, 0, 255).astype(np.uint8), mode="L")
    g_out = Image.fromarray(np.clip(g_arr, 0, 255).astype(np.uint8), mode="L")
    b_out = Image.fromarray(np.clip(b_arr, 0, 255).astype(np.uint8), mode="L")

    return Image.merge("RGBA", (r_out, g_out, b_out, a))


def main():
    cutouts = sorted(CATALOG.glob("*-cutout.png"))
    if not cutouts:
        print("No cutout files found")
        return 1

    for path in cutouts:
        print(f"{path.name}...")
        img = Image.open(path)

        # Save before copy for comparison
        before = CATALOG / f"_before_{path.name}"
        img.save(before, "PNG")

        # Apply tint
        tinted = tint_windows(img)
        tinted.save(path, "PNG", optimize=True)

        # Stats
        a_arr = np.array(tinted.split()[-1])
        transparent = (a_arr < 255).sum() / a_arr.size * 100
        size_kb = path.stat().st_size / 1024
        print(f"  → {size_kb:.0f}KB, {transparent:.1f}% transparent")

        # Remove before copy
        before.unlink()

    print(f"\nDone — {len(cutouts)} vehicles tinted")
    return 0


if __name__ == "__main__":
    sys.exit(main())
