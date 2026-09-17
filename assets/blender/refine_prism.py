import bpy
from pathlib import Path
root=Path('/Users/mackie/Codes /portfolio')
scene=bpy.data.scenes.get('Cosmic Field Journal — object studies')
bpy.context.window.scene=scene
bpy.ops.object.select_all(action='DESELECT')
for obj in scene.objects:
    if obj.type=='MESH':
        active=obj.name.startswith('prism_edge') or obj.name=='optical_prism'
        obj.hide_render=not active;obj.hide_set(not active)
        obj.select_set(active)
m=bpy.data.materials.get('Optical crystal');p=m.node_tree.nodes['Principled BSDF']
p.inputs['Metallic'].default_value=0
p.inputs['Transmission Weight'].default_value=.8
p.inputs['Roughness'].default_value=.055
p.inputs['IOR'].default_value=1.5
bpy.ops.export_scene.gltf(filepath=str(root/'public/observatory/prism.glb'),use_selection=True,export_format='GLB',export_apply=True)
scene.render.filepath=str(root/'public/observatory/prism.png')
bpy.ops.render.render(write_still=True)
bpy.ops.wm.save_as_mainfile(filepath=str(root/'assets/blender/observatory-studies.blend'))
print('Refined the optical crystal material and rendered the still.')
