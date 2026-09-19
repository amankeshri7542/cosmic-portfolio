# Engineering-first redesign

Audience: hiring teams and clients. Purpose: show Aman can understand a business problem, build its product end to end, and operate it in production.

Palette: midnight #080B17, glass navy #131B30, pearl #EEF0FF, lavender #B9A0FF, ice teal #88DCD7, muted slate #A0A7C1. Dark translucent surfaces reveal a restrained interference field, with no planetary scenery.

Type: Sora for concise display headlines; Manrope for explanations; IBM Plex Mono for technology and architecture labels. Existing handwritten annotations stay only within explanatory illustrations.

Layout: split introduction and interactive stack, immediately followed by visible technology logos; full case studies; three applied AI projects; end-to-end working approach; searchable archive; technical writing; contact.

Signature: four translucent CSS 3D planes represent interface, backend/data, AI and cloud. Selecting a plane explains real work using those technologies and links to evidence. It is lightweight HTML/CSS, keyboard-accessible and still under reduced motion. No WebGL dependency or model download is needed for the new homepage.

Critique: floating logos alone would be another decorative tech cloud. Connecting every layer to an actual project makes the illustration useful. Avoid promises of limitless capacity; show transactions, queues, caching, deployment and failure isolation as concrete evidence of designing for growth.

Release approved: the user reviewed the local design and requested publishing to GitHub and Vercel.

## Local verification

Background extension: one continuous ribbon carries the existing technology logos through projected depth. Keep the palette and typography above; violet/teal strands sit at the right edge, with a quieter, narrower composition on phones. Critique: an all-over logo cloud would compete with the projects, so the ribbon leaves the introduction clear and uses no extra particles or ornaments. Native canvas caps pixel density and drawing at 30 fps; reduced motion and hidden-tab suspension are built in. No dependency or model downloads.

Production build, TypeScript and lint pass. The current browser suite passes 134 checks: eleven routes at six viewport widths, stack selection and keyboard controls, mobile menu, project search, case-study expansion, message-delivery demonstration, image loading and reduced motion. The 3D planes are also checked against their frame bounds at 320, 390 and 760 pixels. Background checks cover changing rendered frames, continuous motion without pause controls, reduced motion, responsive canvas size, pointer transparency and content functionality without canvas.

The local database hostname was unavailable during this design pass. Preview is served with `POSTGRES_URL=` so it uses the repository Markdown articles. This deliberately does not change production database behavior; private-editor sign-in is not connected in the local design preview.

Preview: http://127.0.0.1:3000/. Final screenshots and verification report are in `docs/qa/engineering/`.
