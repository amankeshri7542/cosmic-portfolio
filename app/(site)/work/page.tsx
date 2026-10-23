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
import { Wobble } from "@/components/acid/Text";
import styles from "./work.module.css";

export const metadata: Metadata = pageMetadata(
  "/work",
  "Work — engineering case studies and projects",
  "Case studies from Aman Kumar: a retail ERP built on PostgreSQL transactions, a guarded procure-to-pay workflow, serverless real-time messaging on AWS, and applied-AI products.",
);

const instruments = { "hardware-erp": <CommitSim />, procurement: <GateSim />, vartalaap: <FanoutSim /> };

export default function WorkPage() {
  return (
    <div className="lab">
      <Ambient />
      <div className="shell">
        <PageHead
          kicker="WORK ✺ CASE STUDIES & PROJECTS"
          title={["Systems that hold,", "and the things *around* them."]}
          lede="Three case studies with working models you can break, then everything else: business platforms, applied AI, cloud infrastructure and small tools."
        >
          <nav aria-label="On this page" className={styles.jump}>
            {plates.map((p) => <a key={p.id} href={`#${p.id}`}>{p.plate} · {p.name}</a>)}
            <a href="#archive">All projects</a>
          </nav>
        </PageHead>
        {plates.map((p) => <Plate key={p.id} plate={p} instrument={instruments[p.id]} headingLevel={2} />)}
        <section id="archive" aria-labelledby="sheet-title" className={`sec ${styles.archive}`} data-sec="more">
          <p className="label label--caps">More projects</p>
          <Wobble id="sheet-title" className="h2" text="Every project, *frame* by frame." />
          <ContactSheet prints={prints} />
        </section>
      </div>
    </div>
  );
}
