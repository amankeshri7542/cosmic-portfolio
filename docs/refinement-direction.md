# Field journal refinement

The user likes the overall design and requested more visible psychedelic inspiration, personality and an easier-to-find blog. They clarified that the blog link was hard to find. Browser reproduction: `/blogs` and `/blogs/aws-db` both returned 200 and rendered content; the navigation called the destination Notes and scrolled out of view.

## Changes

- Keep the accepted layout, typography and midnight/blue-paper palette. Strengthen the coral, ochre and teal geological ribbons in the existing illustration, preserving its composition and quiet left side. Retain the original image alongside the revised asset.
- Add a purposeful moiré study: two overlapping curved line fields, slow optional drift and a keyboard-accessible alignment control. New patterns emerge from a change in alignment. No circular portal, drug imagery or religious wallpaper.
- Name the destination Blog in desktop/mobile navigation and the page finder. Keep the header available while scrolling and mark Blog active on articles.
- Add a prominent, real article preview on the homepage; reuse the same article treatment on the blog index. Its diagrams relate to the published AWS database article. Add no fictional articles.
- Keep all work descriptions, project links, original article content, resume and the small Ram Naam detail.

## Verification

Reproduce the discoverability regression with a browser check requiring a Blog navigation link and homepage entry. Check navigation on desktop/mobile and article return path; verify fixed-header visibility while scrolled. Check optical controls, pause, reduced motion, mobile layout and normal runtime errors. Run existing full checks plus build/lint/type checks.

Regression evidence: the new browser check failed against the previous running build with “Blog is explicitly named in navigation”; the route itself was healthy. This isolates the reported issue to discoverability.

The new checks cover 360, 390, 768 and 1920px layouts. The optical study is native SVG/CSS with no new dependencies or WebGL context, and the manual alignment control remains usable with reduced motion. The article wording and metadata are unchanged.

## Final verification

- 21 refinement checks passed, plus all 61 existing journal checks: 82 total, no normal runtime errors.
- Production build, TypeScript validation, ESLint and diff whitespace check passed.
- Inspected desktop, mobile, blog and optical-study screenshots; confirmed opaque navigation after scrolling.
- Contact tests remained mocked; no emails sent. No production deployment or commit made.
- Preview: http://127.0.0.1:3000 ; blog: http://127.0.0.1:3000/blogs .
