# Observatory studies

`observatory-studies.blend` preserves the authored generic communications satellite, three circuit-board layers, triangular prism and studio rendering setup. These are illustrative studies, not representations of hardware Aman engineered.

Run `build_observatory.py` through the Blender MCP bridge with `send_to_blender.py`; then `refine_prism.py`, then `optimize_observatory.py`. These scripts target this project's absolute path; update ROOT/root if moving the project. The optimizer joins meshes by material and board layer, preserving independent layer motion. Keep the editable blend separate from optimized web exports.

The satellite is generic and solar-powered; it is not Voyager. The prism uses a transmission material in the browser; the accompanying colored bands explain dispersion qualitatively. Software content remains accessible as DOM text.
