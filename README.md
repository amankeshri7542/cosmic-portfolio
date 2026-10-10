# amankeshri.com

Aman Kumar's portfolio, blog and private publishing desk.

- Home: a scroll story that builds one product in front of you — interface, API, data, cloud, applied AI, running —
  naming the tools, what Aman knows about them, and the real project behind each step. GSAP ScrollTrigger + SVG.
- Work: three engineering case studies with working instruments you can break (transactions and row locks, guarded
  workflow transitions, fan-out with `Promise.allSettled`), plus every other project.
- Blog rendered by one Markdown pipeline (unified + Shiki), statically cached and invalidated by tag on publish.
- `/write`: a private editor with autosave, an on-device mirror, conflict handling, revisions, image uploads,
  private preview links, publish/unpublish, and slug renames with permanent redirects.

## Stack

Next.js 16 (App Router, Cache Components), React 19, TypeScript, plain CSS (tokens, modules, cascade layers),
GSAP + Lenis for motion, postgres.js on Neon, Vercel Blob, nodemailer. Tests: Vitest and Playwright (+ axe).

## Commands

```bash
npm run dev          # http://localhost:3000
npm run build && npm start
npm run lint && npm run typecheck
npm test             # unit + integration (needs a local Postgres for integration tests)
npm run e2e          # Playwright against `next start` on :3001
npm run db:migrate   # apply db/migrations (refuses production without explicit flags)
```

## Environment

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` / `DATABASE_URL_UNPOOLED` | Postgres (Neon in production; any local Postgres in development) |
| `EDITOR_PASSWORD_HASH` | `npm run -s hash-password` output (escape `$` as `\$` in `.env` files) |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob for editor uploads |
| `EMAIL_USER`, `EMAIL_PASS` | Gmail transport for the contact form; `CONTACT_TRANSPORT=log` to only log |
| `CONTACT_SECRET` | Signs the contact form's timing token |
| `SHORTENER_ORIGIN` | URL-shortener app mounted at `/url-shortner`, `/api/shorten` and 6-character codes |

Without a database the site reads the seed essays in `content/posts/`.

## Layout

```
app/(site)/    public pages (home, work, about, blogs, contact, preview)
app/write/     the private editor        app/api/   contact, health, editor/*
components/    story, home, plates, sims, prints, blog, write
content/       verified profile and project data
lib/           db, posts, markdown, seo, editor/*
components/story  the home scroll story   motion/    optional, idle-loaded enhancements
db/migrations  additive SQL               scripts/   migrate, seed, stars, poster, subset font
tests/         unit, integration, e2e
```

Design and verification notes: `docs/design.md`.
