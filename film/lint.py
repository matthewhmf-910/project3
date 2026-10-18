"""Static check for GSAP fromTo() calls whose start values contain a property the
end values do not: GSAP ignores those, so e.g. autoAlpha:1 in the start values never
shows the element (this hid the splash for four critic rounds).

    python3 film/lint.py js/reel-scene.js
"""
import re
import sys

bad = 0
for path in sys.argv[1:]:
    s = open(path).read()
    for m in re.finditer(r"fromTo\(([\w.\[\], ]+?),\s*\{([^}]*)\},\s*\{([^}]*)\}", s):
        keys_f = set(re.findall(r"(\w+):", m.group(2)))
        keys_t = set(re.findall(r"(\w+):", m.group(3)))
        missing = keys_f - keys_t - {"immediateRender"}
        if missing:
            bad += 1
            print(f"{path}:{s[:m.start()].count(chr(10)) + 1}: fromTo({m.group(1)}) start-only {sorted(missing)}")
print("LINT:", "PASS" if not bad else f"FAIL ({bad})")
sys.exit(1 if bad else 0)
