"use client";

import { useSyncExternalStore } from "react";

// The visitor's own run through the story. What they add at step 1 is what the API checks, the database commits,
// the pipeline ships and the assistant answers about — one product, carried through every layer.

export type Sku = "OPC53" | "TMT12" | "PVC1" | "PUTTY20" | "TILE2";
export const CATALOGUE: Record<Sku, { name: string; price: number; unit: string }> = {
  OPC53: { name: "OPC 53 Cement", price: 420, unit: "bags" },
  TMT12: { name: "TMT Bar 12 mm", price: 740, unit: "bars" },
  PVC1: { name: "PVC Pipe 1″", price: 90, unit: "pipes" },
  PUTTY20: { name: "Wall Putty 20 kg", price: 850, unit: "bags" },
  TILE2: { name: "Floor Tile 2×2", price: 65, unit: "tiles" },
};

export type Line = { sku: Sku; qty: number };
export type Role = "cashier" | "intern";
export type Phase = "idle" | "running" | "ok" | "fail" | "partial";

export type StoryState = {
  shop: string;
  cart: Line[];
  role: Role;
  request: { phase: Phase; guard: number; code?: number }; // guard: 0..3 checks passed
  powerCut: boolean;
  atomic: boolean; // false = each write commits on its own
  txn: { phase: Phase; invoiceNo?: number };
  stock: Record<Sku, number>;
  invoices: { no: number; shop: string; total: number }[];
  ledger: Record<string, number>; // shop → amount owed
  brokenTest: boolean;
  pipeline: { phase: Phase; stage: number }; // stage 0..4: push, test, build, deploy, live
  version: string;
  ai: { question?: string; answer?: string; phase: Phase };
  api: { a: boolean; b: boolean; routedTo: "a" | "b" };
  highlight: string | null;
  stats: { requests: number; denied: number; commits: number; rollbacks: number; partials: number; created: number; deploys: number; blocked: number; recoveries: number; asked: number };
};

const initial: StoryState = {
  shop: "",
  cart: [{ sku: "OPC53", qty: 10 }],
  role: "cashier",
  request: { phase: "idle", guard: 0 },
  powerCut: false,
  atomic: true,
  txn: { phase: "idle" },
  stock: { OPC53: 130, TMT12: 64, PVC1: 220, PUTTY20: 38, TILE2: 400 },
  invoices: [],
  ledger: {},
  brokenTest: false,
  pipeline: { phase: "idle", stage: 0 },
  version: "1.4.0",
  ai: { phase: "idle" },
  api: { a: true, b: true, routedTo: "a" },
  highlight: null,
  stats: { requests: 0, denied: 0, commits: 0, rollbacks: 0, partials: 0, created: 0, deploys: 0, blocked: 0, recoveries: 0, asked: 0 },
};

let state = initial;
const listeners = new Set<() => void>();
const timers = new Set<number>();

function set(patch: Partial<StoryState> | ((s: StoryState) => Partial<StoryState>)) {
  state = { ...state, ...(typeof patch === "function" ? patch(state) : patch) };
  listeners.forEach((l) => l());
}
function later(ms: number, fn: () => void) {
  const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const id = window.setTimeout(() => { timers.delete(id); fn(); }, reduce ? Math.min(ms, 60) : ms);
  timers.add(id);
}

