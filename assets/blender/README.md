# The Quiet Engine — source assets

Original geometry authored for this portfolio through the connected local Blender MCP bridge.

- `quiet-engine.blend`: editable Blender 5.2 scene. The user's original default scene is also preserved.
- `build_sanctuary.py`: deterministic asset builder (seed 7479), material assembly, GLB export and Cycles still renderer.
- `send_to_blender.py`: small client for the existing Blender MCP bridge on localhost:9876.
- `quiet-engine-render.png`: full-resolution source still. The website uses its optimized WebP version.

The model contains interrupted basalt masonry, recessed bronze splines, brass calibration marks, three independently articulated optical sight rings, stepped water-court landings, broken piers, roots, a sapling and ferns. Geometry is merged by material except the articulated sight rings. The tiling mineral texture is generated locally and packed into the model.

Exports live in `public/sanctuary/`: a Draco-compressed GLB, a WebP still, the small inscription image, and local Draco decoder files copied from the installed Three.js distribution. Water, reflection, illumination and camera movement are rendered by React Three Fiber. No audio or external runtime model/texture service is used.

To rebuild with Blender open and its MCP bridge connected:

```sh
python3 assets/blender/send_to_blender.py assets/blender/build_sanctuary.py
```

The builder's project root is intentionally explicit near the top of the script; adjust it when moving the checkout. Rebuilding replaces only the named sanctuary scene. It never clears the user's other scenes.

The small `राम` image was rasterized from the macOS Kohinoor Devanagari font into a transparent 512×180 PNG. The font itself is not redistributed. Its matching semantic text remains in HTML; the image is only an environmental inlay.

The GLB is roughly 580 KB and contains about 57k triangles. Reflections and shadows increase per-frame rendered triangle counts without increasing downloaded geometry. See the QA report for measured totals.
