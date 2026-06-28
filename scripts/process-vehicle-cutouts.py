#!/usr/bin/env python3
"""
Reprocess vehicle images with BiRefNet for clean, professional cutouts.
BiRefNet handles edges, glass, and complex backgrounds much better than u2net.
"""

import os
import sys
import json
import urllib.request
import urllib.parse
from pathlib import Path
from PIL import Image, ImageFilter
import numpy as np

VEHICLES = {
    "toyota-camry-2018-2024": {
        "full_url": "https://upload.wikimedia.org/wikipedia/commons/a/ad/Toyota_Camry_LE_2020.jpg",
        "attribution": "Lvity via Wikimedia Commons",
    },
    "toyota-corolla-2020-2024": {
        "full_url": "https://upload.wikimedia.org/wikipedia/commons/4/43/2020_Toyota_Corolla_LE_sedan.jpg",
        "attribution": "Ee2mba via Wikimedia Commons",
    },
    "toyota-rav4-2019-2024": {
        "full_url": "https://upload.wikimedia.org/wikipedia/commons/f/f8/Toyota_RAV4_2019_1600_01.jpg",
        "attribution": "だんでらいおん via Wikimedia Commons",
    },
    "honda-civic-2016-2021": {
        "full_url": "https://upload.wikimedia.org/wikipedia/commons/8/8e/2019_Honda_Civic_LX_Sedan.jpg",
        "attribution": "MercurySable99 via Wikimedia Commons",
    },
    "honda-accord-2018-2022": {
        "full_url": "https://upload.wikimedia.org/wikipedia/commons/f/f1/2018_Honda_Accord_12.17.17.jpg",
        "attribution": "Kevauto via Wikimedia Commons",
    },
    "honda-cr-v-2017-2022": {
        "full_url": "https://upload.wikimedia.org/wikipedia/commons/9/98/2020_Honda_CR-V_SR_I-VTEC_CVT.jpg",
        "attribution": "Calreyn88 via Wikimedia Commons",
    },
    "ford-f-150-2021-2024": {
        "full_url": "https://upload.wikimedia.org/wikipedia/commons/0/00/2021_Ford_F-150_SuperCrew%2C_rear_4.28.21.jpg",
        "attribution": "Kevauto via Wikimedia Commons",
    },
    "chevrolet-silverado-2019-2024": {
        "full_url": "https://upload.wikimedia.org/wikipedia/commons/2/25/2021_Chevrolet_Silverado_1500_ZZ1.jpg",
        "attribution": "DestinationFearFan via Wikimedia Commons",
    },
    "nissan-rogue-2021-2024": {
        "full_url": "https://upload.wikimedia.org/wikipedia/commons/c/c5/2021_Nissan_Rogue.jpg",
        "attribution": "Wagon Master Johnson via Wikimedia Commons",
    },
}

REPO_ROOT = Path(__file__).resolve().parent.parent
CATALOG_DIR = REPO_ROOT / "public" / "images" / "vehicle-defaults" / "catalog"
TMP_DIR = Path("/tmp/my-car-pal-birefnet")
TARGET_WIDTH = 1600
MODEL = "birefnet-general"


