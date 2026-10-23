import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { credentials, education, experience, profile, stack, SITE_URL } from "@/content/profile";
import { JsonLd, pageMetadata, personId } from "@/lib/seo";
import { Tulsi } from "@/components/about/Tulsi";
import { Ambient, Icon } from "@/components/acid/Ambient";
import { PageHead } from "@/components/acid/PageHead";
import { PaletteHalo } from "@/components/acid/PaletteHalo";
import { Drip, Melt, Wobble } from "@/components/acid/Text";
import type { IconName } from "@/components/acid/icons";
import { Head, ContactCard } from "@/components/home/Sections";
import { Drips } from "@/components/home/Hero";
import { plates, prints } from "@/content/work";
import { faq, faqUpdated } from "@/content/faq";
import { fresh } from "@/content/services";
import styles from "./about.module.css";

export const metadata: Metadata = pageMetadata(
  "/about",
  "About Aman Keshri (Aman Kumar)",
  "Aman Keshri (Aman Kumar) is a freelance full-stack developer in Bengaluru working across React, TypeScript, Rust, PostgreSQL and AWS. Experience, education, certifications and how he works.",
);

type Vars = CSSProperties & Record<`--${string}`, string>;

const principles = [
  { title: "Start with the business", body: "Who uses it, what slows them down, what must never be wrong. The right problem is half the product, so that is where I begin." },
  { title: "Own every layer", body: "Interface, API, data model and cloud, plus applied AI where it truly helps. I don’t stop at the edge of my ticket." },
  { title: "Design for the bad day", body: "Transactions that can’t leave half a record, permissions checked on the server, deployments that roll back cleanly." },
];

const facts = [
  { n: String(plates.length + prints.length + Object.keys(fresh).length), label: "PROJECTS BUILT" },
  { n: String(experience.length), label: "ENGINEERING ROLES SINCE 2025" },
  { n: "B.E.", label: "COMPUTER SCIENCE, CLASS OF 2025" },
  { n: "3rd", label: "PLACE AT CODEATHON 2023" },
];

const layerIcons: Partial<Record<string, IconName>> = {
  React: "react", "Next.js": "nextdotjs", TypeScript: "typescript", "React Native / Expo": "expo",
  "Node.js": "nodedotjs", Express: "express", "Rust / Axum": "rust", WebSockets: "socketdotio", JWT: "jsonwebtokens",
  PostgreSQL: "postgresql", MongoDB: "mongodb", Redis: "redis",
  Docker: "docker", "GitHub Actions": "githubactions", Nginx: "nginx", Linux: "linux", "Gemini Vision": "googlegemini",
};

