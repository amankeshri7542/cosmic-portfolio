"use client";

import { CATALOGUE, QUESTIONS, inr, shopName, total, useStory, type StoryState } from "./store";
import styles from "./Story.module.css";

// The product that gets built as you scroll: a billing app for a hardware store (the shape of the real ERP).
// Every layer carries data-s="<step>"; the motion layer reveals them in order. The contents come from the
// visitor's own run (store.ts), so the bill they make is the one the API checks and the database commits.

export const WIRES = {
  uiApi: "M520 413 C 584 413, 590 128, 640 128",
  apiDb: "M720 176 C 720 214, 760 214, 760 250",
  apiQueue: "M800 128 L 822 128",
  dbAi: "M650 300 C 600 300, 600 250, 548 250",
  ship: "M808 530 C 860 530, 900 500, 900 446",
};

const cls = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

export function Stage() {
  const s = useStory((x) => x);
  const hot = (k: string) => (s.highlight === k ? styles.hot : undefined);
  return (
    <svg className={styles.svg} viewBox="0 0 960 600" role="img" aria-labelledby="stage-title stage-desc">
      <title id="stage-title">A billing app being built, layer by layer</title>
      <desc id="stage-desc">
        A browser with an invoice screen connects to an API that checks auth, role and state; the API writes to PostgreSQL in one
        transaction and queues PDF work in Redis; everything is containerised, tested in a pipeline and deployed to AWS; an AI
        assistant answers stock questions from the database.
      </desc>
      <defs>
        <linearGradient id="g-btn" x1="0" x2="1">
          <stop offset="0" stopColor="#ffb547" />
          <stop offset="1" stopColor="#ff8a00" />
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <g data-s="0" className={styles.empty}>
        <text x="296" y="250" textAnchor="middle" className={styles.mono}>new product</text>
        <rect x="350" y="236" width="2" height="18" className={styles.caret} />
      </g>

      <Ship s={s} hot={hot("ship")} />
      <Interface s={s} hot={hot("ui")} />
      <Api s={s} hot={hot("api")} />
      <Data s={s} hotDb={hot("db")} hotQueue={hot("queue")} />
      <Assistant s={s} hot={hot("ai")} />
      <Run s={s} />

      {/* the visitor's own request travelling to the API, once per click */}
      {s.request.phase === "running" && (
        <circle key={`req${s.stats.requests}`} r="6" className={styles.reqPacket} filter="url(#glow)">
          <animateMotion dur="0.9s" fill="freeze" path={WIRES.uiApi} />
        </circle>
      )}
      {Object.keys(WIRES).map((k) => (
        <circle key={k} r="4" className={styles.packet} data-packet={k} filter="url(#glow)" />
      ))}
    </svg>
  );
}

function Interface({ s, hot }: { s: StoryState; hot?: string }) {
  const rows = s.cart.slice(0, 5);
  const btn =
    s.request.phase === "running" ? "Sending…" : s.request.phase === "ok" ? "201 Created ✓" : s.request.phase === "fail" ? `${s.request.code} — refused` : "Create invoice";
  return (
    <>
      <g data-s="1" data-part="frame" className={hot}>
        <rect x="36" y="70" width="520" height="380" rx="14" className={styles.window} />
        <path d="M36 100 H556" className={styles.hair} />
        <circle cx="56" cy="85" r="5" className={styles.dot} />
        <circle cx="72" cy="85" r="5" className={styles.dot} />
        <circle cx="88" cy="85" r="5" className={styles.dot} />
        <rect x="180" y="77" width="236" height="16" rx="8" className={styles.url} />
        <text x="298" y="89" textAnchor="middle" className={styles.urlText}>billing.store / new-invoice</text>
      </g>
      <g data-s="1" data-part="ui">
        <rect x="52" y="116" width="96" height="318" rx="8" className={styles.side} />
        <rect x="64" y="130" width="22" height="22" rx="6" className={styles.logo} />
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x="64" y={170 + i * 26} width={i === 0 ? 70 : 52 + (i % 2) * 14} height="8" rx="4" className={i === 0 ? styles.navActive : styles.navLine} />
        ))}
        <text x="168" y="138" className={styles.h}>New invoice</text>
        <rect x="168" y="152" width="200" height="26" rx="6" className={cls(styles.field, s.shop && styles.fieldOn)} />
        <text x="178" y="169" className={styles.fieldText}>Customer · {shopName(s)}</text>
        <text x="168" y="204" className={styles.th}>ITEM</text>
        <text x="420" y="204" className={styles.th}>QTY</text>
        <text x="536" y="204" textAnchor="end" className={styles.th}>AMOUNT</text>
        {rows.map((l, i) => (
          <g key={l.sku} data-row={i} className={styles.rowIn}>
            <path d={`M168 ${214 + i * 30} H540`} className={styles.hair} />
            <text x="168" y={233 + i * 30} className={styles.td}>{CATALOGUE[l.sku].name}</text>
            <text x="420" y={233 + i * 30} className={styles.td}>{l.qty}</text>
            <text x="536" y={233 + i * 30} textAnchor="end" className={styles.td}>{inr(CATALOGUE[l.sku].price * l.qty)}</text>
          </g>
        ))}
        {rows.length === 0 && <text x="168" y="236" className={styles.dim}>Add an item to start the bill</text>}
        <text x="168" y="386" className={styles.total}>Total</text>
        <text x="536" y="386" textAnchor="end" className={styles.total}>{inr(total(s))}</text>
        <rect x="380" y="396" width="160" height="34" rx="8" fill="url(#g-btn)" className={cls(s.request.phase === "fail" && styles.btnFail)} />
        <text x="460" y="418" textAnchor="middle" className={styles.btnText}>{btn}</text>
      </g>
    </>
  );
}