def download(url: str, dest: Path) -> bool:
    if dest.exists():
        return True
    req = urllib.request.Request(url, headers={"User-Agent": "MyCarPal/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            dest.write_bytes(resp.read())
        return True
    except Exception as e:
        print(f"  ✗ download failed: {e}")
        return False


def refine_edges(img: Image.Image, radius: float = 1.0) -> Image.Image:
    """Slightly blur the alpha channel for cleaner edges, then threshold."""
    r, g, b, a = img.split()
    # Gaussian blur the alpha
    a_blur = a.filter(ImageFilter.GaussianBlur(radius=radius))
    # Threshold to avoid semi-transparent fringes becoming too wide
    a_arr = np.array(a_blur)
    # Boost contrast on alpha: stretch values below 200 to be sharper
    a_arr = np.clip((a_arr.astype(float) - 128) * 1.5 + 128, 0, 255).astype(np.uint8)
    a_refined = Image.fromarray(a_arr, mode="L")
    return Image.merge("RGBA", (r, g, b, a_refined))


def darken_windows(img: Image.Image) -> Image.Image:
    """
    Apply a slight dark tint to window areas.
    Windows tend to have lower saturation + show-through. 
    We detect pixels where the original showed background (now semi-transparent after bg removal)
    and darken them slightly.
    """
    r, g, b, a = img.split()
    a_arr = np.array(a, dtype=float)
    r_arr = np.array(r, dtype=float)
    g_arr = np.array(g, dtype=float)
    b_arr = np.array(b, dtype=float)

    # Semi-transparent pixels: alpha between 20 and 200
    window_mask = (a_arr > 20) & (a_arr < 200)
    
    if window_mask.sum() == 0:
        return img  # no windows detected
    
    # Darken and desaturate window pixels
    darken = 0.7
    r_arr[window_mask] *= darken
    g_arr[window_mask] *= darken
    b_arr[window_mask] *= darken
    
    r_new = Image.fromarray(np.clip(r_arr, 0, 255).astype(np.uint8), mode="L")
    g_new = Image.fromarray(np.clip(g_arr, 0, 255).astype(np.uint8), mode="L")
    b_new = Image.fromarray(np.clip(b_arr, 0, 255).astype(np.uint8), mode="L")
    
    return Image.merge("RGBA", (r_new, g_new, b_new, a))


def main():
    CATALOG_DIR.mkdir(parents=True, exist_ok=True)
    TMP_DIR.mkdir(parents=True, exist_ok=True)

    print(f"Model: {MODEL}")
    
    # Load model once
    from rembg import remove, new_session
    print("Loading BiRefNet model (may download on first run)...")
    session = new_session(MODEL)
    print("Model ready.\n")

    results = {}
    for slug, info in VEHICLES.items():
        print(f"{'='*60}")
        print(f"  {slug}")
        
        # 1. Download full-res
        parsed = urllib.parse.urlparse(info["full_url"])
        fname = Path(urllib.parse.unquote(parsed.path)).name
        src_path = TMP_DIR / fname
        print(f"  downloading {fname}...")
        if not download(info["full_url"], src_path):
            results[slug] = {"status": "DOWNLOAD_FAILED"}
            continue
        print(f"    {src_path.stat().st_size} bytes")

        # 2. BiRefNet background removal
        print(f"  removing background (BiRefNet)...")
        with open(src_path, "rb") as f:
            input_bytes = f.read()
        output_bytes = remove(input_bytes, session=session)
        
        # 3. Open as PIL for post-processing
        img = Image.open(__import__('io').BytesIO(output_bytes))
        print(f"    native size: {img.size}")

        # 4. Edge refinement
        img = refine_edges(img, radius=0.8)

        # 5. Window darkening
        img = darken_windows(img)

        # 6. Resize to target width
        w, h = img.size
        if w > TARGET_WIDTH:
            new_h = int(h * TARGET_WIDTH / w)
            print(f"    resize: {w}x{h} → {TARGET_WIDTH}x{new_h}")
            img = img.resize((TARGET_WIDTH, new_h), Image.LANCZOS)

        # 7. Save final
        final_path = CATALOG_DIR / f"{slug}-cutout.png"
        img.save(final_path, "PNG", optimize=True)
        final_size = final_path.stat().st_size
        
        # 8. Verify
        a_arr = np.array(img.split()[-1])
        transp_pct = (a_arr < 255).sum() / a_arr.size * 100
        
        print(f"    ✓ saved: {final_path.name} ({final_size/1024:.0f}KB, {transp_pct:.1f}% transparent)")
        
        results[slug] = {
            "status": "OK",
            "dimensions": list(img.size),
            "size_bytes": final_size,
            "transparency_pct": round(transp_pct, 1),
        }

    # Summary
    print(f"\n{'='*60}")
    ok = sum(1 for r in results.values() if r["status"] == "OK")
    print(f"  Complete: {ok}/{len(VEHICLES)}")
    for slug, r in results.items():
        marker = "✓" if r["status"] == "OK" else "✗"
        extra = f" ({r['dimensions'][0]}x{r['dimensions'][1]}, {r['size_bytes']/1024:.0f}KB)" if r["status"] == "OK" else ""
        print(f"  {marker} {slug}: {r['status']}{extra}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
