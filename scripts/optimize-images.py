#!/usr/bin/env python3
"""Generate web-sized WebP plates from the original photographs.

Originals in assets/photos/ are never modified. Output goes to
assets/photos/plates/ and is committed, so GitHub Pages serves the small
files and the repo keeps the full-resolution source.

    python scripts/optimize-images.py

Requires Pillow (pip install pillow).
"""

from __future__ import annotations

import json
import re
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "photos"
OUT = SRC / "plates"
MAX_EDGE = 1600
QUALITY = 82


def slug(name: str) -> str:
    stem = Path(name).stem
    stem = stem.replace("(", "").replace(")", "")
    stem = re.sub(r"[^A-Za-z0-9]+", "-", stem).strip("-")
    return f"{stem}.webp"


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    mapping: dict[str, str] = {}
    before = after = 0

    for path in sorted(SRC.glob("*.jpg")):
        if path.name == "bg.jpg":
            continue
        target = OUT / slug(path.name)
        with Image.open(path) as im:
            im = ImageOps.exif_transpose(im).convert("RGB")
            im.thumbnail((MAX_EDGE, MAX_EDGE), Image.LANCZOS)
            im.save(target, "WEBP", quality=QUALITY, method=6)
        before += path.stat().st_size
        after += target.stat().st_size
        mapping[path.name] = f"assets/photos/plates/{target.name}"
        print(f"{path.name:45} -> {target.name:45} {target.stat().st_size // 1024:5} KB")

    # Social card, built from the wide background photograph.
    bg = SRC / "bg.jpg"
    if bg.exists():
        with Image.open(bg) as im:
            im = ImageOps.exif_transpose(im).convert("RGB")
            w, h = im.size
            want = 1200 / 630
            if w / h > want:
                new_w = int(h * want)
                im = im.crop(((w - new_w) // 2, 0, (w + new_w) // 2, h))
            else:
                new_h = int(w / want)
                im = im.crop((0, (h - new_h) // 2, w, (h + new_h) // 2))
            im = im.resize((1200, 630), Image.LANCZOS)
            im.save(ROOT / "assets" / "og.jpg", "JPEG", quality=86, optimize=True)

    print(f"\n{before / 1048576:.2f} MB -> {after / 1048576:.2f} MB "
          f"({100 - after * 100 / before:.0f}% smaller)")
    print("\nMapping for js/main.js:")
    print(json.dumps(mapping, indent=2))


if __name__ == "__main__":
    main()
