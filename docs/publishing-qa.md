# Publishing release verification

Local production build verified on 17 September 2026.

- TypeScript: no errors. ESLint: no errors or warnings. Production build: passed.
- Production dependency audit: zero vulnerabilities. Next.js 15.5.25; patched PostCSS override resolves to 8.5.28.
- Journal: 61 checks; refinement: 21; responsive layouts: 302; object controls and sample blogs: 89.
- Private publishing: 42 checks, including actual browser login, Markdown import, private drafts, publishing, private revisions, conflicts, unpublishing, origin enforcement, validation, safe Markdown, expired/revoked sessions, article SEO and social images. Total: 515 checks.
- Editor verified at 320, 390, 760, 943 and 1440 pixels. Public-page suite covers 14 sizes. Desktop/mobile editor screenshots are in `docs/qa/publishing/`.
- No real contact email was sent; the existing contact flow was tested with mocked responses. Database checks use isolated QA articles and remove them afterward.
- Author image URLs intentionally use native browser images instead of server-side image fetching. The relevant lint exceptions are documented next to those components.
- Credential files remain ignored and local. The editor password hash is configured in Vercel’s production environment.

Run the scripts in README and the publishing guide to reproduce the checks. Legacy screenshots/documentation from earlier design stages are retained as design history; the journal and publishing reports describe the current site.
