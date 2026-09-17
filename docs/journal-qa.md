# Cosmic Field Journal — implementation verification

The previous design was rejected. This report describes the replacement built from the user's ten answers. Implementation and technical verification are complete; this is not a claim of user design approval. Nothing has been deployed.

## Result

- 61 browser assertions passed; no runtime exceptions in normal journeys.
- Production build, ESLint, TypeScript and `git diff --check` passed.
- Visual inspection at 1440×900 and phone sizes; layout checks at 360, 390, 768 and 1920 pixels wide. Screenshots in `qa/journal/`.
- All eight archived projects, three detailed engineering studies, architecture links, blog/article routes and newest resume retained.
- Keyboard page finder, native mobile menu/focus return, search and disclosures, object controls, independent-delivery demonstration and Ram Naam discovery verified.
- Contact validation, failed-send draft retention and success route verified with mocked HTTP responses. No real messages sent.
- Reduced motion skips WebGL/model downloads. Unavailable WebGL, missing models and context loss return to the rendered still. No-JavaScript content retains all eight archived projects.

## Performance and assets

| Object | GLB bytes | Meshes |
| --- | ---: | ---: |
| satellite | 290,608 | 5 |
| circuit | 446,164 | 16 |
| prism | 39,108 | 3 |

The renderer mounts only near visible studies; DPR is capped at 1.5. Shared geometry is merged by material and circuit layer. The illustrated landscape uses Next.js responsive image delivery, with a larger mobile source to preserve detail in the deliberate crop. Room lighting is generated locally, without an external environment-map request.

On this Mac in headless Chrome at 1440×900, mean frame interval was 16.67 ms and p95 was 18.20 ms. This is not a physical-phone benchmark or a guarantee for all devices.

## Deliverables

- `docs/concepts.png`: three contrasting visual concepts (study copy is illustrative).
- `docs/cosmic-field-journal.md`: chosen direction, rationale and research.
- `assets/blender/observatory-studies.blend`: editable Blender objects.
- `public/observatory/`: optimized models, fallback images and cosmic illustration.
- `scripts/verify-journal.mjs`: repeatable full browser check.
- `docs/qa/journal/verification.json`: individual assertions and screenshots.

Production preview runs at http://127.0.0.1:3000. Work remains uncommitted on `codex/engineering-sanctuary`, preserving original assets and previous rejected work for recovery.
