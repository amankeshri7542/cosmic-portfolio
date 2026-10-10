"use client";

import { CATALOGUE, GOALS, QUESTIONS, inr, shopName, story, total, useStory, type Sku } from "./store";
import styles from "./Controls.module.css";

/** One small, working control panel per chapter. Everything it changes shows up on the stage. */
export function StepControls({ id }: { id: string }) {
  const s = useStory((x) => x);
  const panel = (instruction: string, body: React.ReactNode, result: string, tone?: "ok" | "fail" | "wait") => (
    <div className={styles.panel} role="group" aria-label="Your turn">
      <p className={styles.head}><span className={styles.tag}>Your turn</span> {instruction}</p>
      <div className={styles.row}>{body}</div>
      <p className={styles.result} data-tone={tone} aria-live="polite">{result}</p>
      {GOALS[id] && (
        <ul role="list" className={styles.goals} aria-label="Goals">
          {GOALS[id].map((g) => {
            const done = g.done(s);
            return <li key={g.label} data-done={done || undefined}><span aria-hidden="true">{done ? "●" : "○"}</span> {g.label}<span className="visually-hidden">{done ? " — done" : ""}</span></li>;
          })}
        </ul>
      )}
    </div>
  );

  if (id === "interface") {
    const extra = (Object.keys(CATALOGUE) as Sku[]).filter((k) => k !== "OPC53");
    return panel(
      "Name your shop and fill the bill.",
      <>
        <label className={styles.field}>
          <span className="visually-hidden">Your shop’s name</span>
          <input value={s.shop} onChange={(e) => story.setShop(e.target.value)} placeholder="Your shop’s name" maxLength={22} autoComplete="off" />
        </label>
        {extra.map((k) => {
          const inCart = s.cart.some((l) => l.sku === k);
          return (
            <button key={k} type="button" className={styles.chip} aria-pressed={inCart} onClick={() => (inCart ? story.remove(k) : story.add(k))}>
              {inCart ? "✓ " : "+ "}{CATALOGUE[k].name}
            </button>
          );
        })}
      </>,
      `${shopName(s)}: ${s.cart.length} item${s.cart.length === 1 ? "" : "s"}, ${inr(total(s))}.`,
    );
  }

  if (id === "api") {
    const r = s.request;
    const result =
      r.phase === "running" ? "Checking: auth, then role, then state…" :
      r.code === 201 ? "201 Created — signed in, allowed, and the bill is valid." :
      r.code === 403 ? "403 Forbidden — interns can read bills, not create them. Checked on the server, not just hidden in the UI." :
      r.code === 422 ? "422 — the bill is empty. Add an item first." :
      "Send the bill. Try it as an intern, too.";
    return panel(
      "Send the invoice to the API.",
      <>
        <div className={styles.seg} role="radiogroup" aria-label="Signed in as">
          {(["cashier", "intern"] as const).map((r) => (
            <button key={r} type="button" role="radio" aria-checked={s.role === r} onClick={() => story.setRole(r)}>
              {r === "cashier" ? "Cashier" : "Intern"}
            </button>
          ))}
        </div>
        <button type="button" className="button button--solid" onClick={() => story.send()} disabled={r.phase === "running"}>
          Send invoice
        </button>
      </>,
      result,
      r.code === 201 ? "ok" : r.phase === "fail" ? "fail" : r.phase === "running" ? "wait" : undefined,
    );
  }

  if (id === "data") {
    const t = s.txn;
    const first = s.cart[0];
    const short = s.cart.find((l) => s.stock[l.sku] < l.qty);
    const result =
      t.phase === "running" ? "BEGIN — rows locked, writing invoice, stock and ledger…" :
      t.phase === "ok" ? `Committed #${t.invoiceNo}: all three records written together.${first ? ` ${CATALOGUE[first.sku].name} stock now ${s.stock[first.sku]}.` : ""}` :
      t.phase === "fail" ? (short ? `Rolled back — not enough ${CATALOGUE[short.sku].name}. Nothing was written.` : "Rolled back — the power went mid-write. No invoice, no stock change, no ledger entry. Nothing half-done.") :
      t.phase === "partial" ? `Out of sync. Invoice #${t.invoiceNo} exists and the stock went down, but the ledger never heard about it — ${shopName(s)} now owes nothing on paper. This is why the writes share one transaction.` :
      "Commit the sale. Then cut the power and try again.";
    return panel(
      "Write the sale — or watch it refuse to half-happen.",
      <>
        <label className={styles.switch}>
          <input type="checkbox" role="switch" checked={s.powerCut} onChange={(e) => story.setPowerCut(e.target.checked)} />
          <span>Cut the power mid-write</span>
        </label>
        <label className={styles.switch}>
          <input type="checkbox" role="switch" checked={!s.atomic} onChange={(e) => story.setAtomic(!e.target.checked)} />
          <span>Without a transaction</span>
        </label>
        <button type="button" className="button button--solid" onClick={() => story.commit()} disabled={t.phase === "running" || s.cart.length === 0}>
          Commit the sale
        </button>
      </>,
      result,
      t.phase === "ok" ? "ok" : t.phase === "fail" || t.phase === "partial" ? "fail" : t.phase === "running" ? "wait" : undefined,
    );
  }

  if (id === "ship") {
    const p = s.pipeline;
    const result =
      p.phase === "running" ? ["Pushed. Running tests…", "Running tests…", "Building the image…", "Deploying to ap-south-1…"][p.stage] ?? "Deploying…" :
      p.phase === "ok" ? `v${s.version} is live — tests, build and deploy all passed.` :
      p.phase === "fail" ? `A test failed, so the line stopped. Production is still on v${s.version}.` :
      "Push a change. Then break a test and push again.";
    return panel(
      "Ship a change to production.",
      <>
        <label className={styles.switch}>
          <input type="checkbox" role="switch" checked={s.brokenTest} onChange={(e) => story.setBrokenTest(e.target.checked)} />
          <span>Break a test</span>
        </label>
        <button type="button" className="button button--solid" onClick={() => story.push()} disabled={p.phase === "running"}>
          Push to main
        </button>
      </>,
      result,
      p.phase === "ok" ? "ok" : p.phase === "fail" ? "fail" : p.phase === "running" ? "wait" : undefined,
    );
  }

  if (id === "ai") {
    return panel(
      "Ask the shop assistant — in Hinglish if you like.",
      <>
        {QUESTIONS.map((q) => (
          <button key={q} type="button" className={styles.chip} aria-pressed={s.ai.question === q} onClick={() => story.ask(q)} disabled={s.ai.phase === "running"}>
            {q}
          </button>
        ))}
      </>,
      s.ai.phase === "running" ? "Retrieving from stock and ledger…" : s.ai.answer ?? "It answers only from this page’s data — including the sale you just made.",
      s.ai.phase === "ok" ? "ok" : undefined,
    );
  }

  if (id === "run") {
    const down = !s.api.a;
    return panel(
      "Break something in production.",
      <>
        <button type="button" className={`button ${styles.danger}`} onClick={() => story.killServer()} disabled={down}>
          {down ? "Recovering…" : "Kill api-1"}
        </button>
        <button type="button" className="button" onClick={() => story.reset()}>Start over</button>
      </>,
      down ? "api-1 failed its health check. Traffic moved to api-2; a fresh api-1 is starting." : s.stats.recoveries ? "Recovered: 2 of 2 servers healthy, and no request was dropped." : "Kill a server and watch the system route around it.",
      down ? "wait" : s.stats.recoveries ? "ok" : undefined,
    );
  }
  return null;
}
