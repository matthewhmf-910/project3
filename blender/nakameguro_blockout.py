# Nakameguro sakura street - 9:16 blockout
# Z-up, metres, radians. All-blockout route: no generation, no credits.
# Ground plane is z = 0; road surface tops out at z = 0.

import bpy
import bmesh
import math
from mathutils import Vector

CAR_ROT_Z = -0.30          # pull-in angle toward the near curb
CAR_LOC = (0.0, -1.40, 0.0)
WHEEL_R = 0.34
CHAR_A_H, CHAR_B_H = 1.72, 1.78
FPS, F_START, F_END = 24, 1, 288
RES_X, RES_Y = 1080, 1920


# ---------------------------------------------------------------- helpers

def get_coll(name):
    c = bpy.data.collections.get(name)
    if c is None:
        c = bpy.data.collections.new(name)
        bpy.context.scene.collection.children.link(c)
    return c


def _mesh_obj(name, coll, maker):
    ob = bpy.data.objects.get(name)
    if ob is None:
        me = bpy.data.meshes.new(name)
        bm = bmesh.new()
        maker(bm)
        bm.to_mesh(me)
        bm.free()
        ob = bpy.data.objects.new(name, me)
        coll.objects.link(ob)
    return ob


def box(name, coll, dims, loc, rot_z=0.0, mat=None):
    """Axis-aligned box placed by its BASE centre (loc[2] is the base height)."""
    ob = _mesh_obj(name, coll,
                   lambda bm: bmesh.ops.create_cube(bm, size=1.0))
    ob.dimensions = dims
    ob.location = (loc[0], loc[1], loc[2] + dims[2] / 2.0)
    ob.rotation_euler = (0.0, 0.0, rot_z)
    if mat:
        ob.data.materials.clear()
        ob.data.materials.append(mat)
    return ob


def cyl(name, coll, radius, depth, loc, mat=None, by_centre=False):
    """Upright cylinder. Placed by base centre unless by_centre is set."""
    ob = _mesh_obj(name, coll,
                   lambda bm: bmesh.ops.create_cone(
                       bm, cap_ends=True, cap_tris=False, segments=16,
                       radius1=1.0, radius2=1.0, depth=1.0))
    ob.dimensions = (radius * 2, radius * 2, depth)
    z = loc[2] if by_centre else loc[2] + depth / 2.0
    ob.location = (loc[0], loc[1], z)
    if mat:
        ob.data.materials.clear()
        ob.data.materials.append(mat)
    return ob


def sphere(name, coll, dims, loc, mat_=None):
    """Ellipsoid placed by centre."""
    ob = _mesh_obj(name, coll,
                   lambda bm: bmesh.ops.create_uvsphere(
                       bm, u_segments=16, v_segments=10, radius=1.0))
    ob.dimensions = dims
    ob.location = loc
    if mat_:
        ob.data.materials.clear()
        ob.data.materials.append(mat_)
    return ob


def figure(name, coll, height, mat_, skin):
    """Human stand-in that actually reads as a person: legs, torso, head,
    grouped under an empty whose origin sits at the feet so walk keys stay
    simple. Blockout tier, but with a human silhouette."""
    root = empty(name, coll, (0, 0, 0))
    h = height
    parts = [
        (name + "_legs",  (0.34, 0.26, h * 0.47), (0, 0, 0.0), mat_),
        (name + "_torso", (0.44, 0.28, h * 0.34), (0, 0, h * 0.47), mat_),
    ]
    for n, dims, loc, m in parts:
        ob = box(n, coll, dims, loc, mat=m)
        ob.parent = root
        ob.matrix_parent_inverse.identity()
    head = sphere(name + "_head", coll, (0.21, 0.23, 0.26),
                  (0, 0, h * 0.90), skin)
    head.parent = root
    head.matrix_parent_inverse.identity()
    return root


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


def empty(name, coll, loc=(0, 0, 0)):
    ob = bpy.data.objects.get(name)
    if ob is None:
        ob = bpy.data.objects.new(name, None)
        coll.objects.link(ob)
    ob.location = loc
    return ob


# --------------------------------------------------- PASS 1: bounds / road

def pass_bounds():
    sc = bpy.context.scene
    sc.render.resolution_x, sc.render.resolution_y = RES_X, RES_Y
    sc.render.fps = FPS
    sc.frame_start, sc.frame_end = F_START, F_END

    env = get_coll("ENV")
    m_asphalt = mat("M_asphalt", (0.045, 0.045, 0.050, 1), 0.72)
    m_walk = mat("M_sidewalk", (0.34, 0.33, 0.31, 1), 0.85)
    m_water = mat("M_river", (0.06, 0.10, 0.12, 1), 0.18)

    # ground first - without it the downward camera angle sees the sky's
    # below-horizon black straight through the frame's lower third
    box("ENV_ground", env, (160, 160, 0.4), (0, 0, -0.55), mat=m_walk)
    # road top sits exactly at z = 0
    box("ENV_road", env, (46, 6.5, 0.30), (0, 0, -0.30), mat=m_asphalt)
    # 15 cm kerbs
    box("ENV_sidewalk_near", env, (46, 5.2, 0.15), (0, -5.85, 0.0), mat=m_walk)
    box("ENV_sidewalk_far", env, (46, 2.6, 0.15), (0, 4.55, 0.0), mat=m_walk)
    box("ENV_river_rail", env, (46, 0.14, 1.05), (0, 5.75, 0.15), mat=m_walk)
    box("ENV_river", env, (46, 9.0, 0.05), (0, 10.4, -1.10), mat=m_water)
    return {"pass": "bounds", "res": [RES_X, RES_Y], "frames": [F_START, F_END]}


