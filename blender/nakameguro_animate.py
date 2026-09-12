# Motion for the Nakameguro arrival shot.
# 24 fps, frames 1-288 (12 s). Beats: car arrives -> B leans -> A crosses
# -> both settle into the talk rest pose.

import bpy
import math
from mathutils import Vector

WHEEL_R = 0.34
WHEELS = ("fl", "fr", "rl", "rr")

# beat boundaries
F_CAR_IN, F_CAR_STOP = 1, 78
F_B_WALK, F_B_SET = 78, 132
F_A_WALK, F_A_ARRIVE = 132, 228
F_END = 240


def _fcurves(ob):
    """Blender 4.4+ moved F-curves into slotted actions; 'action.fcurves'
    only exists on legacy actions. Resolve both."""
    ad = ob.animation_data
    if not ad or not ad.action:
        return []
    act = ad.action
    if hasattr(act, "fcurves"):
        return list(act.fcurves)
    out = []
    for layer in act.layers:
        for strip in layer.strips:
            if strip.type != 'KEYFRAME':
                continue
            cb = strip.channelbag(ad.action_slot)
            if cb:
                out.extend(cb.fcurves)
    return out


def _key(ob, path, frame, value, index=-1, interp='BEZIER'):
    if index >= 0:
        getattr(ob, path)[index] = value
    else:
        setattr(ob, path, value)
    ob.keyframe_insert(data_path=path, frame=frame, index=index)
    for fc in _fcurves(ob):
        if fc.data_path != path or (index >= 0 and fc.array_index != index):
            continue
        for kp in fc.keyframe_points:
            if abs(kp.co.x - frame) < 0.5:
                kp.interpolation = interp


def _clear(ob):
    if ob and ob.animation_data:
        ob.animation_data_clear()


def animate_car():
    """Travel down the near lane, then angle into the kerb and stop.
    Constant speed first, ease-out into the stop - never a linear snap."""
    root = bpy.data.objects["HERO_car"]
    chassis = bpy.data.objects["HERO_car_chassis"]
    _clear(root)
    _clear(chassis)

    path = [
        (1,  (-26.0, -1.60, 0.0), 0.00,  'LINEAR'),
        (52, (-8.00, -1.55, 0.0), 0.00,  'LINEAR'),
        (68, (-2.20, -1.44, 0.0), -0.16, 'BEZIER'),
        (78, (0.000, -1.40, 0.0), -0.30, 'BEZIER'),
    ]
    for f, loc, rz, interp in path:
        _key(root, "location", f, Vector(loc), interp=interp)
        _key(root, "rotation_euler", f, rz, index=2, interp=interp)
    # hold the stop so nothing drifts after the settle
    _key(root, "location", F_END, Vector(path[-1][1]), interp='CONSTANT')
    _key(root, "rotation_euler", F_END, path[-1][2], index=2, interp='CONSTANT')

    # suspension: nose dips on braking, rebounds, settles
    for f, pitch in ((68, 0.0), (78, 0.024), (90, -0.009), (104, 0.0)):
        _key(chassis, "rotation_euler", f, pitch, index=1)
    return {"car_keys": len(path)}


def animate_wheels():
    """Roll is arithmetic, not eyeballed: d(theta) = d(distance) / radius,
    sampled off the evaluated root so it matches the eased path exactly."""
    dg = bpy.context.evaluated_depsgraph_get()
    root = bpy.data.objects["HERO_car"]
    scene = bpy.context.scene

    samples, prev, cum = [], None, 0.0
    for f in range(1, F_CAR_STOP + 13):
        scene.frame_set(f)
        dg.update()
        p = root.evaluated_get(dg).matrix_world.translation.copy()
        if prev is not None:
            cum += (p - prev).length
        prev = p
        samples.append((f, cum))

    residual = 0.0
    for nm in WHEELS:
        w = bpy.data.objects["HERO_car_wheel_" + nm]
        _clear(w)
        for f, dist in samples:
            spin = -dist / WHEEL_R          # forward travel -> forward roll
            _key(w, "rotation_euler", f, spin, index=1, interp='LINEAR')
        _key(w, "rotation_euler", F_END, -samples[-1][1] / WHEEL_R,
             index=1, interp='CONSTANT')
        residual = abs(samples[-1][1] - cum)

    scene.frame_set(1)
    return {"travel_m": round(cum, 4), "turns": round(cum / (2 * math.pi * WHEEL_R), 2),
            "residual_m": round(residual, 6)}


