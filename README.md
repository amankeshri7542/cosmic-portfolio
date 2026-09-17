# Aman Kumar — Cosmic Field Journal

An illustrated portfolio with an etched planetary landscape, engineering diagrams and three small, meaningful Blender studies. Next.js 15, React 19 and React Three Fiber. No production deployment has been made.

## Run

```sh
npm ci
npm run dev
```

Production preview: `npm run build` followed by `npm start`. Open http://localhost:3000.

## Verify

```sh
npm run lint
npx tsc --noEmit
npm run build
```

`scripts/verify-journal.mjs` runs the current browser checks. Point `PLAYWRIGHT_MODULE` to an installed Playwright module if it is not in the local dependencies. `PORTFOLIO_URL` defaults to http://127.0.0.1:3000. Contact requests are mocked; verification sends no real messages. Results and screenshots are saved in `docs/qa/journal/`.

## Content and visuals

- `lib/portfolio.ts`: verified resume facts and every preserved project.
- `components/observatory/`: lazy visible-object renderers, native controls, illustrated delivery demonstration and scroll effects.
- `public/observatory/`: cosmic illustration, three model exports and matching stills. Images are served through Next.js image optimization.
- `assets/blender/observatory-studies.blend`: editable object studies. See the adjacent Python builders and optimization script.
- `docs/cosmic-field-journal.md`: revised direction and research; `docs/concepts.png`: three contrasting concept studies.
- The newest resume is served at `/amankeshridotcom.pdf`; the previous public resume is retained separately.

Reduced motion keeps static illustrations and avoids WebGL/model downloads. Render failures retain the relevant still, project content and navigation. Model rendering pauses by unmounting when outside the viewport. No audio, portrait, blocking loader or visitor-name popup.

The contact endpoint retains the existing SMTP configuration (`EMAIL_USER`, `EMAIL_PASS`). Optional legacy image generation returns 503 when unconfigured. Credentials are not needed to view the portfolio.

## Refinement

The Blog now has explicit persistent navigation and a homepage article preview. The revised landscape and interactive moiré study add visible psychedelic influences through color, flowing contours and perception. `scripts/verify-refinement.mjs` covers these additions; see `docs/refinement-direction.md` and `docs/qa/refinement/`.

## Responsive verification

`scripts/verify-responsive.mjs` checks every page at 14 viewport sizes, expanded diagrams and mobile touch interactions. Use the same `PLAYWRIGHT_MODULE` and `PORTFOLIO_URL` settings as the other browser checks. See `docs/responsive-qa.md` and `docs/qa/responsive/` for results.

## Object controls and sample essays

Three illustrated sample essays accompany the original AWS article. Object sliders also work with rendered views when WebGL is unavailable. `scripts/verify-controls-blogs.mjs` covers these changes; see `docs/controls-and-sample-blogs.md` for the reproduction and verification.

## Historical work

The previous Quiet Engine direction, its assets, reports and old verification script are retained for recovery, but are superseded and not used by the current visible site. The user rejected that direction. Current QA refers only to `verify-journal.mjs` and `docs/qa/journal/`.

## Private editor and SEO

Open `/write` to create, preview, save and publish Markdown articles. See [the publishing guide](docs/publishing-seo-plan.md) for usage, configuration, password rotation and content storage. Blog changes publish immediately from Postgres; code changes deploy through GitHub/Vercel.