export const shopName = (s: StoryState) => s.shop.trim() || "Your shop";
export const total = (s: StoryState) => s.cart.reduce((sum, l) => sum + CATALOGUE[l.sku].price * l.qty, 0);
export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export const story = {
  get: () => state,
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  reset() {
    timers.forEach(clearTimeout);
    timers.clear();
    set(initial);
  },

  setShop: (shop: string) => set({ shop: shop.slice(0, 22) }),
  add(sku: Sku) {
    set((s) => {
      const found = s.cart.find((l) => l.sku === sku);
      const cart = found ? s.cart.map((l) => (l.sku === sku ? { ...l, qty: Math.min(l.qty + (sku === "TILE2" ? 20 : sku === "PVC1" ? 6 : 2), 99) } : l)) : [...s.cart, { sku, qty: sku === "TILE2" ? 40 : sku === "PVC1" ? 12 : sku === "OPC53" ? 10 : 2 }];
      return { cart: cart.slice(-5), txn: { phase: "idle" }, request: { phase: "idle", guard: 0 } };
    });
  },
  remove: (sku: Sku) => set((s) => ({ cart: s.cart.filter((l) => l.sku !== sku), txn: { phase: "idle" }, request: { phase: "idle", guard: 0 } })),
  setRole: (role: Role) => set({ role, request: { phase: "idle", guard: 0 } }),
  setPowerCut: (powerCut: boolean) => set({ powerCut }),
  setAtomic: (atomic: boolean) => set({ atomic }),
  setBrokenTest: (brokenTest: boolean) => set({ brokenTest }),
  setHighlight: (highlight: string | null) => set({ highlight }),

  /** POST /invoices: auth → role → state, one check at a time. */
  send(onDone?: (ok: boolean) => void) {
    if (state.request.phase === "running") return;
    const empty = state.cart.length === 0;
    set((s) => ({ request: { phase: "running", guard: 0 }, stats: { ...s.stats, requests: s.stats.requests + 1 } }));
    later(450, () => set({ request: { phase: "running", guard: 1 } })); // auth ✓
    later(900, () => {
      if (state.role === "intern") {
        set((s) => ({ request: { phase: "fail", guard: 1, code: 403 }, stats: { ...s.stats, denied: s.stats.denied + 1 } }));
        onDone?.(false);
        return;
      }
      set({ request: { phase: "running", guard: 2 } }); // role ✓
      later(450, () => {
        if (empty) {
          set((s) => ({ request: { phase: "fail", guard: 2, code: 422 }, stats: { ...s.stats, denied: s.stats.denied + 1 } }));
          onDone?.(false);
          return;
        }
        set((s) => ({ request: { phase: "ok", guard: 3, code: 201 }, stats: { ...s.stats, created: s.stats.created + 1 } })); // state ✓
        onDone?.(true);
      });
    });
  },

  /** BEGIN … FOR UPDATE … three writes … COMMIT, or a rollback if the power goes. */
  commit() {
    if (state.txn.phase === "running") return;
    const short = state.cart.find((l) => state.stock[l.sku] < l.qty);
    set({ txn: { phase: "running" } });
    later(1100, () => {
      if (state.powerCut && !state.atomic && !short) {
        // Without a transaction the invoice and stock writes already landed; the ledger write never happens.
        set((s) => {
          const no = 1041 + s.invoices.length;
          const stock = { ...s.stock };
          s.cart.forEach((l) => (stock[l.sku] -= l.qty));
          return {
            txn: { phase: "partial", invoiceNo: no },
            stock,
            invoices: [...s.invoices, { no, shop: shopName(s), total: total(s) }],
            stats: { ...s.stats, partials: s.stats.partials + 1 },
          };
        });
        return;
      }
      if (state.powerCut || short) {
        set((s) => ({ txn: { phase: "fail" }, stats: { ...s.stats, rollbacks: s.stats.rollbacks + 1 } }));
        return;
      }
      set((s) => {
        const no = 1041 + s.invoices.length;
        const stock = { ...s.stock };
        s.cart.forEach((l) => (stock[l.sku] -= l.qty));
        const who = shopName(s);
        return {
          txn: { phase: "ok", invoiceNo: no },
          stock,
          invoices: [...s.invoices, { no, shop: who, total: total(s) }],
          ledger: { ...s.ledger, [who]: (s.ledger[who] ?? 0) + total(s) },
          stats: { ...s.stats, commits: s.stats.commits + 1 },
        };
      });
    });
  },

  /** git push → test → build → deploy. A failing test stops the line before production. */
  push() {
    if (state.pipeline.phase === "running") return;
    set({ pipeline: { phase: "running", stage: 0 } });
    later(500, () => set({ pipeline: { phase: "running", stage: 1 } }));
    later(1300, () => {
      if (state.brokenTest) {
        set((s) => ({ pipeline: { phase: "fail", stage: 1 }, stats: { ...s.stats, blocked: s.stats.blocked + 1 } }));
        return;
      }
      set({ pipeline: { phase: "running", stage: 2 } });
      later(800, () => set({ pipeline: { phase: "running", stage: 3 } }));
      later(1600, () =>
        set((s) => {
          const [maj, min] = s.version.split(".").map(Number);
          return { pipeline: { phase: "ok", stage: 4 }, version: `${maj}.${min + 1}.0`, stats: { ...s.stats, deploys: s.stats.deploys + 1 } };
        }),
      );
    });
  },

  ask(question: string) {
    set((s) => ({ ai: { question, phase: "running" }, stats: { ...s.stats, asked: s.stats.asked + 1 } }));
    later(900, () => set((s) => ({ ai: { question, answer: answer(question, s), phase: "ok" } })));
  },

  /** Take one API server down; the load balancer moves traffic and the server is replaced. */
  killServer() {
    if (!state.api.a || !state.api.b) return;
    set({ api: { a: false, b: true, routedTo: "b" } });
    later(2600, () => set((s) => ({ api: { a: true, b: true, routedTo: "a" }, stats: { ...s.stats, recoveries: s.stats.recoveries + 1 } })));
  },
};

