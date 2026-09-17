"""Three recognizable study objects, authored for the cosmic field journal."""
import bpy, math
from pathlib import Path
from mathutils import Vector

ROOT = Path('/Users/mackie/Codes /portfolio')
OUT = ROOT / 'public/observatory'
OUT.mkdir(exist_ok=True)
scene = bpy.data.scenes.new('Cosmic Field Journal — object studies')
bpy.context.window.scene = scene

def material(name, color, metal=0, rough=.4):
    m=bpy.data.materials.new(name); m.diffuse_color=(*color,1); m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF'); p.inputs['Base Color'].default_value=(*color,1)
    p.inputs['Metallic'].default_value=metal; p.inputs['Roughness'].default_value=rough
    return m

silver=material('Brushed aluminum',(.55,.63,.69),.82,.25)
gold=material('Gold thermal foil',(.62,.35,.09),.7,.32)
blue=material('Blue silicon cells',(.025,.075,.22),.6,.22)
ink=material('Blue PCB substrate',(.055,.19,.24),.15,.5)
black=material('Ceramic chip',(.025,.033,.042),.18,.3)
white=material('Printed traces',(.75,.83,.85),.35,.35)
glass=material('Optical crystal',(.52,.77,.89),.3,.13)
objects=[]

def finish(obj,name,mat):
    obj.name=name;obj.data.materials.append(mat); objects.append(obj);return obj

def cube(name,loc,scale,mat,bevel=.025):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.scale=scale
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    if bevel:
        m=o.modifiers.new('Manufactured edge','BEVEL');m.width=bevel;m.segments=2
        bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=m.name)
        o.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
    return finish(o,name,mat)

def rod(name,a,b,r,mat):
    a,b=Vector(a),Vector(b);v=b-a
    bpy.ops.mesh.primitive_cylinder_add(vertices=12,radius=r,depth=v.length,location=(a+b)/2)
    o=bpy.context.object;o.rotation_euler=v.to_track_quat('Z','Y').to_euler();return finish(o,name,mat)

def export(name):
    bpy.ops.object.select_all(action='DESELECT')
    for o in objects:o.select_set(True)
    bpy.ops.export_scene.gltf(filepath=str(OUT/f'{name}.glb'),use_selection=True,export_format='GLB',export_apply=True)
    for o in objects:o.hide_render=False
    scene.render.filepath=str(OUT/f'{name}.png');bpy.ops.render.render(write_still=True)
    for o in objects:o.hide_render=True;o.hide_set(True)
    objects.clear()

scene.render.engine='CYCLES';scene.cycles.samples=24
scene.render.resolution_x=900;scene.render.resolution_y=760;scene.render.resolution_percentage=100
scene.render.film_transparent=True;scene.render.image_settings.file_format='PNG'
scene.world=bpy.data.worlds.new('Study studio');scene.world.use_nodes=True
scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.6,.72,.86,1)
scene.world.node_tree.nodes['Background'].inputs[1].default_value=.45
bpy.ops.object.camera_add(location=(4,-7,5));camera=bpy.context.object
camera.rotation_euler=(Vector((0,0,0))-camera.location).to_track_quat('-Z','Y').to_euler()
camera.data.type='ORTHO';camera.data.ortho_scale=5.5;scene.camera=camera
for loc,power,size in [((1,-4,6),700,5),((-4,1,3),500,4),((3,4,4),850,3)]:
    bpy.ops.object.light_add(type='AREA',location=loc);l=bpy.context.object;l.data.energy=power;l.data.shape='DISK';l.data.size=size
    l.rotation_euler=(-l.location).to_track_quat('-Z','Y').to_euler()

