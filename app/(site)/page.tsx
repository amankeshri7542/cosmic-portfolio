import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { Ambient } from "@/components/acid/Ambient";
import { Drip, Melt } from "@/components/acid/Text";
import { FilterTabs } from "@/components/acid/FilterTabs";
import { Drips, Hero, Marquees } from "@/components/home/Hero";
import { About, Blueprint, ContactCard, Experience, Faq, Fresh, Head, Process, Services, Writing } from "@/components/home/Sections";
import { StackExplorer } from "@/components/home/StackExplorer";
import { CaseDeck } from "@/components/home/CaseDeck";
import { BriefBuilder } from "@/components/home/BriefBuilder";
import { fanout, p2p } from "@/components/home/art";
import { plates, prints } from "@/content/work";
import { stack } from "@/content/profile";
import { printGroups } from "@/content/services";
import { JsonLd, pageMetadata } from "@/lib/seo";
import { SITE_URL } from "@/content/profile";
import Image from "next/image";

const title = "Aman Keshri (Aman Kumar) — freelance full-stack developer, Bengaluru";

export const metadata: Metadata = {
  ...pageMetadata(
    "/",
    title,
    "Aman Keshri (Aman Kumar) is a freelance full-stack developer in Bengaluru. Web apps, APIs, AWS cloud and AI assistants, built end to end with React, Next.js, Node.js, Rust and PostgreSQL.",
  ),
  title: { absolute: title },
};

const toolCount = Object.values(stack).reduce((n, items) => n + items.length, 0);
type Vars = CSSProperties & Record<`--${string}`, string>;

export default function Home() {
  return (
    <div className="lab">
      <Ambient size="full" />
      <Hero />
      <Marquees />
      <div className="wrap">
        <About />
        <Experience />
        <Services />

        <section className="sec block" data-sec="stack" id="stack" aria-labelledby="stack-h">
          <Head n="04" kicker={`TECH STACK ✺ ${toolCount} TOOLS IN 6 LAYERS`} title="Tools I *ship* with" id="stack-h" flip hint="Pick a layer to light it up. Tap any tool to see where I used it." />
          <StackExplorer />
        </section>

        <section className="sec block" data-sec="work" id="work" aria-labelledby="work-h">
          <Head n="05" kicker="CASE STUDIES ✺ THREE, IN DEPTH" title={["Systems that", "hold *up*"]} id="work-h" size="xl" />
          <CaseDeck />
          <div className="pair">
            <Blueprint fig={p2p} caption="// money only moves through gates" tag="PROCURE-TO-PAY · SIMPLIFIED" label="Simplified purchase-order states: draft, submitted, approved, PO released. Only an approver can approve, and rejected requests go back to draft." />
            <Blueprint fig={fanout} caption="// one goes quiet, the rest still hear" tag="VARTALAAP · SIMPLIFIED" label="Simplified real-time fan-out: clients connect through API Gateway WebSockets with Cognito, a Lambda fans messages out, and a closed connection is recorded while the rest are delivered." />
          </div>
        </section>

        <Fresh />

        <section className="sec block" data-sec="more" aria-labelledby="more-h">
          <Head n="07" kicker="MORE PROJECTS ✺ EIGHT MORE" title="Shipped & *live*" id="more-h" />
          <FilterTabs labels={["All", "AI", "Cloud", "Web"]} label="Filter projects" className="grid-proj">
            {prints.map((p, i) => (
              <a
                key={p.id}
                className={i === 0 ? "proj lead" : "proj"}
                href={p.href ?? `/work#${p.id}`}
                {...(p.href ? { target: "_blank", rel: "noopener" } : {})}
                data-grp={printGroups[p.id]?.join(" ")}
                style={{ "--pc": `var(--c${(i % 4) + 1})`, "--pr": `${[-3, 2, -1.5, 3, -2, 1.5, -3, 2][i % 8]}deg` } as Vars}
              >
                <span className="ph">
                  <Image src={p.image.src} alt={p.image.alt} width={p.image.width} height={p.image.height} sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 420px" />
                  <Drip className="pno" text={`Nº ${String(i + 1).padStart(2, "0")}`} />
                </span>
                <span className="proj-b">
                  <Drip className="mono proj-k" style={{ color: `var(--c${(i % 4) + 1})` }} text={`${p.kind.toUpperCase()} · ${p.date.toUpperCase()}`} />
                  <Drip className="disp proj-t" text={p.title} />
                  <Melt as="span" className="proj-d" text={p.description} />
                  <span className="mono proj-s">{p.tech.join(" · ")}</span>
                  <span className="go">{p.href ? "Open live ↗" : "Architecture project →"}</span>
                </span>
              </a>
            ))}
          </FilterTabs>
        </section>

        <section className="sec block" data-sec="brief" id="brief" aria-labelledby="brief-h">
          <Head n="08" kicker="START A PROJECT ✺ BRIEF BUILDER" title={["Pick, mix,", "*send.*"]} id="brief-h" hint="Pick what you need. I’ll show how I’d build it and where I’ve done it before." />
          <BriefBuilder />
        </section>

        <Process />
        <Faq />
        <Writing />
        <ContactCard />
        <Drips lime />
      </div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Projects by Aman Keshri",
          itemListElement: [...plates.map((p) => ({ name: p.name, id: p.id })), ...prints.map((p) => ({ name: p.title, id: p.id }))].map((x, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: x.name,
            url: `${SITE_URL}/work#${x.id}`,
          })),
        }}
      />
    </div>
  );
}
