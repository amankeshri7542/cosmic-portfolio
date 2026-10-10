import styles from "./Story.module.css";

// The product that gets built as you scroll: a billing app for a hardware store (the shape of the real ERP).
// Every group carries data-s="<step>"; the motion layer reveals them in order. Without JS everything is visible.

const rows = [
  ["OPC 53 Cement", "10", "₹4,200"],
  ["TMT Bar 12 mm", "4", "₹2,960"],
  ["PVC Pipe 1″", "12", "₹1,080"],
  ["Wall Putty 20 kg", "2", "₹1,700"],
];

export const WIRES = {
  uiApi: "M520 384 C 580 384, 590 128, 640 128",
  apiDb: "M720 176 C 720 214, 760 214, 760 250",
  apiQueue: "M800 128 L 822 128",
  dbAi: "M650 300 C 600 300, 600 250, 548 250",
  ship: "M808 530 C 860 530, 900 500, 900 446",
};

export function Stage() {
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

      {/* step 0 — an empty canvas */}
      <g data-s="0" className={styles.empty}>
        <text x="296" y="250" textAnchor="middle" className={styles.mono}>new product</text>
        <rect x="350" y="236" width="2" height="18" className={styles.caret} />
      </g>

      {/* step 4 (drawn first so it sits behind) — AWS boundary, container, pipeline */}
      <g data-s="4" data-part="aws">
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
      <g data-s="4" data-part="pipeline">
        <rect x="36" y="500" width="772" height="60" rx="12" className={styles.panel} />
        {["git push", "test", "build", "deploy"].map((n, i) => (
          <g key={n} transform={`translate(${70 + i * 190} 530)`} data-pipe={i}>
            <circle r="11" className={styles.pipeDot} />
            <path d="M-5 0 l3.5 3.5 l6.5 -7" className={styles.tick} />
            <text x="22" y="5" className={styles.pipeText}>{n}</text>
            {i < 3 && <path d={`M${n.length * 8 + 34} 0 H 168`} className={styles.pipeLine} />}
          </g>
        ))}
        <path d={WIRES.ship} className={styles.wire} data-wire="ship" />
      </g>

      {/* step 1 — the interface */}
      <g data-s="1" data-part="frame">
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
        <rect x="168" y="152" width="180" height="26" rx="6" className={styles.field} />
        <text x="178" y="169" className={styles.fieldText}>Customer · Sharma Traders</text>
        <text x="168" y="204" className={styles.th}>ITEM</text>
        <text x="410" y="204" className={styles.th}>QTY</text>
        <text x="536" y="204" textAnchor="end" className={styles.th}>AMOUNT</text>
        {rows.map((r, i) => (
          <g key={r[0]} data-row={i}>
            <path d={`M168 ${216 + i * 34} H540`} className={styles.hair} />
            <text x="168" y={236 + i * 34} className={styles.td}>{r[0]}</text>
            <text x="410" y={236 + i * 34} className={styles.td}>{r[1]}</text>
            <text x="536" y={236 + i * 34} textAnchor="end" className={styles.td}>{r[2]}</text>
          </g>
        ))}
        <text x="168" y="378" className={styles.total}>Total</text>
        <text x="536" y="378" textAnchor="end" className={styles.total}>₹9,940</text>
        <rect x="400" y="396" width="140" height="34" rx="8" fill="url(#g-btn)" />
        <text x="470" y="418" textAnchor="middle" className={styles.btnText}>Create invoice</text>
      </g>

      {/* step 2 — the API and its checks */}
      <g data-s="2" data-part="api">
        <path d={WIRES.uiApi} className={styles.wire} data-wire="uiApi" />
        <rect x="640" y="90" width="160" height="86" rx="10" className={styles.node} />
        <text x="654" y="112" className={styles.nodeHead}>api</text>
        <text x="654" y="136" className={styles.code}>POST /invoices</text>
        <text x="654" y="158" className={styles.dim}>node · rust / axum</text>
        {["auth", "role", "state"].map((n, i) => (
          <g key={n} transform={`translate(${640 + i * 54} 186)`} data-guard={i}>
            <rect width="48" height="20" rx="10" className={styles.guard} />
            <text x="24" y="14" textAnchor="middle" className={styles.guardText}>{n} ✓</text>
          </g>
        ))}
      </g>

      {/* step 3 — data: one transaction, and a queue for slow work */}
      <g data-s="3" data-part="db">
        <path d={WIRES.apiDb} className={styles.wire} data-wire="apiDb" />
        <path d={WIRES.apiQueue} className={styles.wire} data-wire="apiQueue" />
        <rect x="610" y="250" width="318" height="170" rx="12" className={styles.node} />
        <text x="624" y="272" className={styles.nodeHead}>postgres</text>
        <text x="914" y="272" textAnchor="end" className={styles.tx} data-tx>BEGIN … COMMIT</text>
        {[["invoices", "#1041 ₹9,940"], ["stock", "OPC 53 −10"], ["ledger", "Sharma +₹9,940"]].map(([n, v], i) => (
          <g key={n} transform={`translate(${624 + i * 100} 284)`} data-table={i}>
            <rect width="92" height="122" rx="8" className={styles.table} />
            <text x="10" y="20" className={styles.tableHead}>{n}</text>
            {[0, 1, 2].map((r) => <rect key={r} x="10" y={34 + r * 18} width={60 - r * 8} height="7" rx="3.5" className={styles.navLine} />)}
            <rect x="6" y="90" width="80" height="22" rx="5" className={styles.newRow} />
            <text x="12" y="105" className={styles.newRowText}>{v}</text>
          </g>
        ))}
        <rect x="824" y="90" width="104" height="132" rx="10" className={styles.node} />
        <text x="836" y="112" className={styles.nodeHead}>queue</text>
        <text x="836" y="128" className={styles.dim}>redis · bullmq</text>
        {["pdf.render", "pdf.render", "s3.upload"].map((j, i) => (
          <g key={i} transform={`translate(836 ${140 + i * 24})`} data-job={i}>
            <rect width="80" height="18" rx="5" className={styles.job} />
            <text x="8" y="13" className={styles.jobText}>{j}</text>
          </g>
        ))}
      </g>

      {/* step 5 — AI inside the product */}
      <g data-s="5" data-part="ai">
        <path d={WIRES.dbAi} className={`${styles.wire} ${styles.wireAi}`} data-wire="dbAi" />
        <rect x="338" y="112" width="210" height="322" rx="12" className={styles.chat} />
        <text x="354" y="136" className={styles.nodeHead}>✦ assistant</text>
        <g data-bubble="0">
          <rect x="390" y="152" width="146" height="44" rx="10" className={styles.bubbleMe} />
          <text x="400" y="171" className={styles.bubbleText}>OPC 53 ka stock</text>
          <text x="400" y="187" className={styles.bubbleText}>kitna hai?</text>
        </g>
        <g data-bubble="1">
          <rect x="350" y="208" width="182" height="78" rx="10" className={styles.bubbleAi} />
          <text x="360" y="228" className={styles.bubbleText}>Godown A: 120 bags</text>
          <text x="360" y="246" className={styles.bubbleText}>Godown B: 45 bags</text>
          <text x="360" y="270" className={styles.bubbleDim}>from stock · updated now</text>
        </g>
      </g>

      {/* step 6 — deployed */}
      <g data-s="6" data-part="done">
        <rect x="160" y="16" width="270" height="34" rx="17" className={styles.deployed} />
        <circle cx="182" cy="33" r="5" className={styles.okDot} filter="url(#glow)" />
        <text x="196" y="38" className={styles.deployedText}>deployed · all services healthy</text>
      </g>

      {/* data in motion: packets ride the wires once each layer exists */}
      {Object.keys(WIRES).map((k) => (
        <circle key={k} r="4" className={styles.packet} data-packet={k} filter="url(#glow)" />
      ))}
    </svg>
  );
}
