"""Headless build of the Nakameguro arrival shot.

Runs the locked blockout passes, applies motion, audits, renders the
storyboard frames, and saves the .blend. Usage:
    blender -b -P blender/build_headless.py               # build + stills
    blender -b -P blender/build_headless.py -- --animate  # + 1080x1920 mp4
    blender -b -P blender/build_headless.py -- --animate --range 1-195
    blender -b -P blender/build_headless.py -- --animate --samples 128
    blender -b -P blender/build_headless.py -- --no-render
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


def flag_value(argv, name, cast=int):
    """Read `--name V` or `--name=V` from argv; None when absent."""
    for i, a in enumerate(argv):
        if a == name and i + 1 < len(argv):
            return cast(argv[i + 1])
        if a.startswith(name + "="):
            return cast(a.split("=", 1)[1])
    return None


def parse_range(argv):
    """`--range 1-195` (or `--range=1-195`) -> (1, 195); None when absent."""
    raw = flag_value(argv, "--range", str)
    if raw is None:
        return None, None
    lo, _, hi = raw.partition("-")
    if not hi:
        raise ValueError("--range needs START-END, e.g. --range 1-195")
    return int(lo), int(hi)


def render_animation(engine, samples=64, start=None, end=None):
    """Full-resolution 9:16 movie over the given frame range."""
    os.makedirs(OUT, exist_ok=True)
    start = blk.F_START if start is None else start
    end = blk.F_END if end is None else end
    sc = bpy.context.scene
    sc.render.engine = engine
    sc.render.resolution_x, sc.render.resolution_y = blk.RES_X, blk.RES_Y
    sc.render.resolution_percentage = 100
    sc.frame_start, sc.frame_end = start, end
    sc.render.fps = blk.FPS

    sc.render.image_settings.file_format = 'FFMPEG'
    ff = sc.render.ffmpeg
    ff.format = 'MPEG4'
    ff.codec = 'H264'
    ff.constant_rate_factor = 'HIGH'
    ff.ffmpeg_preset = 'GOOD'
    ff.gopsize = blk.FPS

    if engine == 'CYCLES':
        sc.cycles.samples = samples
        sc.cycles.use_denoising = True
    else:
        try:
            sc.eevee.taa_render_samples = samples
        except AttributeError:
            pass

    # Blender appends its own "0001-0195" frame-range suffix to the stem,
    # so the stem must not repeat it.
    path = os.path.join(OUT, "nakameguro_shot_")
    sc.render.filepath = path
    bpy.ops.render.render(animation=True)
    sc.frame_set(blk.F_START)

    made = [p for p in (path + f"{start:04d}-{end:04d}.mp4", path + ".mp4")
            if os.path.exists(p)]
    return {"range": [start, end], "frames": end - start + 1,
            "resolution": [blk.RES_X, blk.RES_Y],
            "fps": blk.FPS, "seconds": round((end - start + 1) / blk.FPS, 2),
            "samples": samples, "files": made}


def main():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv
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

    if "--no-render" not in argv:
        try:
            report["storyboard"] = render_storyboard(engine)
        except Exception as exc:                       # noqa: BLE001
            report["storyboard"] = []
            report["render_error"] = f"{type(exc).__name__}: {exc}"

    if "--animate" in argv:
        start, end = parse_range(argv)
        samples = flag_value(argv, "--samples") or 64
        try:
            report["animation"] = render_animation(
                engine, samples=samples, start=start, end=end)
        except Exception as exc:                       # noqa: BLE001
            report["animation"] = {}
            report["animation_error"] = f"{type(exc).__name__}: {exc}"

    os.makedirs(OUT, exist_ok=True)
    blend = os.path.join(OUT, "nakameguro_shot.blend")
    bpy.ops.wm.save_as_mainfile(filepath=blend)
    report["blend"] = blend
    print("REPORT_JSON_START")
    print(json.dumps(report, indent=1))
    print("REPORT_JSON_END")


if __name__ == "__main__":
    main()