/** A tiny, honest "retrieval": the assistant only answers from this page's own data. */
export const QUESTIONS = ["OPC 53 ka stock kitna hai?", "Aaj sabse zyada kya bika?", "Mera balance kitna hai?"] as const;
function answer(q: string, s: StoryState): string {
  if (q === QUESTIONS[0]) {
    const sold = 130 - s.stock.OPC53;
    return `${s.stock.OPC53} bags in stock${sold ? ` — ${sold} sold on this page` : ""}.`;
  }
  if (q === QUESTIONS[1]) {
    const sold = (Object.keys(CATALOGUE) as Sku[]).map((k) => [k, initial.stock[k] - s.stock[k]] as const).sort((a, b) => b[1] - a[1])[0];
    return sold[1] > 0 ? `${CATALOGUE[sold[0]].name}: ${sold[1]} ${CATALOGUE[sold[0]].unit} today.` : "Nothing sold yet — commit a sale first.";
  }
  const owed = s.ledger[shopName(s)] ?? 0;
  return owed ? `${shopName(s)} owes ${inr(owed)} across ${s.invoices.length} invoice${s.invoices.length > 1 ? "s" : ""}.` : `${shopName(s)} has no invoices yet.`;
}

export function useStory<T>(select: (s: StoryState) => T): T {
  return useSyncExternalStore(story.subscribe, () => select(state), () => select(initial));
}

/** Small goals per chapter, in the spirit of "now try to break it". */
export const GOALS: Record<string, { label: string; done: (s: StoryState) => boolean }[]> = {
  interface: [
    { label: "Name your shop", done: (s) => s.shop.trim().length > 0 },
    { label: "Put three items on the bill", done: (s) => s.cart.length >= 3 },
  ],
  api: [
    { label: "Get a 201", done: (s) => s.stats.created > 0 },
    { label: "Get refused with a 403", done: (s) => s.stats.denied > 0 },
  ],
  data: [
    { label: "Commit a sale", done: (s) => s.stats.commits > 0 },
    { label: "Watch a rollback", done: (s) => s.stats.rollbacks > 0 },
    { label: "Break it without a transaction", done: (s) => s.stats.partials > 0 },
  ],
  ship: [
    { label: "Ship a new version", done: (s) => s.stats.deploys > 0 },
    { label: "Get stopped by a failing test", done: (s) => s.stats.blocked > 0 },
  ],
  ai: [{ label: "Ask the assistant", done: (s) => s.stats.asked > 0 }],
  run: [{ label: "Survive a server crash", done: (s) => s.stats.recoveries > 0 }],
};
export const goalCount = (s: StoryState) => {
  const all = Object.values(GOALS).flat();
  return { done: all.filter((g) => g.done(s)).length, total: all.length };
};
