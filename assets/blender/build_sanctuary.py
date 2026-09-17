"""The Quiet Engine. Run in Blender 5.x; exports the authored scene only.

The user's original scene is never cleared. Re-running rebuilds only our scene.
All dimensions in metres. glTF export converts Blender Z-up to browser Y-up.
"""
import bpy
import math
import random
from pathlib import Path
from mathutils import Vector, noise

ROOT = Path('/Users/mackie/Codes /portfolio')
OUT = ROOT / 'public/sanctuary'
SOURCE = ROOT / 'assets/blender'
OUT.mkdir(parents=True, exist_ok=True)
random.seed(7479)

old = bpy.data.scenes.get('The Quiet Engine')
if old:
    for obj in list(old.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    bpy.data.scenes.remove(old)
scene = bpy.data.scenes.new('The Quiet Engine')
bpy.context.window.scene = scene

def material(name, color, roughness=.8, metal=0):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = (*color, 1)
    bsdf.inputs['Roughness'].default_value = roughness
    bsdf.inputs['Metallic'].default_value = metal
    return mat

stone = material('Basalt · mineral grain', (.26,.29,.265))
dark = material('Cut basalt · damp edges', (.095,.13,.115), .92)
brass = material('Brass · worn inlay', (.43,.32,.155), .4, .72)
patina = material('Oxidised bronze', (.13,.24,.20), .65, .5)
bark = material('Root · silver bark', (.17,.20,.145), 1)
leaf = material('Fern · shaded green', (.13,.22,.095), .95)
leaflight = material('Fern · young leaf', (.29,.37,.145), .9)

# A small locally authored tiling texture; no external assets or runtime downloads.
size = 256
tex = bpy.data.images.new('Mineral grain', width=size, height=size)
pixels = []
for y in range(size):
    for x in range(size):
        # Torus-domain noise is seamless at both image edges.
        a,b = 2*math.pi*x/size, 2*math.pi*y/size
        n = noise.noise_vector(Vector((math.cos(a)*3, math.sin(a)*3, math.cos(b)*3+math.sin(b))))[0]
        fine = random.random()*.055
        t = .25 + n*.1 + fine
        pixels.extend((t*.94, t*1.02, t*.91, 1))
tex.pixels = pixels
tex.pack()
nodes = stone.node_tree.nodes
image_node = nodes.new('ShaderNodeTexImage')
image_node.image = tex
stone.node_tree.links.new(image_node.outputs['Color'], nodes.get('Principled BSDF').inputs['Base Color'])

def mesh(name, vertices, faces, mat):
    data = bpy.data.meshes.new(name)
    data.from_pydata(vertices, [], faces)
    data.materials.append(mat)
    data.update()
    obj = bpy.data.objects.new(name, data)
    scene.collection.objects.link(obj)
    # World-space UVs retain grain scale across merged stone blocks.
    uv = data.uv_layers.new(name='Grain UV')
    for poly in data.polygons:
        axis = max(range(3), key=lambda i: abs(poly.normal[i]))
        axes = [i for i in range(3) if i != axis]
        for index in poly.loop_indices:
            co = data.vertices[data.loops[index].vertex_index].co
            uv.data[index].uv = (co[axes[0]]*.6, co[axes[1]]*.6)
    return obj

def bevel(obj, amount=.035):
    bpy.context.view_layer.objects.active = obj
    mod = obj.modifiers.new('Hand-softened arris', 'BEVEL')
    mod.width = amount
    mod.segments = 2
    bpy.ops.object.modifier_apply(modifier=mod.name)
    return obj

def block(name, pos, scale, mat=stone, soft=.025):
    bpy.ops.mesh.primitive_cube_add(size=1, location=pos)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.materials.append(mat)
    if soft:
        bevel(obj, soft)
    return obj

def arc(name, radius, width, depth, start, end, mat, center=3.5, y=0, steps=10):
    verts=[]
    for i in range(steps+1):
        a=start+(end-start)*i/steps
        for r,d in [(radius-width/2,-depth/2),(radius+width/2,-depth/2),(radius+width/2,depth/2),(radius-width/2,depth/2)]:
            verts.append((r*math.cos(a),y+d,center+r*math.sin(a)))
    faces=[(3,2,1,0)]
    for i in range(steps):
        for j in range(4):
            faces.append((i*4+j,i*4+(j+1)%4,(i+1)*4+(j+1)%4,(i+1)*4+j))
    faces.append(tuple(range(steps*4,steps*4+4)))
    return mesh(name,verts,faces,mat)

# The ring is built as masonry, with an intentionally missing upper-right wedge.
for i in range(56):
    if i in (5,6,7):
        continue
    a=i*math.tau/56+.009
    b=(i+1)*math.tau/56-.009
    r=2.91+random.uniform(-.012,.012)
    obj=arc('Instrument / quarried voussoir',r,.59+random.random()*.04,.82,a,b,stone,steps=3)
    bevel(obj,.025)
    if i%7==0:
        arc('Instrument / recessed bronze spline',3.24,.05,.56,a+.025,b-.025,patina,steps=3)

# Continuous brass ribs bind the broken exterior into a functioning instrument.
for radius,y,width in [(2.52,-.43,.025),(2.40,-.20,.042),(2.30,.0,.028)]:
    arc('Instrument / fine brass liner',radius,width,.028,-.15,math.tau-.32,brass,y=y,steps=140)

# Nested sight rings create ambiguity as the camera passes across their alignment.
for k in range(3):
    r=1.97-k*.28
    obj=arc('Optical sight ring '+str(k),r,.052,.075,.18+k*.32,math.tau-.33+k*.32,brass if k!=1 else patina,y=.12+k*.19,steps=110)
    obj.rotation_euler[2]=(.12 if k%2 else -.1)
    obj['optical']=True
for i in range(72):
    a=i*math.tau/72
    if .48<a<.84:
        continue
    r=2.445
    obj=block('Instrument / calibration mark',(r*math.cos(a),-.465,3.5+r*math.sin(a)),(.10 if i%6==0 else .044,.014,.009),brass,0)
    obj.rotation_euler[1]=-a

# Low engineered piers ground the ring in a square terraced water court.
for side in (-1,1):
    for j in range(4):
        block('Footing / ashlar',(side*2.47,.11,j*.25+.18),(1.1,.98,.235),stone)
    block('Footing / bronze bearing',(side*2.47,-.01,1.14),(.84,1.04,.11),patina,.015)

for tier in range(8):
    r=3.25+tier*.34
    z=-.04-tier*.14
    # Open center holds water. Four strips, with staggered ashlar joints.
    for side in (-1,1):
        for segment in range(8):
            x=-r+(segment+.5)*r/4
            block('Water court / terrace',(x,side*r,z),(r/4-.025,.31,.22),stone,.014)
        for segment in range(7):
            y=-r+(segment+1)*r/4
            block('Water court / terrace',(side*r,y,z),(.31,r/4-.025,.22),stone,.014)

for i in range(9):
    block('Approach / stepping stone',(.08*math.sin(i),-3.1-i*.72,-.15-i*.018),(1.12,.60,.15),dark,.04)

# Behind the instrument: a fragmented colonnade, not a second hero.
for x,y,height in [(-5.6,3,4.1),(-4.3,3.4,5.3),(4.5,3.7,3.3),(5.8,3.8,4.4)]:
    for j in range(int(height/.46)):
        block('Garden / broken pier',(x,y,j*.46-.2),(.6,.65,.435),dark,.04)

def branch(name, points, radius, mat=bark):
    curve=bpy.data.curves.new(name,'CURVE')
    curve.dimensions='3D'
    curve.resolution_u=5
    curve.bevel_depth=radius
    curve.bevel_resolution=2
    spline=curve.splines.new('BEZIER')
    spline.bezier_points.add(len(points)-1)
    for i,(p,co) in enumerate(zip(spline.bezier_points,points)):
        p.co=co
        p.handle_left_type='AUTO'
        p.handle_right_type='AUTO'
        p.radius=max(.05,1-i/(len(points)-.7))
    obj=bpy.data.objects.new(name,curve)
    scene.collection.objects.link(obj)
    obj.data.materials.append(mat)
    return obj

roots=[[(3.2,1.1,-.1),(3.0,.2,1.0),(2.9,-.48,2.2),(2.7,-.5,3.4),(2.75,-.2,4.5),(2.1,.12,5.4)],
       [(3.25,1,-.1),(3.5,-.8,.0),(4.2,-1.2,-.35),(4.7,-2,-.5),(5.4,-2.4,-.8)],
       [(3.3,1.3,.0),(3.0,1.1,1.8),(3.5,.8,2.7),(3.2,.7,3.6),(3.1,.7,5)],
       [(-3,1.2,0),(-2.5,-.2,.4),(-1.6,-.3,.7),(-.9,-.4,.68),(-.3,-.5,.8)]]
for idx,points in enumerate(roots):
    branch('Growth / old root',points,.14 if idx<3 else .07)
    for j in range(1,len(points)-1):
        p=Vector(points[j]); q=p+Vector((random.uniform(-.9,.9),random.uniform(-.6,.6),random.uniform(.2,1.1)))
        branch('Growth / fine root',[p,(p+q)*.5+Vector((.1,-.12,.1)),q],.033)

# A wind-bent sapling, asymmetrical and sparse enough to read as silhouette.
trunk=[(4,2,-.4),(4.1,2,1.4),(4,2.1,3),(3.5,2.2,4.9),(2.7,2.1,6.6),(1.8,2.3,7.8)]
branch('Growth / sapling',trunk,.18)
for j in range(16):
    origin=Vector(trunk[random.randint(2,5)])
    direction=Vector((random.uniform(-2.8,1.6),random.uniform(-1.3,1),random.uniform(.4,1.4)))
    end=origin+direction
    branch('Growth / branch',[origin,origin+direction*.52+Vector((0,0,.35)),end],random.uniform(.025,.065))
    for k in range(13):
        p=origin.lerp(end,random.uniform(.5,1))+Vector((random.uniform(-.45,.45),random.uniform(-.3,.3),random.uniform(-.2,.25)))
        angle=random.random()*math.tau
        length=random.uniform(.10,.22)
        d=Vector((math.cos(angle)*length,math.sin(angle)*length,.055))
        cross=Vector((-d.y,d.x,0))*.40
        mesh('Growth / leaf',[p-d,p+cross,p+d,p-cross,p+Vector((0,0,.035))],[(0,1,4),(1,2,4),(2,3,4),(3,0,4)],leaf if k%3 else leaflight)

for clump in range(35):
    x=random.choice([-1,1])*random.uniform(3.0,5.5)
    y=random.uniform(-2.2,3.4)
    base=Vector((x,y,-.25))
    for frond in range(5):
        a=frond*math.tau/5+clump
        length=random.uniform(.35,.85)
        direction=Vector((math.cos(a),math.sin(a),.8))*length
        for leaflet in range(7):
            t=(leaflet+1)/8
            p=base+direction*t+Vector((0,0,math.sin(t*math.pi)*length*.4))
            width=(1-t)*length*.23
            for side in (-1,1):
                q=p+Vector((-math.sin(a)*width*side,math.cos(a)*width*side,.025))
                mesh('Growth / fern',[p-direction*.032,q+direction*.04,p+direction*.06],[(0,1,2)],leaflight if clump%4==0 else leaf)

# Merge by material; keep source semantics in named material groups.
bpy.ops.object.select_all(action='DESELECT')
for obj in list(scene.objects):
    if obj.type=='CURVE':
        obj.select_set(True)
        bpy.context.view_layer.objects.active=obj
        bpy.ops.object.convert(target='MESH')
        obj.select_set(False)
for mat in [stone,dark,brass,patina,bark,leaf,leaflight]:
    objects=[o for o in scene.objects if o.type=='MESH' and o.data.materials and o.data.materials[0]==mat and not o.get('optical')]
    bpy.ops.object.select_all(action='DESELECT')
    for obj in objects:
        obj.select_set(True)
    if objects:
        bpy.context.view_layer.objects.active=objects[0]
        bpy.ops.object.join()
        obj=bpy.context.object
        obj.name=mat.name
        if mat in (bark,brass,patina):
            for polygon in obj.data.polygons:
                polygon.use_smooth=True

bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=str(OUT/'quiet-engine.glb'),export_format='GLB',use_selection=True,export_yup=True,export_apply=True,export_draco_mesh_compression_enable=True,export_draco_mesh_compression_level=6)

