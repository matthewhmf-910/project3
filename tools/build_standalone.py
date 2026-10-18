"""Bundle the page into one self-contained HTML file (no server, works offline).

Inlines CSS, GSAP, the manifest, the page scripts and every asset as a data
URI. Each asset is embedded once in window.ASSET_DATA; <img> tags pick it up
via data-asset. Only the Google Fonts stylesheet stays external (system
serif/sans fall back when offline).

Usage: python3 tools/build_standalone.py [out.html]
"""

import base64
import io
import os
import re
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "dist", "xiaoye-coffee-standalone.html")


def read(rel):
    with open(os.path.join(ROOT, rel), encoding="utf-8") as fh:
        return fh.read()


def data_uri(file):
    path = os.path.join(ROOT, "assets", file)
    if file == "1000355615.png":
        # opaque photo: JPEG is ~5x smaller than the PNG and visually identical here
        buf = io.BytesIO()
        Image.open(path).convert("RGB").save(buf, "JPEG", quality=86, optimize=True, progressive=True)
        return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()
    with open(path, "rb") as fh:
        return "data:image/png;base64," + base64.b64encode(fh.read()).decode()


def script(src):
    # keep "</script>" sequences inside inlined code from closing the tag
    return "<script>\n" + read(src).replace("</script", "<\\/script") + "\n</script>"


html = read("index.html")
css = read("css/styles.css").replace('url("../assets/11_BACKGROUND_IVORY.png")', 'url("%s")' % data_uri("11_BACKGROUND_IVORY.png"))

# every asset referenced by markup or scripts, embedded once
used = sorted(set(re.findall(r"\d{2,}_[A-Z_]+\.png|1000355615\.png", read("js/hero.js") + read("js/reel.js") + html)))
used = [f for f in used if f != "11_BACKGROUND_IVORY.png" and os.path.exists(os.path.join(ROOT, "assets", f))]
asset_js = "window.ASSET_DATA = {\n" + ",\n".join('"%s": "%s"' % (f, data_uri(f)) for f in used) + "\n};\n" + \
    "document.addEventListener('DOMContentLoaded', function () {\n" \
    "  document.querySelectorAll('img[data-asset]').forEach(function (im) { im.src = window.ASSET_DATA[im.dataset.asset]; });\n" \
    "});"

html = html.replace('<link rel="stylesheet" href="css/styles.css">', "<style>\n" + css + "\n</style>")
html = re.sub(r'\s*<link rel="preload" as="image" href="assets/[^"]+">', "", html)
html = re.sub(r'\s*<noscript>.*?</noscript>', "", html, flags=re.S)
html = re.sub(r'(<img\b[^>]*?)src="assets/([^"]+)"', r'\1data-asset="\2"', html)
html = html.replace(' loading="lazy"', "")  # data URIs gain nothing from lazy loading

for src in ["vendor/gsap.min.js", "vendor/ScrollTrigger.min.js", "assets/manifest.js",
            "js/stage.js", "js/hero.js", "js/reel-scene.js", "js/reel.js", "js/window.js"]:
    tag = '<script src="%s"></script>' % src
    assert tag in html, tag
    html = html.replace(tag, script(src))
html = html.replace("<script>\n" + read("vendor/gsap.min.js").replace("</script", "<\\/script"),
                    "<script>\n" + asset_js + "\n</script>\n  <script>\n" + read("vendor/gsap.min.js").replace("</script", "<\\/script"), 1)

os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, "w", encoding="utf-8") as fh:
    fh.write(html)
print(f"wrote {OUT} ({os.path.getsize(OUT) / 1e6:.1f} MB, {len(used)} embedded assets: {', '.join(used)})")
