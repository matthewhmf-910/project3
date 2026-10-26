"""Bundle index.html + flipbook.js + page textures into one self-contained HTML file.

usage: python3 build_standalone.py <texture_dir> <out.html>
texture_dir holds S0_lower.png, S{1..9}_upper.png, S{1..9}_lower.png and an optional logo.png.
A logo.png marks reference crops, which already contain the hinge shading.
"""
import base64, io, json, pathlib, sys

from PIL import Image

here = pathlib.Path(__file__).parent
tex, out = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])


def uri(name):
    """Inline a texture as a JPEG data URI (pages are opaque, JPEG keeps the bundle small)."""
    p = tex / name
    if not p.exists():
        return None
    buf = io.BytesIO()
    Image.open(p).convert('RGB').save(buf, 'JPEG', quality=88)
    return 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode()


textures = {
    'logo': uri('logo.png'),
    'hingeShade': not (tex / 'logo.png').exists(),
    'spreads': [{'upper': None if s == 0 else uri(f'S{s}_upper.png'), 'lower': uri(f'S{s}_lower.png')} for s in range(10)],
}
html = (here / 'index.html').read_text()
engine = (here / 'flipbook.js').read_text()
html = html.replace('<script src="flipbook.js"></script>',
                    f'<script>window.FB_TEXTURES = {json.dumps(textures)};</script>\n<script>\n{engine}\n</script>')
out.write_text(html)
print(f'{out} {out.stat().st_size / 1e6:.2f} MB')