# A generic communications satellite: bus, cells, booms and dish.
cube('satellite_bus',(0,0,0),(.9,.8,.8),silver)
for x in [-.47,.47]:cube('thermal_blanket',(x,0,0),(.025,.71,.69),gold)
for side in [-1,1]:
    rod('panel_boom',(side*.4,0,0),(side*1.35,0,0),.035,silver)
    cube('solar_frame',(side*1.43,0,0),(1.42,.91,.065),silver)
    for i in range(4):
        for j in range(3):
            x=side*1.43+(i-1.5)*.335;y=(j-1)*.278
            cube('photovoltaic_cell',(x,y,.047),(.305,.253,.017),blue,.008)
            rod('cell_contact',(x-.13,y,.057),(x+.13,y,.057),.003,white)
rod('antenna_mast',(0,0,.3),(0,0,.85),.055,silver)
verts=[(0,0,.64)];faces=[]
for ring in range(1,9):
    r=ring*.07
    for i in range(48):
        a=i*2*math.pi/48;verts.append((r*math.cos(a),r*math.sin(a),.64+.65*r*r))
for i in range(48):faces.append((0,1+i,1+(i+1)%48))
for ring in range(7):
    a=1+ring*48;b=a+48
    for i in range(48):j=(i+1)%48;faces.append((a+i,b+i,b+j,a+j))
mesh=bpy.data.meshes.new('Parabolic dish');mesh.from_pydata(verts,[],faces);mesh.update()
o=bpy.data.objects.new('Directional antenna',mesh);scene.collection.objects.link(o);finish(o,'directional_antenna',white)
for a in [0,2.094,4.189]:rod('feed_support',(.5*math.cos(a),.5*math.sin(a),.8),(0,0,1.18),.012,silver)
cube('antenna_feed',(0,0,1.18),(.09,.09,.12),gold)
rod('radio_whip',(.3,.2,.4),(.65,.4,1.3),.015,silver)
export('satellite')

# A layered physical PCB metaphor for the software stack.
camera.data.ortho_scale=4.6
for layer,z in [('base',-.4),('middle',0),('upper',.4)]:
    cube(layer+'_board',(0,0,z),(2.3,1.65,.08),ink)
    for x in [-1.03,1.03]:
        for y in [-.69,.69]:rod(layer+'_standoff',(x,y,z),(x,y,z+.18),.055,gold)
    for j in range(7):
        y=(j-3)*.19
        rod(layer+'_trace',(-1,y,z+.047),(-.5,y,z+.047),.01,gold)
        rod(layer+'_trace',(.4,y,z+.047),(1,y,z+.047),.01,gold)
    cube(layer+'_processor',(0,0,z+.1),(.75,.75,.13),black)
    for i in range(8):
        for side in [-1,1]:cube(layer+'_pin',(side*.43,(i-3.5)*.085,z+.085),(.12,.027,.035),silver,.003)
    for x in [-.8,.8]:
        for y in [-.55,.55]:cube(layer+'_capacitor',(x,y,z+.1),(.16,.1,.1),silver,.01)
    cube(layer+'_chip_label',(0,0,z+.17),(.39,.39,.005),white,.005)
export('circuit')

# Equilateral triangular optical prism with a real solid body.
camera.data.ortho_scale=4.5
verts=[(-1,-.65,-.55),(1,-.65,-.55),(0,-.65,1.18),(-1,.65,-.55),(1,.65,-.55),(0,.65,1.18)]
faces=[(0,2,1),(3,4,5),(0,1,4,3),(1,2,5,4),(2,0,3,5)]
mesh=bpy.data.meshes.new('Triangular optical solid');mesh.from_pydata(verts,[],faces);mesh.update()
o=bpy.data.objects.new('Optical prism',mesh);scene.collection.objects.link(o);finish(o,'optical_prism',glass)
bevel=o.modifiers.new('Polished edges','BEVEL');bevel.width=.016;bevel.segments=3
for a,b in [(0,1),(1,2),(2,0),(3,4),(4,5),(5,3),(0,3),(1,4),(2,5)]:rod('prism_edge',verts[a],verts[b],.008,white)
export('prism')
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'assets/blender/observatory-studies.blend'))
print('Exported satellite, circuit and prism with matching rendered fallbacks.')
