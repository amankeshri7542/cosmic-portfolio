"use client";

import { useId, useState } from "react";
import { Log } from "./Log";
import { useRunner, type LogLine } from "./useRunner";
import s from "./Sim.module.css";

type Invoice = { no: number; counter: "A" | "B"; amount: number };
type Snap = {
  stock: number;
  stockDraft: number | null;
  invoices: Invoice[];
  invoiceDraft: Invoice[];
  owed: number;
  owedDraft: number | null;
  lock: null | "A" | "B";
  A: string;
  B: string;
};
type Step = { snap: Partial<Snap>; say?: [string, LogLine["tone"]?, string?] };

const PRICE = 420;
const initial: Snap = { stock: 3, stockDraft: null, invoices: [], invoiceDraft: [], owed: 0, owedDraft: null, lock: null, A: "idle", B: "idle" };
const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/**
 * Plate I instrument: one sale writes three records inside one PostgreSQL transaction.
 * Pull the plug mid-way and nothing is half-written; race two counters for the last bag and
 * the row lock decides. Turn the lock off to see why it is there.
 */
export function CommitSim() {
  const [snap, setSnap] = useState<Snap>(initial);
  const [failAt, setFailAt] = useState<"none" | "invoice" | "stock">("none");
  const [locking, setLocking] = useState(true);
  const { busy, log, say, run, clear } = useRunner(560);
  const id = useId();

  const play = (steps: Step[]) => {
    let acc = snap;
    run(
      steps.map((st) => () => {
        acc = { ...acc, ...st.snap };
        setSnap(acc);
        if (st.say) say(...st.say);
      }),
    );
  };

  function sell() {
    const s0 = snap;
    const nextNo = (s0.invoices.at(-1)?.no ?? 1040) + 1;
    const inv: Invoice = { no: nextNo, counter: "A", amount: PRICE };
    const steps: Step[] = [
      { snap: { A: "BEGIN" }, say: ["BEGIN;", "sql", "A"] },
      { snap: { lock: "A", A: "locked stock row" }, say: [`SELECT qty FROM stock WHERE sku='OPC-53' FOR UPDATE; → ${s0.stock}`, "sql", "A"] },
    ];
    if (s0.stock < 1) {
      steps.push({ snap: { A: "out of stock" }, say: ["qty is 0 — refuse the sale", "fail", "A"] });
      steps.push({ snap: { lock: null, A: "rolled back" }, say: ["ROLLBACK; nothing changed", "note", "A"] });
      return play(steps);
    }
    steps.push({ snap: { invoiceDraft: [inv], A: "writing invoice" }, say: [`INSERT INTO invoices … #${nextNo}`, "sql", "A"] });
    if (failAt === "invoice") return play([...steps, ...rollback("A")]);
    steps.push({ snap: { stockDraft: s0.stock - 1, A: "updating stock" }, say: ["UPDATE stock SET qty = qty - 1", "sql", "A"] });
    if (failAt === "stock") return play([...steps, ...rollback("A")]);
    steps.push({ snap: { owedDraft: s0.owed + PRICE, A: "posting ledger" }, say: [`INSERT INTO ledger … +${inr(PRICE)}`, "sql", "A"] });
    steps.push({
      snap: { invoices: [...s0.invoices, inv].slice(-3), invoiceDraft: [], stock: s0.stock - 1, stockDraft: null, owed: s0.owed + PRICE, owedDraft: null, lock: null, A: "committed" },
      say: ["COMMIT; three records, one promise", "ok", "A"],
    });
    play(steps);
  }

  function rollback(who: "A" | "B"): Step[] {
    return [
      { snap: { [who]: "connection lost" } as Partial<Snap>, say: ["ERROR: connection to client lost", "fail", who] },
      { snap: { invoiceDraft: [], stockDraft: null, owedDraft: null, lock: null, [who]: "rolled back" } as Partial<Snap>, say: ["ROLLBACK; no invoice, no stock change, no ledger entry", "note", who] },
    ];
  }

  function race() {
    const start: Snap = { ...snap, stock: 1, stockDraft: null, invoiceDraft: [], owedDraft: null, lock: null, A: "idle", B: "idle" };
    const n = (start.invoices.at(-1)?.no ?? 1040) + 1;
    const a: Invoice = { no: n, counter: "A", amount: PRICE };
    const b: Invoice = { no: n + 1, counter: "B", amount: PRICE };
    const steps: Step[] = [
      { snap: start, say: ["One bag left. Two counters try to sell it at once.", "note"] },
      { snap: { A: "BEGIN", B: "BEGIN" }, say: ["BEGIN; (both counters)", "sql"] },
    ];
    if (locking) {
      steps.push(
        { snap: { lock: "A", A: "locked stock row" }, say: ["SELECT … FOR UPDATE → 1 (row locked)", "sql", "A"] },
        { snap: { B: "waiting for lock…" }, say: ["SELECT … FOR UPDATE → waiting on A", "wait", "B"] },
        { snap: { invoiceDraft: [a], stockDraft: 0, A: "writing" }, say: ["INSERT invoice · UPDATE stock → 0", "sql", "A"] },
        { snap: { owedDraft: start.owed + PRICE }, say: [`INSERT ledger +${inr(PRICE)}`, "sql", "A"] },
        { snap: { invoices: [...start.invoices, a].slice(-3), invoiceDraft: [], stock: 0, stockDraft: null, owed: start.owed + PRICE, owedDraft: null, lock: "B", A: "committed", B: "locked stock row" }, say: ["COMMIT; lock passes to B", "ok", "A"] },
        { snap: { B: "out of stock" }, say: ["B reads qty → 0, refuses the sale", "fail", "B"] },
        { snap: { lock: null, B: "rolled back" }, say: ["ROLLBACK; exactly one bag sold", "ok", "B"] },
      );
    } else {
      steps.push(
        { snap: { A: "read qty 1", B: "read qty 1" }, say: ["SELECT qty (no lock) → 1 for both counters", "wait"] },
        { snap: { invoiceDraft: [a, b], stockDraft: -1, owedDraft: start.owed + 2 * PRICE, A: "writing", B: "writing" }, say: ["both INSERT invoices, both decrement stock", "sql"] },
        {
          snap: { invoices: [...start.invoices, a, b].slice(-3), invoiceDraft: [], stock: -1, stockDraft: null, owed: start.owed + 2 * PRICE, owedDraft: null, A: "committed", B: "committed" },
          say: ["COMMIT ×2 → stock is −1. Two invoices for one bag.", "fail"],
        },
        { snap: {}, say: ["This is the bug the row lock exists to prevent.", "note"] },
      );
    }
    play(steps);
  }

  const reset = () => { clear(); setSnap(initial); };

  return (
    <div className={s.instrument} aria-labelledby={`${id}-t`}>
      <div className={s.bar}>
        <p id={`${id}-t`} className="label label--caps">Instrument · one sale, three records</p>
        <button type="button" className={s.ghost} onClick={reset} disabled={busy}>Reset</button>
      </div>

      <div className={s.stage} data-sim="commit">
        <div className={s.counters}>
          {(["A", "B"] as const).map((c) => (
            <div key={c} className={s.counter} data-state={snap[c]}>
              <span className="label">Counter {c}</span>
              <span className={s.status}>{snap[c]}</span>
            </div>
          ))}
        </div>
        <div className={s.records}>
          <Record title="Invoices" draft={snap.invoiceDraft.length > 0}>
            <ul role="list" className={s.rows}>
              {snap.invoices.length === 0 && snap.invoiceDraft.length === 0 && <li className={s.muted}>No sales yet</li>}
              {snap.invoices.map((i) => <li key={i.no}>#{i.no} · counter {i.counter} · {inr(i.amount)}</li>)}
              {snap.invoiceDraft.map((i) => <li key={`d${i.no}`} className={s.draftRow}>#{i.no} · counter {i.counter} · {inr(i.amount)}</li>)}
            </ul>
          </Record>
          <Record title="Stock · OPC-53 cement" draft={snap.stockDraft !== null} lock={snap.lock}>
            <p className={s.big} data-negative={(snap.stockDraft ?? snap.stock) < 0 || undefined}>
              {snap.stockDraft ?? snap.stock} <span className="label">bags</span>
            </p>
          </Record>
          <Record title="Customer ledger" draft={snap.owedDraft !== null}>
            <p className={s.big}>{inr(snap.owedDraft ?? snap.owed)} <span className="label">owed</span></p>
          </Record>
        </div>
      </div>

      <div className={s.controls}>
        <button type="button" className="button button--solid" onClick={sell} disabled={busy}>Sell 1 bag</button>
        <button type="button" className="button" onClick={race} disabled={busy}>Two counters, last bag</button>
        <label className={s.field}>
          <span className="label">Pull the plug</span>
          <select value={failAt} onChange={(e) => setFailAt(e.target.value as typeof failAt)} disabled={busy}>
            <option value="none">never</option>
            <option value="invoice">after the invoice</option>
            <option value="stock">after the stock update</option>
          </select>
        </label>
        <label className={s.check}>
          <input type="checkbox" checked={locking} onChange={(e) => setLocking(e.target.checked)} disabled={busy} />
          <span className="label">Lock the row (FOR UPDATE)</span>
        </label>
      </div>

      <Log lines={log} empty="Sell a bag, or race two counters for the last one." />
    </div>
  );
}

function Record({ title, draft, lock, children }: { title: string; draft: boolean; lock?: null | "A" | "B"; children: React.ReactNode }) {
  return (
    <section className={s.record} data-draft={draft || undefined} aria-label={title}>
      <header>
        <span className="label label--caps">{title}</span>
        {lock !== undefined && (
          <span className={s.lock} data-on={lock ? "" : undefined}>{lock ? `locked by ${lock}` : "unlocked"}</span>
        )}
      </header>
      {children}
      {draft && <span className={s.draftTag}>uncommitted</span>}
    </section>
  );
}
