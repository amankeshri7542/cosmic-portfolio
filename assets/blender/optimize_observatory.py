import bpy
from pathlib import Path
root=Path('/Users/mackie/Codes /portfolio');scene=bpy.data.scenes.get('Cosmic Field Journal — object studies');bpy.context.window.scene=scene
for kind in ['satellite','circuit','prism']:
    bpy.ops.object.select_all(action='DESELECT')
    bpy.ops.import_scene.gltf(filepath=str(root/f'public/observatory/{kind}.glb'))
    imported=list(bpy.context.selected_objects)
    meshes=[o for o in imported if o.type=='MESH'];groups={}
    for o in meshes:
        layer=o.name.split('_')[0] if kind=='circuit' else kind
        mat=o.data.materials[0].name if o.data.materials else 'none'
        groups.setdefault((layer,mat),[]).append(o)
    joined=[]
    for (layer,mat),items in groups.items():
        bpy.ops.object.select_all(action='DESELECT')
        for o in items:o.select_set(True)
        bpy.context.view_layer.objects.active=items[0]
        bpy.ops.object.join();o=bpy.context.object
        o.name='optical_prism' if kind=='prism' and 'Optical crystal' in mat else f'{layer}_{mat.replace(" ","_")}'
        joined.append(o)
    bpy.ops.object.select_all(action='DESELECT')
    for o in joined:o.select_set(True)
    bpy.ops.export_scene.gltf(filepath=str(root/f'public/observatory/{kind}.glb'),use_selection=True,export_format='GLB',export_apply=True)
    print(kind, 'meshes',len(meshes),'->',len(joined))
    for o in list(imported):
        try:
            if o.name in bpy.data.objects:bpy.data.objects.remove(o,do_unlink=True)
        except ReferenceError:pass
