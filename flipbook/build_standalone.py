"""Bundle index.html + flipbook.js + page textures into one self-contained HTML file.

usage: python3 build_standalone.py <texture_dir> <out.html>
texture_dir holds S0_lower, S{1..9}_upper, S{1..9}_lower (.jpg or .png) and an optional logo.png.
A logo.png marks reference crops, which already contain the hinge shading.
"""
import base64, io, json, pathlib, sys

from PIL import Image

here = pathlib.Path(__file__).parent
tex, out = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])


def uri(name):
    """Inline a texture as a JPEG data URI (pages are opaque, JPEG keeps the bundle small).
    PNG inputs are re-encoded; JPEG inputs are embedded as-is."""
    p = next((tex / f'{name}{e}' for e in ('.jpg', '.png') if (tex / f'{name}{e}').exists()), None)
    if p is None:
        return None
    if p.suffix == '.jpg':
        return 'data:image/jpeg;base64,' + base64.b64encode(p.read_bytes()).decode()
    buf = io.BytesIO()
    Image.open(p).convert('RGB').save(buf, 'JPEG', quality=88)
    return 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode()


textures = {
    'logo': uri('logo'),
    'hingeShade': not (tex / 'logo.png').exists(),
    'spreads': [{'upper': None if s == 0 else uri(f'S{s}_upper'), 'lower': uri(f'S{s}_lower')} for s in range(10)],
}
html = (here / 'index.html').read_text()
engine = (here / 'flipbook.js').read_text()
html = html.replace('<script src="flipbook.js"></script>',
                    f'<script>window.FB_TEXTURES = {json.dumps(textures)};</script>\n<script>\n{engine}\n</script>')
out.write_text(html)
print(f'{out} {out.stat().st_size / 1e6:.2f} MB')
