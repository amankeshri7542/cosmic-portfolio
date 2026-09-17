> SUPERSEDED: the user rejected this visual direction. See cosmic-field-journal.md and qa/journal/ for the current design and verification.

# The Quiet Engine — delivery and QA

Completed locally on 17 September 2026, on `codex/engineering-sanctuary`. No production deployment or real outbound message was made.

## Research and creative thesis

The design combines the depth and repeated landings of Indian stepwells, Scarpa's precise material junctions and water gardens, teamLab's continuous perceptual environments, and the authored-world coherence of Bruno Simon's portfolio. OpenAI's current Astra game showcase informed the rendering measurements and uninterrupted camera progression. Exact sources, inspected references and the pre-implementation direction are in [the design report](redesign-direction.md).

The chosen world is an old engineering instrument gradually reclaimed by nature. The basalt exterior is visibly assembled; brass marks and three optical rings suggest precision inside it. A stepped water court provides spatial depth, while roots and a sapling introduce asymmetry. Scroll moves through the threshold, foundation, mechanism, network, daylight garden and quieter water view. Ram Naam is held until the final chapter, with a small environmental inscription and accessible HTML text.

No portraits, audio, technology planets, particle wallpaper, neon palette, typewriter introduction or blocking welcome gate remain in the visible experience.

## Implementation and content

- Retained Next.js 15.5.9, React 19, Three.js 0.180, React Three Fiber 9 and Drei 10. No new production dependency was added.
- Server-rendered semantic content and one lazy-loaded Canvas. The 3D world does not own navigation or essential content.
- Native scrolling, measured chapter positions, interruptible camera settling and reversible optical-ring progression. An explicit inspect control and keyboard-accessible angle slider provide direct exploration.
- A locally rendered WebP appears before the renderer. Reduced motion and Save-Data begin with the still; WebGL failure, model failure and context loss preserve the complete page.
- DPR capped at 1.5, mobile/low-core DPR 1, smaller mobile reflections and no mobile shadow map. Slow sampled frames can lower DPR. Demand rendering stops when camera and interaction settle; hidden tabs do not continue animation.
- All seven original project identities remain, plus the preserved Shiv Cement Store work. Archive search, native expandable records, project permalinks, project images, architecture images and existing outbound URLs are available.
- Added the resume-backed Hardware Store ERP, CodeApto P2P and Vartalaap studies. Removed unsupported old percentage improvements and marketing guarantees from visible copy.
- Updated the downloadable resume to the newer root PDF, verified byte-for-byte. Preserved the previous public copy separately.
- Reworked work, about, contact, thank-you, blog index and article pages. Kept the existing blog text, corrected duplicated article titles and heading levels, retained the public GitHub activity feed, and added a designed 404.
- Contact validation, retryable failure messages and success navigation remain. The retired image-generation API now constructs its client only during a configured request, so a missing secret no longer breaks the production build.

## Blender deliverables

[Editable scene](../assets/blender/quiet-engine.blend), [deterministic builder](../assets/blender/build_sanctuary.py), full-resolution source render, and [source notes](../assets/blender/README.md) are kept under `assets/blender/`.

The authored asset contains the interrupted stone instrument, brass liners and calibration marks, three separately articulated sight rings, masonry footings, terraced water-court landings, broken piers, roots, a sapling and ferns. The original Blender scene was not cleared. Web exports are separate under `public/sanctuary/`, with no external model or texture service.

| Asset | Size |
| --- | ---: |
| Draco-compressed GLB | 592,528 bytes (about 579 KiB) |
| Matching WebP still | 120,448 bytes (about 118 KiB) |
| Environmental inscription PNG | 2,103 bytes |
| Deferred 3D JavaScript chunks | 1,010,751 bytes raw; 275,424 bytes gzip |
| Home first-load JS, Next.js build estimate | 116 kB, excluding deferred 3D |

