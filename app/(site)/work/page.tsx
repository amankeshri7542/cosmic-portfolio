import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { Plate } from "@/components/plates/Plate";
import { CommitSim } from "@/components/sims/CommitSim";
import { GateSim } from "@/components/sims/GateSim";
import { FanoutSim } from "@/components/sims/FanoutSim";
import { ContactSheet } from "@/components/prints/ContactSheet";
import { plates, prints } from "@/content/work";
import { pageMetadata } from "@/lib/seo";
import { Ambient } from "@/components/acid/Ambient";
import { PageHead } from "@/components/acid/PageHead";
import { Drip } from "@/components/acid/Text";
import { Head, ContactCard } from "@/components/home/Sections";
import { Drips } from "@/components/home/Hero";
import styles from "./work.module.css";

export const metadata: Metadata = pageMetadata(
  "/work",
  "Work — case studies and projects by Aman Keshri",
  "Case studies from Aman Keshri (Aman Kumar), freelance full-stack developer: a retail ERP built on PostgreSQL transactions, a guarded procure-to-pay workflow, serverless real-time messaging on AWS, and applied-AI products.",
);

const cases = {
  "hardware-erp": { sim: <CommitSim />, ink: 1, tryIt: "Try it: sell a bag, then pull the plug halfway. Or race two counters for the last bag." },
  procurement: { sim: <GateSim />, ink: 2, tryIt: "Try it: release the PO as the requester. The server refuses. Then walk it through the gates." },
  vartalaap: { sim: <FanoutSim />, ink: 3, tryIt: "Try it: knock B offline and send. Then switch to Promise.all and send again." },
} as const;

const band = ["TRANSACTIONS", "ROW LOCKS", "STATE MACHINES", "ROLE CHECKS", "WEBSOCKETS", "FAN-OUT", "QUEUES", "RAG"];

export default function WorkPage() {
  return (
    <div className="lab">
      <Ambient />
      <div className="wrap">
        <PageHead
          kicker="WORK ✺ CASE STUDIES & PROJECTS"
          title={["Systems that hold,", "and the things *around* them."]}
          lede="Three systems I built, each with a working model you can poke, break and reset. Below them, everything else: business platforms, applied AI, cloud infrastructure and small sharp tools."
        >
          <nav aria-label="On this page" className={styles.jump}>
            {plates.map((p, i) => (
              <a key={p.id} href={`#${p.id}`} style={{ "--sc": `var(--c${i + 1})` } as CSSProperties}>
                <span aria-hidden="true">{p.plate}</span> {p.name}
              </a>
            ))}
            <a href="#archive" style={{ "--sc": "var(--c4)" } as CSSProperties}><span aria-hidden="true">✺</span> All projects</a>
          </nav>
        </PageHead>
      </div>

      <div className="sec" data-sec="bands" aria-hidden="true">
        <div className="marquee alt">
          <div className="track">{[...band, ...band].map((t, i) => <span key={i}>{t} <i>✦</i></span>)}</div>
        </div>
      </div>

      <div className="wrap">
        {plates.map((p) => {
          const c = cases[p.id];
          return <Plate key={p.id} plate={p} instrument={c.sim} ink={c.ink} tryIt={c.tryIt} />;
        })}

        <section id="archive" aria-labelledby="sheet-title" className={`sec block ${styles.archive}`} data-sec="more">
          <div className="row-head">
            <Head n="✺" kicker={`MORE PROJECTS ✺ ${prints.length} SHIPPED`} title={["Every project,", "*frame* by frame."]} id="sheet-title" />
            <Drip as="p" className="hint" text="Search by tool, or open a card for how it’s built." />
          </div>
          <ContactSheet prints={prints} />
        </section>

        <ContactCard />
        <Drips lime />
      </div>
    </div>
  );
}
