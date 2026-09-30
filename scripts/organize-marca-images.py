import hashlib
import json
import os
import re
import shutil
from collections import Counter
from pathlib import Path

root = Path(r"c:\Users\rezen\OneDrive\Desktop\RuralCommerce\public\images\marca")
drive = root / "drive"
flat = root / "library"
flat.mkdir(parents=True, exist_ok=True)


def detect_tone(path: str) -> str:
    p = path.lower()
    if "pastel" in p or "pastéis" in p or "pasteis" in p:
        return "pastel"
    if "vibrante" in p or "tropical" in p:
        return "vibrante"
    if "terroso" in p or "terrosa" in p:
        return "terroso"
    if "sóbr" in p or "sobr" in p or "refinado" in p or "refinad" in p:
        return "sobrio"
    return "outro"


def detect_section(name: str, path: str) -> str:
    n = (name + " " + path).lower()
    if "logo" in n or "branding" in n:
        return "logo"
    if "embalag" in n:
        return "packaging"
    if "tons" in path.lower():
        return "palette"
    # filename like pastel 1.jpg / sobrio 3.jpg
    if re.search(r"(pastel|s[oó]brio|terroso|vibrante)\s*\d+", n):
        return "palette"
    return "palette"


catalog = []
seen = set()
for dp, _, files in os.walk(drive):
    for f in files:
        if not f.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
            continue
        src = Path(dp) / f
        tone = detect_tone(str(src))
        section = detect_section(f, str(src))
        safe = re.sub(r"[^a-zA-Z0-9._-]+", "-", f).strip("-").lower()
        if not safe:
            continue
        dest_name = f"{tone}-{section}-{safe}"
        if len(dest_name) > 90:
            h = hashlib.md5(str(src).encode()).hexdigest()[:6]
            ext = Path(safe).suffix or ".jpg"
            dest_name = f"{tone}-{section}-{h}{ext}"
        if dest_name in seen:
            continue
        seen.add(dest_name)
        dest = flat / dest_name
        shutil.copy2(src, dest)
        catalog.append(
            {
                "id": f"img-{tone}-{section}-{len(catalog) + 1}",
                "src": f"/images/marca/library/{dest_name}",
                "alt": Path(f).stem,
                "tags": [tone, section],
                "tone": tone,
                "section": section,
                "active": True,
                "moodColor": {
                    "pastel": "#E8D5D0",
                    "sobrio": "#2F3336",
                    "terroso": "#8B6914",
                    "vibrante": "#E85D04",
                }.get(tone, "#071F5E"),
            }
        )

out_json = Path(r"c:\Users\rezen\OneDrive\Desktop\RuralCommerce\data\marca-catalog.seed.json")
out_json.write_text(json.dumps({"images": catalog}, ensure_ascii=False, indent=2), encoding="utf-8")
print("files", len(catalog))
print("by section", Counter(i["section"] for i in catalog))
print("by tone", Counter(i["tone"] for i in catalog))
