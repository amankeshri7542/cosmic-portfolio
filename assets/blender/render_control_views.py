"""Bake 11 deterministic control positions for browsers without WebGL."""
import bpy, math
from mathutils import Vector
from pathlib import Path
root = Path(__file__).resolve().parents[2]
out = Path('/tmp/portfolio-control-views')
out.mkdir(exist_ok=True)
scene = bpy.data.scenes.get('Cosmic Field Journal — object studies')
bpy.context.window.scene = scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = 12
scene.render.resolution_x = 600
scene.render.resolution_y = 507
scene.render.resolution_percentage = 100
scene.render.film_transparent = True
scene.render.image_settings.file_format = 'PNG'
meshes = [o for o in scene.objects if o.type == 'MESH']
original = {o.name: o.location.copy() for o in meshes}
for kind in ['circuit', 'satellite', 'prism']:
    for o in meshes:
        is_circuit = o.name.startswith(('base_', 'middle_', 'upper_'))
        is_prism = o.name.startswith(('optical_prism', 'prism_edge'))
        active = is_circuit if kind == 'circuit' else is_prism if kind == 'prism' else not is_circuit and not is_prism
        o.hide_render = not active
    scene.camera.data.ortho_scale = {'circuit': 5.2, 'satellite': 5.5, 'prism': 4.5}[kind]
    for i in range(11):
        value = i * 10
        angle = 0 if kind == 'circuit' else (value - 50) / 60
        x, y = 4, -7
        scene.camera.location = (x * math.cos(angle) - y * math.sin(angle), x * math.sin(angle) + y * math.cos(angle), 5)
        scene.camera.rotation_euler = (-scene.camera.location).to_track_quat('-Z', 'Y').to_euler()
        for o in meshes:
            o.location = original[o.name].copy()
            if kind == 'circuit':
                factor = 1 if o.name.startswith('upper_') else -1 if o.name.startswith('base_') else 0
                o.location.z += factor * value / 125
        scene.render.filepath = str(out / f'{kind}-{i}.png')
        bpy.ops.render.render(write_still=True)
print('Control views rendered to', out)