# ------------------------------------------- PASS 2: primary masses (car)

def pass_primary():
    """Car kept as separated semantic parts so the suspension dip and wheel
    roll can be keyed independently. Chassis empty carries the body group."""
    hero = get_coll("HERO")
    m_car = mat("M_car_paint", (0.015, 0.02, 0.035, 1), 0.18)
    m_glass = mat("M_car_glass", (0.02, 0.03, 0.04, 1), 0.05)
    m_tyre = mat("M_tyre", (0.012, 0.012, 0.012, 1), 0.90)

    root = empty("HERO_car", hero, CAR_LOC)
    root.rotation_euler = (0, 0, CAR_ROT_Z)

    chassis = empty("HERO_car_chassis", hero, (0, 0, 0))
    chassis.parent = root
    chassis.matrix_parent_inverse.identity()

    # stepped profile: low nose, parallel midbody, raised haunch - steps are
    # what the eye measures scale against, a smooth taper reads as a blob
    parts = [
        ("HERO_car_sill",   (4.40, 1.95, 0.30), (0.00, 0, 0.22), 0.0, m_car),
        ("HERO_car_body",   (3.30, 1.86, 0.34), (-0.10, 0, 0.50), 0.0, m_car),
        ("HERO_car_haunch", (1.70, 1.94, 0.40), (-1.35, 0, 0.44), 0.0, m_car),
        ("HERO_car_nose",   (1.45, 1.74, 0.26), (1.80, 0, 0.30), 0.0, m_car),
        ("HERO_car_splitter", (0.55, 1.88, 0.10), (2.35, 0, 0.14), 0.0, m_car),
        ("HERO_car_diff",   (0.70, 1.86, 0.26), (-2.05, 0, 0.26), 0.0, m_car),
    ]
    for name, dims, loc, rz, mm in parts:
        ob = box(name, hero, dims, loc, rot_z=rz, mat=mm)
        ob.parent = chassis
        ob.matrix_parent_inverse.identity()   # inherit the car's rotation

    # cabin: a raked wedge, not an upright box
    cabin = box("HERO_car_cabin", hero, (1.95, 1.60, 0.40), (-0.45, 0, 0.80),
                mat=m_glass)
    cabin.rotation_euler = (0.0, math.radians(-4.0), 0.0)
    cabin.parent = chassis
    cabin.matrix_parent_inverse.identity()

    # wheels ride on the root, not the chassis, so the body can dip over them
    for nm, x, y in (("fl", 1.42, 0.86), ("fr", 1.42, -0.86),
                     ("rl", -1.40, 0.90), ("rr", -1.40, -0.90)):
        w = cyl("HERO_car_wheel_" + nm, hero, WHEEL_R, 0.26,
                (x, y, WHEEL_R), mat=m_tyre, by_centre=True)
        # XYZ euler is Rz*Ry*Rx: Rx(pi/2) lays the axle along Y, then the
        # Y channel spins about that axle. Spin lives in rotation_euler[1].
        w.rotation_euler = (math.pi / 2, 0.0, 0.0)
        w.parent = root
        w.matrix_parent_inverse.identity()

    return {"pass": "primary_masses", "root": root.name,
            "parts": [c.name for c in root.children_recursive]}


# ----------------------------------- PASS 3: secondary masses (env + cast)