export default function AboutPage() {
  return (
    <div className="lab">
      <Ambient />
      <div className="wrap">
        <div className={styles.head}>
          <PageHead
            kicker="ABOUT ✺ WHO YOU’D WORK WITH"
            title="Hello, I’m *Aman.*"
            lede="I’m Aman Keshri, a freelance full-stack developer in Bengaluru. I like owning a feature end to end: the business problem, the data model, the interface, the API and the AWS it runs on."
          >
            <Melt
              className={styles.more}
              text="Most of my work lives where being wrong is expensive: billing that has to agree with stock, approvals that must not skip a step, messages that should reach everyone who’s listening. Right now I’m building a procure-to-pay platform at CodeApto with React, TypeScript, Rust and PostgreSQL."
            />
            <p className="row">
              <a className="cta cta-main cta-sm" href={profile.resume}>Resume (PDF)</a>
              <Link className="cta cta-ghost cta-sm" href="/contact">Start a project</Link>
            </p>
          </PageHead>
          <div className={styles.portrait}>
            <PaletteHalo>
              <span className="rings" aria-hidden="true" />
              <span className="portrait">
                <Image src="/about/aman-halo.webp" alt="Portrait of Aman Kumar Keshri" width={480} height={480} priority sizes="(max-width: 600px) 56vw, 320px" />
              </span>
            </PaletteHalo>
          </div>
        </div>

        <div className={`stats ${styles.facts}`}>
          {facts.map((s, i) => (
            <div className="stat" key={s.label}>
              <Drip className="disp stat-n" style={{ color: `var(--c${i + 1})` }} text={s.n} />
              <Drip className="mono stat-l" text={s.label} />
            </div>
          ))}
        </div>

        <section aria-labelledby="how-title" className="sec block" data-sec="services">
          <Head n="01" kicker="HOW I WORK ✺ THREE HABITS" title="How I *work*" id="how-title" />
          <ol className={styles.habits} role="list">
            {principles.map((p, i) => (
              <li key={p.title} className="svc" style={{ background: `var(--c${i + 1})` }}>
                <span className="glare" aria-hidden="true" />
                <span className={styles.hn} aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <Wobble as="h3" className="disp svc-t" text={p.title} />
                <Melt className="svc-b" text={p.body} />
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="exp-title" className="sec block" id="experience" data-sec="experience">
          <Head n="02" kicker="EXPERIENCE ✺ SINCE FEB 2025" title="Where I’ve *built*" id="exp-title" flip />
          <ol className={styles.timeline} role="list">
            {experience.map((r, i) => (
              <li key={r.org} className={styles.role} style={{ "--pc": `var(--c${(i % 3) + 1})` } as Vars}>
                <span className={styles.dot} aria-hidden="true" />
                <Drip as="p" className={`mono ${styles.when}`} text={`${r.period.toUpperCase()} · ${r.place.toUpperCase()}`} />
                <Wobble as="h3" className={`disp ${styles.org}`} text={r.org} melt={0.12} />
                <p className={styles.title}>{r.title}</p>
                <ul role="list" className={styles.points}>
                  {r.points.map((pt) => <li key={pt}><Melt as="span" className="pt" text={pt} /></li>)}
                </ul>
              </li>
            ))}
            <li className={styles.role} style={{ "--pc": "var(--c4)" } as Vars}>
              <span className={styles.dot} aria-hidden="true" />
              <Drip as="p" className={`mono ${styles.when}`} text={education.period} />
              <Wobble as="h3" className={`disp ${styles.org}`} text={education.degree} melt={0.12} />
              <p className={styles.title}>{education.school}</p>
            </li>
          </ol>
        </section>

        <section aria-labelledby="cred-title" className="sec block" data-sec="fresh">
          <Head n="03" kicker="CREDENTIALS ✺ PAPER TRAIL" title="Certified & *recognised*" id="cred-title" size="sm" />
          <div className="creds">
            {credentials.map((c) => (
              <div className="cred" key={c.name}>
                <Drip className="mono cred-d" text={c.date.toUpperCase()} />
                <Drip className="cred-t" text={c.name} />
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="tools-title" className="sec block" data-sec="stack">
          <Head n="04" kicker="TOOLBOX ✺ SIX LAYERS" title="Tools I *reach* for" id="tools-title" flip />
          <div className={styles.tools}>
            {Object.entries(stack).map(([layer, items], i) => (
              <div key={layer} className={styles.layer} style={{ "--pc": `var(--c${(i % 4) + 1})` } as Vars}>
                <Drip as="h3" className={`disp ${styles.layerT}`} text={layer} />
                <ul role="list" className="chips">
                  {items.map((t) => {
                    const icon = layerIcons[t];
                    return (
                      <li key={t} className={icon ? "chip" : "chip txt"}>
                        {icon && <Icon name={icon} />}
                        {t}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="faq-title" className="sec block" id="quick-answers" data-sec="faq">
          <Head n="05" kicker={`QUICK ANSWERS ✺ ${faq.length} OF THEM`} title="Quick *answers*" id="faq-title" size="sm" />
          <div>
            {faq.map((f, i) => (
              <details key={f.q} open={i < 2}>
                <summary className="acc">
                  <h3 className="disp faq-q">
                    <Drip className="qn" text={`Q${String(i + 1).padStart(2, "0")}`} />
                    {f.q}
                  </h3>
                  <span className="plus" aria-hidden="true">+</span>
                </summary>
                <Melt className="faq-a" text={f.a} />
              </details>
            ))}
          </div>
          <p className="hint">
            Last updated <time dateTime={faqUpdated}>{new Date(faqUpdated).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</time>
          </p>
        </section>

        <section aria-labelledby="quiet-title" className={`sec block ${styles.quiet}`} data-sec="contact">
          <div className={styles.sprig}>
            <span className={styles.glow} aria-hidden="true" />
            <Tulsi />
          </div>
          <div className={styles.quietText}>
            <Drip as="h2" id="quiet-title" className="kicker" text="UNDERNEATH ✺ THE QUIET PART" />
            <p className={styles.ram}>
              Beyond the complexity, <span lang="hi">राम</span> — Ram Naam — is my quieter centre.
            </p>
            <Melt className="body-p" text="Curiosity in the work, a constant underneath it. Still learning. Still looking up." />
          </div>
        </section>

        <ContactCard />
        <Drips lime />
      </div>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          url: `${SITE_URL}/about`,
          mainEntity: { "@id": personId },
          dateModified: faqUpdated,
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          url: `${SITE_URL}/about#quick-answers`,
          dateModified: faqUpdated,
          mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />
    </div>
  );
}
