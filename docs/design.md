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

## The visitor's own run (interactive layer)

The visitor is the first customer of the product being built. One client store (`components/story/store.ts`) carries
their choices through every layer, so each step works on the same bill:

| Step | What they do | What it proves |
| --- | --- | --- |
| Interface | Name their shop, add items; the bill and total update on the stage | React UI, state carried end to end |
| API | Send the invoice as cashier or intern; auth → role → state checks light up; 201 / 403 / 422 | RBAC and guarded transitions, enforced server-side |
| Data | Commit; cut the power (rollback); turn the transaction off (stock and invoice land, ledger never does: out of sync) | PostgreSQL transactions, row locks, why atomicity matters |
| Ship | Push to main; break a test and the pipeline stops before production; versions bump | CI/CD with GitHub Actions and Docker |
| Applied AI | Ask in Hinglish; answers come from this page's stock and ledger, including their sale | RAG grounded in business data (simulated, labelled) |
| Run | Kill api-1; traffic moves to api-2 and it recovers | Health checks and failure containment |

Each chapter has a "Your turn" panel with one or two variables, a spoken result line that explains what just happened,
and small goals (11 in total), following samwho.dev / Sam Rose's "now try to break it" pattern. "Read the code" shows
a real-shaped snippet per layer (Rust/Axum, SQL transaction, GitHub Actions…), highlighted at build time.

After the story, a thermal receipt prints the visitor's run (bill, refusals, rollbacks, versions, recoveries, goals),
and a brief builder turns "what do you need built?" into a plan with past projects as proof and a prefilled
contact message. The step rail is clickable; a "Motion on/off" toggle sits beside the OS reduced-motion setting.

Deliberately not added (research: high gimmick risk): terminal/OS metaphors, invented metrics, a live LLM.

Verification on the local production build (10 Oct 2026): lint and types clean; 73/73 unit + integration;
72/72 Playwright (desktop + Pixel 7): a full interactive run, keyboard operation, brief → contact prefill, Motion
toggle, scroll build and un-build, reduced motion, no-JS, axe WCAG 2.2 AA on every page, and the full publishing
workflow. Lighthouse mobile: home 91, work 94 performance; best practices and SEO 100; CLS 0.