def pass_secondary():
    env, hero = get_coll("ENV"), get_coll("HERO")
    m_bark = mat("M_bark", (0.09, 0.07, 0.065, 1), 0.88)
    m_blossom = mat("M_blossom", (0.86, 0.63, 0.70, 1), 0.80)
    m_bldg = mat("M_building", (0.16, 0.15, 0.14, 1), 0.70)
    m_a = mat("M_charA", (0.55, 0.22, 0.20, 1), 0.75)
    m_b = mat("M_charB", (0.18, 0.19, 0.24, 1), 0.75)

    # sakura: far bank for depth, two near-side for vertical top framing
    for i, x in enumerate((-16, -10, -4, 2, 8, 14, 20)):
        cyl(f"ENV_sakura_far_{i}_trunk", env, 0.15, 3.2, (x, 5.2, 0.15), mat=m_bark)
        sphere(f"ENV_sakura_far_{i}_canopy", env, (4.0, 3.6, 2.4),
               (x, 5.2, 4.4), m_blossom)
        sphere(f"ENV_sakura_far_{i}_canopy_b", env, (2.6, 2.4, 1.7),
               (x + 1.1, 5.9, 3.6), m_blossom)
    for i, x in enumerate((-10.5, 9.5)):
        cyl(f"ENV_sakura_near_{i}_trunk", env, 0.19, 3.8, (x, -5.2, 0.15), mat=m_bark)
        sphere(f"ENV_sakura_near_{i}_canopy", env, (4.6, 4.0, 2.8),
               (x, -5.2, 5.1), m_blossom)

    # Roastery mass, background right - fills the top third of 9:16
    box("ENV_roastery", env, (18, 9, 12), (13.0, 12.5, 0.0), rot_z=0.10, mat=m_bldg)
    box("ENV_block_left", env, (14, 8, 9), (-17.0, 12.0, 0.0), mat=m_bldg)

    for i, x in enumerate((-16, -6.5, 11.5)):
        cyl(f"PRP_streetlight_{i}", env, 0.09, 5.2, (x, -5.2, 0.15), mat=m_bark)

    # cast: stand-ins with origin at the feet
    m_skin = mat("M_skin", (0.52, 0.36, 0.28, 1), 0.62)
    a = figure("HERO_charA", hero, CHAR_A_H, m_a, m_skin)
    b = figure("HERO_charB", hero, CHAR_B_H, m_b, m_skin)
    a.location = (8.5, 3.6, 0.15)
    b.location = (-1.25, -1.95, 0.0)
    a.rotation_euler = (0, 0, math.radians(210))
    b.rotation_euler = (0, 0, math.radians(35))
    return {"pass": "secondary_masses",
            "charA": list(a.location), "charB": list(b.location)}


# ------------------------------------------- PASS 4: camera + key lighting

def pass_camera_light():
    env = get_coll("ENV")
    cam = bpy.data.objects.get("CAM_main")
    if cam is None:
        cam = bpy.data.objects.new("CAM_main", bpy.data.cameras.new("CAM_main"))
        env.objects.link(cam)
    cam.data.lens = 20.0
    cam.data.sensor_fit = 'VERTICAL'
    cam.location = (4.20, -14.00, 2.25)

    # TRACK_TO an explicit target keeps the pair framed through the push-in
    tgt = empty("CAM_target", env, (-0.30, -1.40, 1.15))
    con = next((c for c in cam.constraints if c.type == 'TRACK_TO'), None)
    if con is None:
        con = cam.constraints.new('TRACK_TO')
    con.target = tgt
    con.track_axis = 'TRACK_NEGATIVE_Z'
    con.up_axis = 'UP_Y'
    bpy.context.scene.camera = cam

    # key: low golden-hour sun raking from +X/-Y -> rim on car and cast
    sun = bpy.data.objects.get("LGT_key")
    if sun is None:
        sd = bpy.data.lights.new("LGT_key", type='SUN')
        sun = bpy.data.objects.new("LGT_key", sd)
        env.objects.link(sun)
    sun.data.energy = 4.2
    sun.data.angle = math.radians(1.2)
    sun.data.color = (1.0, 0.78, 0.55)
    sun.location = (16, -9, 4.2)
    d = Vector((-0.30, -1.00, 0.9)) - sun.location
    sun.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()

    # fill: soft bounce off the road, opposite the key, low contrast lift
    fill = bpy.data.objects.get("LGT_fill")
    if fill is None:
        fd = bpy.data.lights.new("LGT_fill", type='AREA')
        fill = bpy.data.objects.new("LGT_fill", fd)
        env.objects.link(fill)
    fill.data.energy = 120.0
    fill.data.size = 9.0
    fill.data.color = (0.62, 0.70, 0.92)
    fill.location = (-8.0, -7.0, 3.4)
    d = Vector((-0.30, -1.60, 1.0)) - fill.location
    fill.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()

    w = bpy.context.scene.world
    if w is None:
        w = bpy.data.worlds.new("HF_World")
        bpy.context.scene.world = w
    w.use_nodes = True
    nt = w.node_tree
    bg = nt.nodes.get("Background")
    sky = next((n for n in nt.nodes if n.type == 'TEX_SKY'), None)
    if sky is None:
        sky = nt.nodes.new('ShaderNodeTexSky')
        sky.location = (-320, 0)
    # Blender 5.0 renamed the Nishita model to MULTIPLE_SCATTERING
    types = {i.identifier for i in
             sky.bl_rna.properties['sky_type'].enum_items}
    for want in ('MULTIPLE_SCATTERING', 'NISHITA', 'HOSEK_WILKIE'):
        if want in types:
            sky.sky_type = want
            break
    for attr, val in (("sun_elevation", math.radians(7.5)),   # low golden sun
                      ("sun_rotation", math.radians(292.0)),  # matches LGT_key
                      ("altitude", 15),
                      ("air_density", 1.6),
                      ("dust_density", 3.2)):                 # haze warms it
        if hasattr(sky, attr):
            setattr(sky, attr, val)
    if bg:
        nt.links.new(sky.outputs[0], bg.inputs[0])
        bg.inputs[1].default_value = 0.9

    bpy.context.scene.view_settings.view_transform = 'AgX'
    return {"pass": "camera_review", "camera": cam.name,
            "lens": cam.data.lens, "sensor_fit": cam.data.sensor_fit}