The actual model is about 57k triangles. Reflections and shadows draw the geometry again; they must not be confused with the downloaded mesh budget.

## Engineering verification

Passed:

```sh
npm run lint
npx tsc --noEmit
npm run build
git diff --check
```

The production build generated all 19 static entries and the retained API routes without requiring local credentials.

[The runnable browser verification](../scripts/verify.mjs) passed **61 assertions**. [Machine-readable results](qa/verification.json) include:

- One home Canvas, correct page landmarks and one page heading per checked route.
- Every archive identity, filtering, empty state, disclosures, architecture link and directly linked record.
- Inspection, the angle control, Escape, keyboard page finder, mobile modal and focus restoration.
- Home, work, about, notes, article and contact routes, without runtime exceptions during normal journeys.
- Form validation, mocked delivery failure with preserved input, and mocked successful thank-you navigation. No actual email was sent.
- Latest resume bytes and graceful unconfigured legacy image generation.
- Widths 360, 390, 768, 1440 and 1920, without horizontal overflow.
- Reduced motion skips both WebGL and the GLB request.
- WebGL unavailable, missing GLB, lost WebGL context, and no-JavaScript project availability.

The final mobile spacing and uncropped archive artwork received a separate targeted check after that full run; see [layout follow-up](qa/layout-followup.json). The last production build includes those CSS refinements.

## Measured rendering

The 90-frame scripted desktop scroll sample used headless Chrome on this Mac at 1440×900:

| Measurement | Result |
| --- | ---: |
| Mean browser frame interval | 16.66 ms |
| 95th-percentile interval | 18.30 ms |
| Renderer draw calls, including extra passes | 31 |
| Rendered triangles, including extra passes | 166,938 |
| Quality profile | Standard |

These are measurements of this browser and host, not claims about physical phones or every GPU. The earlier eight-call observation counted the main pass before the optical-ring refinement; the final report deliberately counts reflection and shadow work too.

## Visual review

Reviewed desktop and mobile compositions, multiple scroll chapters, inspection, archive imagery, contact, notes, menu and fallback screenshots. Revisions included removing a mismatched fog horizon, reducing coarse stone bump intensity, separating the optical rings, removing competing diagrams from the immersive home route, enlarging metadata, moving the command control away from body copy, uncropping project images, and giving the mobile introduction its own clear space above the instrument.

Representative captures:

- [Desktop threshold](qa/final-home-desktop.png)
- [Mobile threshold](qa/final-home-390.png)
- [Daylight garden](qa/final-garden-desktop.png)
- [Engineering study](qa/final-study-desktop.png)
- [Archive artwork](qa/final-archive-image-detail.png)
- [Mobile contact](qa/final-contact-mobile.png)
- [Still fallback](qa/final-still-desktop.png)

## Deliberate limits

- This is one carefully composed instrument and its immediate landscape, not an open-world game. Camera motion is bounded; the phone view prioritizes a stable composition.
- Planting uses lightweight geometry. Water uses a low-resolution planar reflection rather than a fluid simulation. There is no full-screen postprocessing stack.
- The environmental Ram inscription is small; the final DOM text makes its meaning available without needing to discover a tiny object.
- Actual SMTP delivery and physical-device GPU behavior were not tested. Existing email credentials are still needed for real delivery; third-party project demo uptime is outside this repository.
- The locked dependency tree was retained. The initial installation reported existing dependency advisories; this redesign did not include a dependency migration.
- Retired cosmic components and irreplaceable source assets remain on disk but are not imported by the new visible layout.

## Run locally

```sh
cd "/Users/mackie/Codes /portfolio"
npm ci
npm run dev
```

For a production preview:

```sh
npm run build
npm start
```

The final local production preview is running at http://127.0.0.1:3000. Stop that process or select another port before starting a second server.

To rerun the browser checks on this Codex host:

```sh
PLAYWRIGHT_MODULE=/Users/mackie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs node scripts/verify.mjs
```