# A matching offline still: the same authored geometry, not an unrelated AI image.
water=material('Preview water',(.028,.064,.058),.16,.58)
block('Preview / water',(0,0,-1.25),(180,180,.05),water,0)
scene.world=bpy.data.worlds.new('Night garden')
scene.world.use_nodes=True
scene.world.node_tree.nodes.get('Background').inputs[0].default_value=(.09,.14,.125,1)
scene.world.node_tree.nodes.get('Background').inputs[1].default_value=.35

def light(name,pos,power,color,size):
    data=bpy.data.lights.new(name,'AREA'); data.energy=power; data.color=color; data.shape='DISK'; data.size=size
    obj=bpy.data.objects.new(name,data); scene.collection.objects.link(obj); obj.location=pos
    obj.rotation_euler=(Vector((0,0,2))-obj.location).to_track_quat('-Z','Y').to_euler()
    return obj

light('Moon / broad softbox',(-5,-5,11),2100,(.72,.83,.78),8)
light('Sun / grazing brass',(4,2,8),2600,(1,.77,.46),5)
light('Fill / water',(-4,-3,3),260,(.38,.58,.50),5)
bpy.ops.object.camera_add(location=(10,-18,8.0))
camera=bpy.context.object; camera.name='Threshold / camera'
camera.rotation_euler=(Vector((0,0,3.0))-camera.location).to_track_quat('-Z','Y').to_euler()
camera.data.type='PERSP'; camera.data.lens=43
scene.camera=camera
scene.render.engine='CYCLES'
scene.cycles.samples=40
scene.cycles.use_denoising=True
scene.render.resolution_x=1600
scene.render.resolution_y=1200
scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG'
scene.render.filepath=str(SOURCE/'quiet-engine-render.png')
scene.view_settings.view_transform='AgX'
bpy.ops.wm.save_as_mainfile(filepath=str(SOURCE/'quiet-engine.blend'))
triangles=sum(len(p.vertices)-2 for o in scene.objects if o.type=='MESH' for p in o.data.polygons)
print({'objects':len(scene.objects),'triangles':triangles,'glb_bytes':(OUT/'quiet-engine.glb').stat().st_size})
bpy.ops.render.render(write_still=True)
print('Rendered threshold still.')
