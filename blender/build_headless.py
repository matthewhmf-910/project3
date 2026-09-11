"""Headless build of the Nakameguro arrival shot.

Runs the locked blockout passes, applies motion, audits, renders the
storyboard frames, and saves the .blend. Usage:
    python3 blender/build_headless.py            # full build + render
    python3 blender/build_headless.py --no-render
"""
import json
import os
import sys
import math

import bpy

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import nakameguro_blockout as blk
import nakameguro_animate as anim

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "out")
STORYBOARD = [1, 78, 132, 180, 228, 288]
PREVIEW = (540, 960)


def wipe():
    """Start from a genuinely empty file - the default cube/camera/light
    would otherwise survive into the deliverable."""
    bpy.ops.wm.read_factory_settings(use_empty=True)


def pick_engine():
    engines = [i.identifier for i in
               bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items]
    for want in ("BLENDER_EEVEE", "BLENDER_EEVEE_NEXT", "CYCLES"):
        if want in engines:
            return want, engines
    return engines[0], engines


def audit_structural():
    names = sorted(o.name for o in bpy.data.objects)
    hero = {}
    for n in ("HERO_car", "HERO_car_body", "HERO_charA", "HERO_charB", "CAM_main"):
        o = bpy.data.objects.get(n)
        if o:
            hero[n] = {"loc": [round(v, 3) for v in o.location],
                       "dim": [round(v, 3) for v in o.dimensions]}
    # contact: nothing planted should float or sink
    contact = {}
    for n in ("HERO_charA", "HERO_charB"):
        o = bpy.data.objects[n]
        contact[n] = round(o.location.z - o.dimensions.z / 2, 4)
    for nm in anim.WHEELS:
        w = bpy.data.objects["HERO_car_wheel_" + nm]
        contact["wheel_" + nm] = round(w.location.z - blk.WHEEL_R, 4)
    return {"object_count": len(names), "objects": names,
            "hero": hero, "ground_gap_m": contact}


def audit_motion():
    """Evaluated transforms must actually move, and must hold at rest."""
    dg = bpy.context.evaluated_depsgraph_get()
    sc = bpy.context.scene
    watch = ["HERO_car", "HERO_charA", "HERO_charB", "CAM_main",
             "HERO_car_wheel_fl"]
    track = {n: [] for n in watch}
    for f in (1, 40, 78, 132, 180, 228, 288):
        sc.frame_set(f)
        dg.update()
        for n in watch:
            m = bpy.data.objects[n].evaluated_get(dg).matrix_world
            track[n].append((f, [round(v, 3) for v in m.translation],
                             round(m.to_euler().y, 3)))
    verdict = {}
    for n, rows in track.items():
        span = max((abs(rows[i][1][k] - rows[0][1][k])
                    for i in range(len(rows)) for k in range(3)), default=0)
        spin = max(abs(r[2] - rows[0][2]) for r in rows)
        verdict[n] = {"max_translation_m": round(span, 3),
                      "max_pitch_rad": round(spin, 3),
                      "moves": span > 0.01 or spin > 0.01}
    sc.frame_set(1)
    return {"samples": track, "verdict": verdict}


def render_storyboard(engine):
    os.makedirs(OUT, exist_ok=True)
    sc = bpy.context.scene
    sc.render.engine = engine
    sc.render.resolution_x, sc.render.resolution_y = PREVIEW
    sc.render.resolution_percentage = 100
    sc.render.image_settings.file_format = 'PNG'
    if engine == 'CYCLES':
        sc.cycles.samples = 24
        sc.cycles.use_denoising = True
        sc.cycles.device = 'CPU'
    else:
        try:
            sc.eevee.taa_render_samples = 32
        except AttributeError:
            pass

    made = []
    for f in STORYBOARD:
        sc.frame_set(f)
        path = os.path.join(OUT, f"storyboard_f{f:03d}.png")
        sc.render.filepath = path
        bpy.ops.render.render(write_still=True)
        if os.path.exists(path):
            made.append(path)
    sc.frame_set(1)
    sc.render.resolution_x, sc.render.resolution_y = blk.RES_X, blk.RES_Y
    return made


def main():
    report = {}
    wipe()
    report["bounds"] = blk.pass_bounds()
    report["primary"] = blk.pass_primary()
    report["secondary"] = blk.pass_secondary()
    report["camera_light"] = blk.pass_camera_light()
    report["motion"] = anim.run_all()
    report["audit_structural"] = audit_structural()
    report["audit_motion"] = audit_motion()

    engine, available = pick_engine()
    report["engines_available"] = available
    report["engine_used"] = engine

    if "--no-render" not in sys.argv:
        try:
            report["storyboard"] = render_storyboard(engine)
        except Exception as exc:                       # noqa: BLE001
            report["storyboard"] = []
            report["render_error"] = f"{type(exc).__name__}: {exc}"

    os.makedirs(OUT, exist_ok=True)
    blend = os.path.join(OUT, "nakameguro_shot.blend")
    bpy.ops.wm.save_as_mainfile(filepath=blend)
    report["blend"] = blend
    print("REPORT_JSON_START")
    print(json.dumps(report, indent=1))
    print("REPORT_JSON_END")


if __name__ == "__main__":
    main()
