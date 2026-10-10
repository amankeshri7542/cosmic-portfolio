"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { needs } from "@/content/briefs";
import { CATALOGUE, goalCount, inr, shopName, story, total, useStory } from "@/components/story/store";
import styles from "./BuildYours.module.css";

const today = () => new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
const noop = () => () => {};
const pad = (a: string, b: string, w = 34) => a + " ".repeat(Math.max(1, w - a.length - b.length)) + b;

/** The receipt of the visitor's own run, and a brief builder that turns "build yours" into a message. */
export function BuildYours() {
  const s = useStory((x) => x);
  const [picked, setPicked] = useState<string[]>([]);
  const [printed, setPrinted] = useState(false);
  const receipt = useRef<HTMLDivElement>(null);
  const goals = goalCount(s);
  const date = useSyncExternalStore(noop, today, () => ""); // the visitor's day, not the build's
  const touched = s.stats.requests + s.stats.commits + s.stats.rollbacks + s.stats.partials + s.stats.deploys + s.stats.blocked + s.stats.asked + s.stats.recoveries > 0 || s.shop !== "";

  useEffect(() => {
    const el = receipt.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setPrinted(true); io.disconnect(); } }, { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const chosen = needs.filter((n) => picked.includes(n.id));
  const stack = [...new Set(chosen.flatMap((n) => n.stack))];
  const proof = [...new Map(chosen.map((n) => [n.proof.name, n.proof])).values()];
  const no = s.invoices.at(-1)?.no ?? 1041;

  const lines = [
    pad(`BILLING.STORE`, `v${s.version}`),
    pad(`TAX INVOICE #${no}`, date),
    `Customer: ${shopName(s)}`,
    "-".repeat(34),
    ...s.cart.map((l) => pad(`${CATALOGUE[l.sku].name.slice(0, 18)} ×${l.qty}`, inr(CATALOGUE[l.sku].price * l.qty))),
    "-".repeat(34),
    pad("TOTAL", inr(total(s))),
    "=".repeat(34),
    "WHAT YOU DID",
    pad("requests sent", `${s.stats.requests}${s.stats.denied ? ` (${s.stats.denied} refused)` : ""}`),
    pad("sales committed", String(s.stats.commits)),
    pad("rollbacks survived", String(s.stats.rollbacks)),
    pad("out-of-sync writes", String(s.stats.partials)),
    pad("versions shipped", `${s.stats.deploys}${s.stats.blocked ? ` (${s.stats.blocked} stopped)` : ""}`),
    pad("questions asked", String(s.stats.asked)),
    pad("servers recovered", String(s.stats.recoveries)),
    pad("goals", `${goals.done} / ${goals.total}`),
    "-".repeat(34),
  ];

  return (
    <section id="receipt" className={`shell ${styles.wrap}`} aria-labelledby="receipt-title">
      <div className={styles.left}>
        <p className="label label--caps">Your receipt</p>
        <h2 id="receipt-title">{touched ? "You built it — and broke it properly." : "Here’s the bill so far."}</h2>
        <p className={styles.sub}>
          {touched
            ? "Every line below is something you did on this page. The same habits — checks on the server, one transaction, a pipeline that stops bad code — go into everything I ship."
            : "Scroll back up and press a few things — every control in the story works, and this receipt fills in as you go."}
        </p>
        <div ref={receipt} className={styles.printer} data-printed={printed || undefined}>
          <div className={styles.slot} aria-hidden="true" />
          <div className={styles.paper}>
            <pre aria-label={`Receipt for ${shopName(s)}`}>{lines.join("\n")}</pre>
            <p className={styles.thanks}>Built with React · Rust/Axum · PostgreSQL · Redis · Docker · AWS · RAG</p>
            <p className={styles.thanks}>Thank you for shopping. — Aman</p>
          </div>
        </div>
        <p><button type="button" className={styles.reset} onClick={() => { story.reset(); document.getElementById("interface")?.scrollIntoView({ behavior: "smooth" }); }}>Start a new run ↑</button></p>
      </div>

      <div className={styles.right}>
        <p className="label label--caps">Now let’s build yours</p>
        <h2 className={styles.h2}>What do you need built?</h2>
        <div className={styles.needs} role="group" aria-label="Pick what you need">
          {needs.map((n) => {
            const on = picked.includes(n.id);
            return (
              <button key={n.id} type="button" aria-pressed={on} className={styles.need} onClick={() => setPicked((p) => (on ? p.filter((x) => x !== n.id) : [...p, n.id]))}>
                {on ? "✓ " : "+ "}{n.label}
              </button>
            );
          })}
        </div>
        <div className={styles.plan} aria-live="polite">
          {chosen.length === 0 ? (
            <p className={styles.muted}>Pick one or more — I’ll show how I’d start and where I’ve done it before.</p>
          ) : (
            <>
              <p className="label">How I’d start</p>
              <ul role="list" className={styles.stack}>{stack.map((t) => <li key={t}>{t}</li>)}</ul>
              <p className="label">I’ve done this before</p>
              <p className={styles.proof}>{proof.map((p) => <Link key={p.name} href={p.href}>{p.name}</Link>)}</p>
            </>
          )}
        </div>
        <div className={styles.actions}>
          <Link className="button button--solid" href={chosen.length ? `/contact?brief=${picked.join(",")}` : "/contact"}>
            {chosen.length ? "Send this brief" : "Start a conversation"}
          </Link>
          <a className="button" href="mailto:amankeshri7479@gmail.com">Email instead</a>
        </div>
        <p className={`label ${styles.quiet}`}><span lang="hi">राम</span> · curiosity in the work, a constant underneath</p>
      </div>
    </section>
  );
}
