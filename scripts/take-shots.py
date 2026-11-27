"""Take the entry's screenshots with the local chrome-headless-shell binary.

Reads the shot list from shots.json, renders each URL against the local
static server, and writes JPEGs into screenshots/ inside the gate limits
(long side at most 1280, short side at least 360, at most 256 KiB each).
Run after `node serve.ts --port 8080` is up:  python3 scripts/take-shots.py
"""
import json
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
CHROME = os.path.expanduser(
    "~/workspace/tools/pw-browsers/chromium_headless_shell-1255/"
    "chrome-headless-shell-linux64/chrome-headless-shell")
PORT = 8080
MAX_BYTES = 262144

from PIL import Image

with open(os.path.join(REPO, "shots.json")) as handle:
    shots = json.load(handle)

os.makedirs(os.path.join(REPO, "screenshots"), exist_ok=True)

for shot in shots:
    url = f"http://127.0.0.1:{PORT}/{shot['query']}"
    png = f"/tmp/dealsleuth-{shot['name']}.png"
    subprocess.run(
        [CHROME, "--headless", "--disable-gpu", "--no-sandbox",
         "--hide-scrollbars",
         f"--window-size={shot['w']},{shot['h']}",
         "--virtual-time-budget=12000",
         f"--screenshot={png}", url],
        check=True, capture_output=True)
    image = Image.open(png).convert("RGB")
    out = os.path.join(REPO, "screenshots", shot["name"])
    quality = 85
    image.save(out, "JPEG", quality=quality)
    while os.path.getsize(out) > MAX_BYTES and quality > 45:
        quality -= 5
        image.save(out, "JPEG", quality=quality)
    width, height = image.size
    print(f"{shot['name']}: {width}x{height} {os.path.getsize(out)} bytes (q={quality})")
    assert max(width, height) <= 1280, "long side over gate limit"
    assert min(width, height) >= 360, "short side under gate limit"
    assert os.path.getsize(out) <= MAX_BYTES, "file over 256 KiB"

print("all screenshots within gate limits")
