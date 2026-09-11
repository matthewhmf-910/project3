# Nakameguro sakura street — 9:16 blockout
# Z-up, metres, radians. All-blockout: no generation, no credits.
# Sent through bl_execute in locked passes; each pass is idempotent.

import bpy, math
from mathutils import Vector

SCENE_NAME = "HF_Nakameguro"
CAR_ROT_Z = -0.30          # pull-in angle toward near curb
CAR_LOC = (0.0, -1.40, 0.0)
FPS, F_START, F_END = 24, 1, 288


# ---------------------------------------------------------------- helpers

def get_coll(name, parent=None):
    c = bpy.data.collections.get(name)
    if c is None:
        c = bpy.data.collections.new(name)
        (parent or bpy.context.scene.collection).children.link(c)
    return c


def box(name, coll, dims, loc, rot_z=0.0, mat=None):
    """Idempotent axis-aligned box placed by its base centre."""
    ob = bpy.data.objects.get(name)
    if ob is None:
        me = bpy.data.meshes.new(name)
        ob = bpy.data.objects.new(name, me)
        coll.objects.link(ob)
        import bmesh
        bm = bmesh.new()
        bmesh.ops.create_cube(bm, size=1.0)
        bm.to_mesh(me)
        bm.free()
    ob.dimensions = dims
    ob.location = (loc[0], loc[1], loc[2] + dims[2] / 2.0)
    ob.rotation_euler = (0.0, 0.0, rot_z)
    if mat:
        ob.data.materials.clear()
        ob.data.materials.append(mat)
    return ob


def cyl(name, coll, radius, depth, loc, mat=None):
    ob = bpy.data.objects.get(name)
    if ob is None:
        me = bpy.data.meshes.new(name)
        ob = bpy.data.objects.new(name, me)
        coll.objects.link(ob)
        import bmesh
        bm = bmesh.new()
        bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=16,
                              radius1=1.0, radius2=1.0, depth=1.0)
        bm.to_mesh(me)
        bm.free()
    ob.dimensions = (radius * 2, radius * 2, depth)
    ob.location = (loc[0], loc[1], loc[2] + depth / 2.0)
    if mat:
        ob.data.materials.clear()
        ob.data.materials.append(mat)
    return ob


def mat(name, rgba, rough=0.6):
    m = bpy.data.materials.get(name)
    if m is None:
        m = bpy.data.materials.new(name)
        m.use_nodes = True
    b = m.node_tree.nodes.get("Principled BSDF")
    if b:
        b.inputs["Base Color"].default_value = rgba
        b.inputs["Roughness"].default_value = rough
    return m


# --------------------------------------------------- PASS 1: bounds/road

def pass_bounds():
    sc = bpy.context.scene
    sc.render.resolution_x, sc.render.resolution_y = 1080, 1920
    sc.render.fps = FPS
    sc.frame_start, sc.frame_end = F_START, F_END

    env = get_coll("ENV")
    m_asphalt = mat("M_asphalt", (0.045, 0.045, 0.050, 1), 0.72)
    m_walk = mat("M_sidewalk", (0.34, 0.33, 0.31, 1), 0.85)
    m_water = mat("M_river", (0.06, 0.10, 0.12, 1), 0.18)

    box("ENV_road", env, (46, 6.5, 0.12), (0, 0, -0.12), mat=m_asphalt)
    box("ENV_sidewalk_near", env, (46, 2.4, 0.26), (0, -4.45, -0.26), mat=m_walk)
    box("ENV_sidewalk_far", env, (46, 2.6, 0.26), (0, 4.55, -0.26), mat=m_walk)
    box("ENV_river_rail", env, (46, 0.14, 1.05), (0, 5.75, 0.0), mat=m_walk)
    box("ENV_river", env, (46, 9.0, 0.05), (0, 10.4, -0.95), mat=m_water)
    return {"pass": "bounds", "res": [1080, 1920], "frames": [F_START, F_END]}


# ------------------------------------------- PASS 2: primary masses (car)

def pass_primary():
    """Car as separated semantic parts — body/cabin/wheels stay independent
    so the suspension dip and wheel spin can be keyed later."""
    hero = get_coll("HERO")
    m_car = mat("M_car_paint", (0.015, 0.02, 0.035, 1), 0.18)
    m_glass = mat("M_car_glass", (0.02, 0.03, 0.04, 1), 0.05)
    m_tyre = mat("M_tyre", (0.012, 0.012, 0.012, 1), 0.90)

    root = bpy.data.objects.get("HERO_car")
    if root is None:
        root = bpy.data.objects.new("HERO_car", None)
        hero.objects.link(root)
    root.location = CAR_LOC
    root.rotation_euler = (0, 0, CAR_ROT_Z)

    # local-space parts, parented to the empty
    parts = [
        ("HERO_car_body",   (4.55, 1.95, 0.62), (0.00, 0, 0.30), m_car),
        ("HERO_car_cabin",  (2.05, 1.72, 0.46), (-0.28, 0, 0.86), m_glass),
        ("HERO_car_nose",   (0.95, 1.86, 0.34), (2.05, 0, 0.26), m_car),
        ("HERO_car_diff",   (0.80, 1.90, 0.40), (-2.00, 0, 0.34), m_car),
    ]
    for name, dims, loc, mm in parts:
        ob = box(name, hero, dims, loc, mat=mm)
        ob.parent = root
        ob.matrix_parent_inverse.identity()   # inherit the car's rotation

    for nm, x, y in (("fl", 1.42, 0.86), ("fr", 1.42, -0.86),
                     ("rl", -1.40, 0.90), ("rr", -1.40, -0.90)):
        w = cyl("HERO_car_wheel_" + nm, hero, 0.34, 0.26, (x, y, -0.34), mat=m_tyre)
        w.rotation_euler = (math.pi / 2, 0, 0)
        w.parent = root
        w.matrix_parent_inverse.identity()

    return {"pass": "primary_masses", "root": root.name,
            "children": [c.name for c in root.children]}


