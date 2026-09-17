# Object controls and illustrated sample essays

## Fixed

All four homepage object sliders and the work-page satellite remain usable in live 3D, still view, reduced motion and graphics failure states. The original control test failed against the previous preview because every range was disabled when WebGL was unavailable.

A second reproduction showed a live satellite changing permanently to fallback after scrolling away and back. The renderer deliberately releases its context when unmounted; its old event listener incorrectly treated that cleanup as a graphics failure. The context-loss listener now belongs to a Canvas child effect and is removed before disposal. Genuine context loss still activates the fallback.

The fallback uses 11 pre-rendered positions of each existing Blender model: circuit layer separation and satellite/prism view angles. Three compressed WebP sheets total about 320KB and load when their fallback object is visible. They respond to deliberate input without an animation loop. The native ranges retain 44px touch areas and keyboard support. View angles have accessible degree descriptions.

Sources remain in `assets/blender/render_control_views.py`; run it against `observatory-studies.blend`, then run `node scripts/pack-control-views.mjs`.

## Added

Three explicitly labeled sample essays alongside the untouched AWS article:

- `/blogs/one-sale-three-records`: transaction boundaries, concurrency and external work.
- `/blogs/when-a-recipient-goes-offline`: independent delivery, retries and a local delivery experiment.
- `/blogs/patterns-between-patterns`: moiré, sampling and an adjustable optical experiment.

Each has a subject-specific animated SVG illustration, a pause control, viewport-aware playback and reduced-motion handling. Samples appear in illustrated rows on the blog index. Dates sort by ISO date rather than the formatted display string. The existing published article stays featured on the homepage and blog index.

## Verification

- 89 new controls/article checks: all four objects under unavailable WebGL, reduced motion, missing models, still view and context loss; work-page fallback; live 3D after scrolling; article content, mobile layouts, pause/resume and interactive experiments.
- 302 responsive checks across ten routes and 14 viewport sizes.
- Existing journal/refinement suites: 61 + 21 checks.
- Build, TypeScript, ESLint and diff checks pass.
- The in-app browser was also used to exercise the circuit with native click/keyboard input and switch to the rendered fallback.

Results and screenshots: `docs/qa/controls-blogs/`, `docs/qa/responsive/`, `docs/qa/journal/`, `docs/qa/refinement/`.

Local preview only. No deployment or real messages sent.