function Api({ s, hot }: { s: StoryState; hot?: string }) {
  const r = s.request;
  return (
    <g data-s="2" data-part="api" className={hot}>
      <path d={WIRES.uiApi} className={cls(styles.wire, r.phase === "running" && styles.wireLive)} data-wire="uiApi" />
      <rect x="640" y="90" width="160" height="86" rx="10" className={cls(styles.node, r.phase === "fail" && styles.nodeFail)} />
      <text x="654" y="112" className={styles.nodeHead}>api</text>
      <text x="654" y="136" className={styles.code}>POST /invoices</text>
      <text x="654" y="158" className={styles.dim}>{r.code ? `→ ${r.code} ${r.code === 201 ? "Created" : r.code === 403 ? "Forbidden" : "Unprocessable"}` : `as ${s.role}`}</text>
      {["auth", "role", "state"].map((n, i) => {
        const state = r.phase === "idle" ? "idle" : i < r.guard ? "pass" : r.phase === "fail" && i === r.guard ? "fail" : "wait";
        return (
          <g key={n} transform={`translate(${640 + i * 54} 186)`} data-guard={i} data-state={state}>
            <rect width="48" height="20" rx="10" className={styles.guard} />
            <text x="24" y="14" textAnchor="middle" className={styles.guardText}>
              {n} {state === "fail" ? "✕" : state === "wait" ? "…" : "✓"}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function Data({ s, hotDb, hotQueue }: { s: StoryState; hotDb?: string; hotQueue?: string }) {
  const first = s.cart[0];
  const t = s.txn.phase;
  const no = s.txn.invoiceNo ?? 1041 + s.invoices.length;
  const cells = [
    ["invoices", `#${no} ${inr(total(s))}`],
    ["stock", first ? `${CATALOGUE[first.sku].name.split(" ").slice(0, 2).join(" ")} −${first.qty}` : "—"],
    ["ledger", `${shopName(s).slice(0, 9)} +${inr(total(s))}`],
  ];
  const tx =
    t === "running" ? (s.atomic ? "BEGIN … FOR UPDATE" : "autocommit · writing…") :
    t === "ok" ? "COMMIT ✓" : t === "fail" ? "ROLLBACK — nothing written" : t === "partial" ? "OUT OF SYNC ✕" :
    s.atomic ? "BEGIN … COMMIT" : "no transaction";
  return (
    <g data-s="3" data-part="db">
      <path d={WIRES.apiDb} className={styles.wire} data-wire="apiDb" />
      <path d={WIRES.apiQueue} className={styles.wire} data-wire="apiQueue" />
      <g className={hotDb}>
        <rect x="610" y="250" width="318" height="170" rx="12" className={cls(styles.node, (t === "fail" || t === "partial") && styles.nodeFail)} />
        <text x="624" y="272" className={styles.nodeHead}>postgres</text>
        <text x="914" y="272" textAnchor="end" className={cls(styles.tx, t === "ok" && styles.txOk, (t === "fail" || t === "partial") && styles.txFail)} data-tx>{tx}</text>
        {cells.map(([n, v], i) => (
          <g key={n} transform={`translate(${624 + i * 100} 284)`} data-table={i} data-txn={t === "partial" ? (i === 2 ? "missing" : "ok") : t}>
            <rect width="92" height="122" rx="8" className={styles.table} />
            <text x="10" y="20" className={styles.tableHead}>{n}</text>
            {[0, 1, 2].map((r) => <rect key={r} x="10" y={34 + r * 18} width={60 - r * 8} height="7" rx="3.5" className={styles.navLine} />)}
            <rect x="6" y="90" width="80" height="22" rx="5" className={styles.newRow} />
            <text x="12" y="105" className={styles.newRowText}>{t === "partial" && i === 2 ? "— never written" : v}</text>
          </g>
        ))}
      </g>
      <g className={hotQueue}>
        <rect x="824" y="90" width="104" height="132" rx="10" className={styles.node} />
        <text x="836" y="112" className={styles.nodeHead}>queue</text>
        <text x="836" y="128" className={styles.dim}>redis · bullmq</text>
        {[`pdf #${no}`, "pdf.render", "s3.upload"].map((j, i) => (
          <g key={i} transform={`translate(836 ${140 + i * 24})`} data-job={i}>
            <rect width="80" height="18" rx="5" className={cls(styles.job, i === 0 && t === "ok" && styles.jobNew)} />
            <text x="8" y="13" className={styles.jobText}>{j}</text>
          </g>
        ))}
      </g>
    </g>
  );
}

function Ship({ s, hot }: { s: StoryState; hot?: string }) {
  const p = s.pipeline;
  const nodeState = (i: number) => (p.phase === "idle" ? "done" : i < p.stage ? "done" : i === p.stage ? (p.phase === "fail" ? "fail" : p.phase === "ok" ? "done" : "run") : "todo");
  return (
    <>
      <g data-s="4" data-part="aws" className={hot}>
        <rect x="574" y="40" width="374" height="408" rx="18" className={styles.aws} />
        <text x="592" y="62" className={styles.awsLabel}>AWS · ap-south-1</text>
        {[["CloudFront", 700], ["EC2", 788], ["RDS", 840], ["S3", 892]].map(([n, x]) => (
          <g key={n} transform={`translate(${x} 52)`}>
            <rect x="-2" y="-10" width={String(n).length * 7 + 14} height="18" rx="9" className={styles.badge} />
            <text x="5" y="3" className={styles.badgeText}>{n}</text>
          </g>
        ))}
      </g>
      <g data-s="4" data-part="docker">
        <rect x="594" y="74" width="344" height="362" rx="14" className={styles.docker} />
        <text x="606" y="428" className={styles.dim}>container · docker</text>
      </g>
      <g data-s="4" data-part="pipeline" className={hot}>
        <rect x="36" y="500" width="772" height="60" rx="12" className={cls(styles.panel, p.phase === "fail" && styles.nodeFail)} />
        {["git push", "test", "build", "deploy"].map((n, i) => (
          <g key={n} transform={`translate(${70 + i * 190} 530)`} data-pipe={i} data-state={nodeState(i)}>
            <circle r="11" className={styles.pipeDot} />
            {nodeState(i) === "fail" ? <path d="M-4 -4 l8 8 M4 -4 l-8 8" className={styles.cross} /> : <path d="M-5 0 l3.5 3.5 l6.5 -7" className={styles.tick} />}
            <text x="22" y="5" className={styles.pipeText}>{n}</text>
            {i < 3 && <path d={`M${n.length * 8 + 34} 0 H 168`} className={styles.pipeLine} />}
          </g>
        ))}
        <path d={WIRES.ship} className={styles.wire} data-wire="ship" />
      </g>
    </>
  );
}

function Assistant({ s, hot }: { s: StoryState; hot?: string }) {
  const q = s.ai.question ?? QUESTIONS[0];
  const a = s.ai.phase === "running" ? "Looking it up…" : s.ai.answer ?? `${s.stock.OPC53} bags in stock.`;
  return (
    <g data-s="5" data-part="ai" className={hot}>
      <path d={WIRES.dbAi} className={cls(styles.wire, styles.wireAi, s.ai.phase === "running" && styles.wireLive)} data-wire="dbAi" />
      <rect x="338" y="112" width="210" height="322" rx="12" className={styles.chat} />
      <text x="354" y="136" className={styles.nodeHead}>✦ assistant</text>
      <g data-bubble="0">
        <rect x="370" y="152" width="166" height="44" rx="10" className={styles.bubbleMe} />
        <Wrap x={380} y={171} text={q} width={24} className={styles.bubbleText} />
      </g>
      <g data-bubble="1">
        <rect x="350" y="208" width="186" height="96" rx="10" className={styles.bubbleAi} />
        <Wrap x={360} y={228} text={a} width={25} className={styles.bubbleText} />
        <text x="360" y="294" className={styles.bubbleDim}>from stock & ledger · just now</text>
      </g>
    </g>
  );
}

function Run({ s }: { s: StoryState }) {
  const down = !s.api.a;
  return (
    <g data-s="6" data-part="done">
      <rect x="140" y="16" width="320" height="34" rx="17" className={down ? styles.degraded : styles.deployed} />
      <circle cx="162" cy="33" r="5" className={down ? styles.warnDot : styles.okDot} filter="url(#glow)" />
      <text x="176" y="38" className={styles.deployedText}>
        {down ? "api-1 down · traffic moved to api-2" : `v${s.version} live · all services healthy`}
      </text>
      {(["a", "b"] as const).map((k, i) => (
        <g key={k} transform={`translate(${826 + i * 52} 230)`} data-server={k}>
          <rect width="46" height="18" rx="9" className={s.api[k] ? styles.serverUp : styles.serverDown} />
          <text x="23" y="13" textAnchor="middle" className={styles.serverText}>api-{i + 1}</text>
        </g>
      ))}
    </g>
  );
}

/** Minimal word-wrap for SVG text (monospace-ish widths). */
function Wrap({ x, y, text, width, className }: { x: number; y: number; text: string; width: number; className: string }) {
  const lines: string[] = [];
  let line = "";
  for (const w of text.split(" ")) {
    if ((line + " " + w).trim().length > width) { lines.push(line.trim()); line = w; } else line += " " + w;
  }
  if (line.trim()) lines.push(line.trim());
  return <>{lines.slice(0, 4).map((l, i) => <text key={i} x={x} y={y + i * 16} className={className}>{l}</text>)}</>;
}
