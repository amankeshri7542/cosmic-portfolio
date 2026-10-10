import type { Metadata } from "next";
import { Plate } from "@/components/plates/Plate";
import { CommitSim } from "@/components/sims/CommitSim";
import { GateSim } from "@/components/sims/GateSim";
import { FanoutSim } from "@/components/sims/FanoutSim";
import { ContactSheet } from "@/components/prints/ContactSheet";
import { plates, prints } from "@/content/work";
import { pageMetadata } from "@/lib/seo";
import styles from "./work.module.css";

export const metadata: Metadata = pageMetadata(
  "/work",
  "Work — engineering case studies and projects",
  "Case studies from Aman Kumar: a retail ERP built on PostgreSQL transactions, a guarded procure-to-pay workflow, serverless real-time messaging on AWS, and applied-AI products.",
);

const instruments = { "hardware-erp": <CommitSim />, procurement: <GateSim />, vartalaap: <FanoutSim /> };

export default function WorkPage() {
  return (
    <>
      <div className="shell">
        <header className={styles.head}>
          <p className="label label--caps">Work</p>
          <h1>Systems that hold, and the things around them.</h1>
          <p>
            Three engineering plates with working models you can break, then a contact sheet of everything else: business
            platforms, applied AI, cloud infrastructure and small tools.
          </p>
          <nav aria-label="On this page" className={styles.jump}>
            {plates.map((p) => <a key={p.id} href={`#${p.id}`}>Plate {p.plate} · {p.name}</a>)}
            <a href="#archive">Contact sheet</a>
          </nav>
        </header>
        {plates.map((p) => <Plate key={p.id} plate={p} instrument={instruments[p.id]} headingLevel={2} />)}
        <section id="archive" aria-labelledby="sheet-title" className={styles.archive}>
          <p className="label label--caps">Contact sheet</p>
          <h2 id="sheet-title">Every project, frame by frame.</h2>
          <ContactSheet prints={prints} />
        </section>
      </div>
    </>
  );
}