def _walk(ob, beats, stride=12, bob=0.03, foot_z=0.0):
    """Key a ground-planted walk: xy path + a small vertical bob.
    Facing follows the travel direction, so nobody moonwalks."""
    _clear(ob)
    for i, (f, pos) in enumerate(beats):
        _key(ob, "location", f, Vector((pos[0], pos[1], foot_z + ob.dimensions.z / 2)))
        if i + 1 < len(beats):
            nxt = beats[i + 1][1]
            d = Vector((nxt[0] - pos[0], nxt[1] - pos[1], 0))
            if d.length > 1e-4:
                _key(ob, "rotation_euler", f, math.atan2(d.y, d.x) - math.pi / 2, index=2)
        else:
            _key(ob, "rotation_euler", f, ob.rotation_euler.z, index=2)

    f0, f1 = beats[0][0], beats[-1][0]
    base_z = foot_z + ob.dimensions.z / 2
    for f in range(f0, f1 + 1, max(1, stride // 2)):
        t = (f - f0) / max(1, (f1 - f0))
        if t <= 0 or t >= 1:
            continue
        z = base_z + bob * abs(math.sin(math.pi * (f - f0) / stride))
        _key(ob, "location", f, z, index=2)


def animate_cast():
    """B steps off the kerb and leans on the driver's door (near side -
    Japan is right-hand drive, so the door faces camera). A crosses from
    the sakura/Roastery side in the background to the foreground, then
    does a 1.5-spin at the car head before stepping beside B."""
    b = bpy.data.objects["HERO_charB"]
    a = bpy.data.objects["HERO_charA"]

    _walk(b, [(F_B_WALK, (-3.60, -4.05)), (F_B_SET, (-1.25, -1.95))],
          stride=14, bob=0.025)
    # settle into the lean: weight shifts, slight tilt toward the car
    _key(b, "rotation_euler", F_B_SET, 0.0, index=0)
    _key(b, "rotation_euler", F_B_SET + 18, 0.105, index=0)
    _key(b, "rotation_euler", F_END, 0.105, index=0, interp='CONSTANT')

    # CharA walks to frame 195, then begins the spin sequence
    _walk(a, [(F_A_WALK, (8.50, 3.60)),
              (F_A_WALK + 46, (4.20, 0.60)),
              (195, (3.00, -0.50))], stride=12, bob=0.035)
    
    # Phase 1 (196-210): Approach car head, start spin
    _key(a, "location", 196, (3.00, -0.50, 0.0))
    _key(a, "location", 210, (0.50, -1.80, 0.0))
    _key(a, "rotation_euler", 196, 0.0, index=2)
    
    # Phase 2 (210-235): 1.5-spin (540°) at car head
    _key(a, "location", 235, (0.50, -1.80, 0.0), interp='CONSTANT')
    _key(a, "rotation_euler", 210, 0.0, index=2)
    _key(a, "rotation_euler", 235, math.radians(540), index=2)
    
    # Phase 3 (235-240): Dash beside B
    _key(a, "location", 240, (-1.30, -1.95, 0.0))
    _key(a, "rotation_euler", 240, math.radians(255), index=2, interp='CONSTANT')
    
    return {"charA_beats": 3, "charB_beats": 2}


def animate_camera():
    """One slow push-in. TRACK_TO holds the talk point, so the car enters
    frame on its own rather than the camera chasing it."""
    cam = bpy.data.objects["CAM_main"]
    _clear(cam)
    for f, loc in ((1, (4.20, -14.00, 2.25)),
                   (F_END, (3.55, -12.35, 2.12))):
        _key(cam, "location", f, Vector(loc))
    return {"push_m": 1.30}


def run_all():
    out = {}
    out.update(animate_car())
    out.update(animate_wheels())
    out.update(animate_cast())
    out.update(animate_camera())
    return out
