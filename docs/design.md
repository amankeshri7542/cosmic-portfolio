# Design: "Build a product with me"

Every visitor gets the same story. The home page builds one product in front of them as they scroll —
interface → API → data → ship to the cloud → applied AI → running — and each step names the tools Aman used,
what he actually knows about them, and the real project where he did it. Then: shipped projects, experience,
writing, and an invitation to build theirs.

- Look: dark, precise, one warm accent. Near-black panels on a faint engineering grid; saffron (#FF9F1C) marks
  action and data in motion; green (#3DDC97) only means "done / healthy". Type: Bricolage Grotesque (display and
  text, optical sizes) and JetBrains Mono (code, labels, the build log). Real tech logos from Devicon (MIT).
- Stage: `components/story/Stage.tsx` — an SVG billing app for a hardware store (the shape of the real ERP): invoice
  screen → API with auth/role/state checks → one PostgreSQL transaction writing invoice, stock and ledger together,
  plus a Redis queue → Docker, a CI pipeline and AWS → a RAG assistant answering a Hinglish stock question.
- Motion: `components/story/StoryMotion.tsx` — GSAP ScrollTrigger scrubs each step against its chapter (scrolling back
  un-builds it); MotionPath packets travel the wires; Lenis smooths wheel scrolling on desktop. GSAP loads after
  hydration. Reduced motion and no-JS show the finished product; chapter text is ordinary HTML in reading order.
- Content: `content/story.ts` (story), `content/profile.ts` and `content/work.ts` (verified facts). No invented metrics.

Verification on the local production build (10 Oct 2026): lint, types clean; 73/73 unit + integration; 65/65
Playwright (desktop + Pixel 7) including the story scroll test, reduced motion, no-JS, axe WCAG 2.2 AA and the full
publishing workflow; Lighthouse mobile: home 89, work 95, article 96 performance; accessibility, best practices and
SEO 100; CLS 0.