# ----------------------------------- PASS 3: secondary masses (env + cast)

def pass_secondary():
    env, hero = get_coll("ENV"), get_coll("HERO")
    m_bark = mat("M_bark", (0.09, 0.07, 0.065, 1), 0.88)
    m_blossom = mat("M_blossom", (0.86, 0.63, 0.70, 1), 0.80)
    m_bldg = mat("M_building", (0.16, 0.15, 0.14, 1), 0.70)
    m_a = mat("M_charA", (0.55, 0.22, 0.20, 1), 0.75)
    m_b = mat("M_charB", (0.18, 0.19, 0.24, 1), 0.75)

    # sakura: far bank (depth) + two near-side for vertical top framing
    far = [-16, -10, -4, 2, 8, 14, 20]
    for i, x in enumerate(far):
        cyl(f"ENV_sakura_far_{i}_trunk", env, 0.17, 2.5, (x, 5.2, 0.0), mat=m_bark)
        c = cyl(f"ENV_sakura_far_{i}_canopy", env, 1.9, 2.0, (x, 5.2, 2.4), mat=m_blossom)
        c.scale.z *= 0.85
    for i, x in enumerate((-7.0, 6.5)):
        cyl(f"ENV_sakura_near_{i}_trunk", env, 0.20, 2.9, (x, -4.6, 0.0), mat=m_bark)
        cyl(f"ENV_sakura_near_{i}_canopy", env, 2.3, 2.3, (x, -4.6, 2.8), mat=m_blossom)

    # Roastery mass, background right — top third of the vertical frame
    box("ENV_roastery", env, (18, 9, 12), (13.0, 12.5, 0.0), rot_z=0.10, mat=m_bldg)
    box("ENV_block_left", env, (14, 8, 9), (-17.0, 12.0, 0.0), mat=m_bldg)

    for i, x in enumerate((-12, 0, 12)):
        cyl(f"PRP_streetlight_{i}", env, 0.09, 5.2, (x, -4.9, 0.26), mat=m_bark)

    # cast: capsule-ish stand-ins, origin at feet
    a = box("HERO_charA", hero, (0.50, 0.36, 1.72), (8.5, 2.0, 0.0), mat=m_a)
    b = box("HERO_charB", hero, (0.50, 0.36, 1.78), (-1.25, -1.95, 0.0), mat=m_b)
    a.rotation_euler = (0, 0, math.radians(210))
    b.rotation_euler = (0, 0, math.radians(35))
    return {"pass": "secondary_masses",
            "charA": list(a.location), "charB": list(b.location)}


# ------------------------------------------- PASS 4: camera + key lighting

def pass_camera_light():
    env = get_coll("ENV")
    cam = bpy.data.objects.get("CAM_main")
    if cam is None:
        cd = bpy.data.cameras.new("CAM_main")
        cam = bpy.data.objects.new("CAM_main", cd)
        env.objects.link(cam)
    cam.data.lens = 35.0
    cam.data.sensor_fit = 'VERTICAL'
    cam.location = (2.80, -10.50, 1.15)
    target = Vector((-0.30, -1.00, 1.05))
    d = target - cam.location
    cam.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    bpy.context.scene.camera = cam

    # key: low golden-hour sun, raking from +X/-Y -> rim on car + cast
    sun = bpy.data.objects.get("LGT_key")
    if sun is None:
        sd = bpy.data.lights.new("LGT_key", type='SUN')
        sun = bpy.data.objects.new("LGT_key", sd)
        env.objects.link(sun)
    sun.data.energy = 3.4
    sun.data.angle = math.radians(1.2)
    sun.data.color = (1.0, 0.78, 0.55)
    sun.location = (16, -9, 4.2)
    sd_dir = Vector((-0.30, -1.00, 0.9)) - sun.location
    sun.rotation_euler = sd_dir.to_track_quat('-Z', 'Y').to_euler()

    w = bpy.context.scene.world
    if w is None:
        w = bpy.data.worlds.new("HF_World")
        bpy.context.scene.world = w
    w.use_nodes = True
    bg = w.node_tree.nodes.get("Background")
    if bg:
        bg.inputs[0].default_value = (0.30, 0.34, 0.46, 1)
        bg.inputs[1].default_value = 0.55

    bpy.context.scene.view_settings.view_transform = 'AgX'
    return {"pass": "camera_review", "camera": cam.name,
            "lens": cam.data.lens, "sensor_fit": cam.data.sensor_fit}
