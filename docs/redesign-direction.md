> SUPERSEDED: the user rejected this visual direction. See cosmic-field-journal.md and qa/journal/ for the current design and verification.

# The Quiet Engine

Design and technical direction · 17 September 2026 · `codex/engineering-sanctuary`

## Thesis

A full-stack engineer's work, encountered inside an old instrument that nature is slowly taking back. The instrument is precise; the landscape is not. Engineering takes the foreground. The spiritual center is discovered at the end.

Considered: an underground machine library, a cosmic observatory, and a reclaimed water instrument. Commit to the water instrument: it makes depth, continuity, transactions and interconnected systems physically legible, while the water and garden give the story somewhere quieter to go. No spacecraft, logo planets, glitter, neon cards or mandatory introduction.

## Research and decisions

- [Chand Baori](https://en.wikipedia.org/wiki/Chand_Baori): studied the repeated descending landings, diamond geometry and utilitarian water architecture. Borrow depth and repetition, not a religious monument's identity. Captured a reference screenshot.
- [Carlo Scarpa's Brion sanctuary](https://en.wikipedia.org/wiki/Brion_tomb): studied the relationship between concrete, precise junctions, circular apertures, planting and reflective water. Borrow material joins and framing; do not reproduce its paired-circle motif. Captured a reference screenshot.
- [teamLab Borderless](https://www.teamlab.art/e/tokyo/): continuous environments and perceptual ambiguity; the current Asymmetric Existence description specifically distinguishes physical and reflected space. Borrow continuity and the unreliable reflection, not saturated projection-room visuals.
- [Bruno Simon](https://bruno-simon.com/): inspected the live 3D entrance. A coherent authored world is memorable; retain ordinary scrolling and visible navigation instead of adopting vehicle controls or a start gate. Captured a reference screenshot.
- [OpenAI: Building games with Astra](https://developers.openai.com/blog/how-to-build-games-with-astra): inspected the current showcase and its discussion of uninterrupted descent, Blender assets, draw-call counts, repeatable scene tests and GPU measurements. Adopt measurable rendering and continuity, not its space-game art direction.
- James Turrell's former Skyspace category URL returned 404; it is not counted as a successfully inspected source.
- Current Context7 documentation for React Three Fiber: cached GLTF loading, demand rendering and `invalidate`. Next.js: a small client boundary around a dynamically imported, non-SSR Canvas. Repository UI/UX and Next.js skills used for accessibility and implementation quality, not palette selection.

## Repository and content audit

Next.js 15.5.9 / React 19 / Three.js 0.180 / R3F 9 / Drei 10. Existing routes: home, about, work, contact, thank-you, blog index and markdown article. APIs: contact, GitHub activity, visitor logging, image generation and health. Preserve routes, blog content, contact delivery and useful outbound links.

The previous root layout mounts two continuous WebGL renderers, a loading screen and a visitor-name popup. Its background includes thousands of points, colored nebulae and a satellite; its quality hook is not wired to that root renderer. Homepage and about repeat portraits, technology diagrams and glowing panels. Replace this presentation as one system. Retire the interrupting name-art popup and its automatic visitor flow; keep source assets and API files, without exposing that popup in the redesigned journey. Replace its navigation palette with an accessible native dialog.

Seven existing project records must survive unchanged in identity: AI-Powered Alexa Assistant, Mythos AI Studio, Foxpop.in, MedScan AI, URL Shortener, Prompt Enhancer, Serverless Notification System. Preserve Shiv Cement Store and Technosys experience as well. All existing artwork/source assets remain on disk.

The root `amankeshridotcom.pdf` is newer in content than the public copy despite file-copy timestamps. It includes CodeApto (June 2026–present), Hardware Store ERP, Vartalaap and April 2026 IIT Guwahati certification. This is the canonical resume. Keep the old public resume as a separately named historical file before updating the download. Do not publish the phone number unnecessarily.

New story, supported by that resume:

1. **Build** — Hardware Store ERP: billing, stock, ledger and reporting; six-step PostgreSQL transactions and row locks; PDF work moved to BullMQ/Redis; private S3; deployed Ubuntu/RDS/CloudFront.
2. **Understand systems** — CodeApto P2P: React/TypeScript, Rust/Axum, PostgreSQL, tenant-specific data, guarded workflow transitions, sourcing and supplier onboarding. No proprietary screenshots, internal identifiers, client data or invented metrics.
3. **Ship and operate** — Vartalaap: authenticated WebSockets, DynamoDB access patterns and independent fan-out; Technosys: AWS, Docker and GitHub Actions deployment/rollback workflows.

Do not carry forward unsupported superlatives, guarantees such as “tamper-proof,” or old percentage improvements as current claims. Older project descriptions remain factual, without asserting medical reliability or present uptime of third-party demos.

## Journey and composition

**Threshold.** Dark basalt, a warm oblique rim and a monumental interrupted stone annulus above water. Large, deliberately asymmetric typography on the left; architecture on the right. Name, engineering role, work link and resume immediately available. Signature: the ring's fine brass inner mechanism seen through a rough stone outer body.

**Works.** Descend toward the terraced foundation. Three differently paced engineering studies, with short visible summaries and native expandable details. Architecture diagrams explain the actual transaction or flow; no company imagery invented. The instrument remains spatially continuous behind the page.

**Archive.** A compact, searchable collection of all seven earlier projects plus Shiv Cement Store, with real images and links inside expandable records. Each can be linked directly and opened by keyboard. No identical floating cards. The view rises toward daylight; moss and mineral surfaces become legible.

**Ground.** The camera settles across the water; a tiny inscription is visible in the architecture. Final text: complex work, a simpler center. `राम` appears quietly here with an accessible translation. Contact and ordinary navigation remain clear.

Desktop sketch:

```
name / engineer                         work  about  notes  contact / resume

Engineering                       weathered stone aperture
with depth.                        / brass / roots / water
short factual introduction
selected work →   resume

scroll to descend                               The Quiet Engine / view control
```

## Visual language

Palette: basalt `#111a19`, deep water `#1b302e`, weathered stone `#9b9f90`, oxidized brass `#b8a078`, soft chalk `#e8e8de`, leaf `#52664c`. Light shifts from moonlit mineral green to grazing warm daylight; no purple/cyan neon. Small color aberrations occur at a physical aperture, never as page-wide filters.

Type: Manrope for legible engineering content and substantial headings; Instrument Serif italic for a few quiet words; IBM Plex Mono for dates, chapter labels and system annotations. Devanagari uses a local/system-capable fallback. Body copy stays at least 16px, metadata at least 12px. Headings use restraint rather than marketing slogans.

Materials: chipped block seams, rough stone normals, aged brass ribs, an engineered stepped basin, asymmetric roots and low planting. Lighting and silhouette matter more than polygon count. Geometry repeatability creates a recursive, almost impossible inner aperture; a reflection has a subtle independent rhythm. No literal drug symbolism. No audio and no portraits.

## Camera, interaction and responsibilities

One persistent canvas on the home journey, under semantic server-rendered content. The camera follows measured chapter positions with damped movement, never wheel interception or scroll hijacking. Camera targets follow the instrument, not the text. Movement is reversible and interruption-safe. Pointer exploration is modest; an explicit inspect mode rotates the instrument and returns to the reading view. The visible control also works on touch and keyboard.

DOM owns headings, links, archive search, native disclosures, form validation, navigation, resume, reading order and focus. Three.js owns spatial geometry, lighting, reflection and bounded camera interpolation. No WebGL-only project navigation. Subpages share the type/material language and stay lighter than the main journey.

## Blender deliverables

Use the user's connected Blender MCP bridge on local port 9876. The original default scene is preserved; create a separate named scene. Author a reusable interrupted stone instrument, stepped foundation and root/plant assembly, grouped into a small number of material meshes. Store editable `.blend` and deterministic source script under `assets/blender/`; optimized GLB and rendered fallback under `public/sanctuary/`. Keep web geometry below approximately 120k triangles and below 3 MB when practical. No network-loaded models or runtime texture CDN. Water/reflection and camera animation stay in Three.js.

## Performance and accessibility

Content and a locally rendered still are visible before WebGL. Dynamic import delays the renderer; no blocking loader. Cap DPR at 1.5, lower it for narrow/touch/low-core devices and sustained slow frames. Avoid full-screen postprocessing and particle systems. Pause rendering when the tab is hidden; render on demand when there is no motion to show. Cache shared geometry/materials and dispose owned resources.

Reduced-motion and Save-Data start with the still version and preserve every piece of content. A visible still/motion control remains available. WebGL failure, context loss and asset failure return to the image, never an empty page or an error overlay. No browser/GPU fingerprint collection. Mobile uses a centered sculpture above a compact text block and standard vertical reading; remove pointer parallax. No horizontal scroll, min 44px controls, visible keyboard focus, skip link and accessible dialog/disclosure semantics.

## Verification plan

Run lint, TypeScript and production build. Capture desktop 1440×900 and wide, mobile 390×844 and 360px views at threshold, study, archive and final reveal. Test camera continuity, interruption, inspection, archive search/disclosure, project retention, route navigation, contact validation without sending mail, latest resume, keyboard escape/focus, reduced motion, WebGL disabled, asset failure and context loss. Collect renderer counts and browser frame intervals; report these as measurements of this machine, not universal performance claims. Record exact compromises and commands in the final QA report.
