import type { Metadata } from "next";
import Link from "next/link";
import { credentials, education, experience, profile, stack, SITE_URL } from "@/content/profile";
import { JsonLd, pageMetadata, personId } from "@/lib/seo";
import { Tulsi } from "@/components/about/Tulsi";
import Image from "next/image";
import { Ambient } from "@/components/acid/Ambient";
import { PageHead } from "@/components/acid/PageHead";
import { PaletteHalo } from "@/components/acid/PaletteHalo";
import { Wobble } from "@/components/acid/Text";
import { faq, faqUpdated } from "@/content/faq";
import styles from "./about.module.css";

export const metadata: Metadata = pageMetadata(
  "/about",
  "About Aman Keshri (Aman Kumar)",
  "Aman Keshri (Aman Kumar) is a freelance full-stack software engineer in Bengaluru working across React, TypeScript, Rust, PostgreSQL and AWS. Experience, education, certifications and how he works.",
);

const principles = [
  { title: "Start with the business", body: "Who uses it, what slows them down, what must never be wrong. A useful product begins with the right problem." },
  { title: "Follow the feature through every layer", body: "Interface, API, data model and cloud — and applied AI where it genuinely helps. I don’t stop at the boundary of my part." },
  { title: "Design for the bad day", body: "Transactions that can’t leave half a record, permissions checked where they matter, deployments that roll back cleanly." },
];

export default function AboutPage() {
  return (
    <div className="lab">
    <Ambient />
    <div className={`shell ${styles.page}`}>
      <div className={styles.head} data-has-portrait="">
        <PageHead
          kicker="ABOUT ✺ WHO YOU’D WORK WITH"
          title="Hello, I’m *Aman.*"
          lede="I’m a full-stack software engineer in Bengaluru. I like owning a feature end to end: understanding the business problem, shaping the data, building the interface and the API, and running it on AWS."
        >
          <p className={styles.more}>
            Most of my work sits where correctness matters: billing that has to agree with stock, workflows that must not skip a
            step, messages that should reach everyone who’s listening. Right now I’m building a procure-to-pay platform at
            CodeApto with React, TypeScript, Rust and PostgreSQL.
          </p>
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

      <section aria-labelledby="how-title" className={`sec ${styles.section}`} data-sec="about">
        <Wobble id="how-title" className="h2 sm" text="How I *work*" />
        <ul role="list" className={styles.principles}>
          {principles.map((p) => (
            <li key={p.title}>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="exp-title" className={`sec ${styles.section}`} id="experience" data-sec="experience">
        <Wobble id="exp-title" className="h2 sm" text="Where I’ve *built*" />
        <ol role="list" className={styles.timeline}>
          {experience.map((r) => (
            <li key={r.org}>
              <p className="label">{r.period} · {r.place}</p>
              <h3>{r.title} <span className={styles.at}>at {r.org}</span></h3>
              <ul role="list">{r.points.map((pt) => <li key={pt}>{pt}</li>)}</ul>
            </li>
          ))}
          <li>
            <p className="label">{education.period}</p>
            <h3>{education.degree} <span className={styles.at}>at {education.school}</span></h3>
          </li>
        </ol>
      </section>

      <section aria-labelledby="cred-title" className={`sec ${styles.section} ${styles.split}`} data-sec="stack">
        <div>
          <Wobble id="cred-title" className="h2 sm" text="Certified & *recognised*" />
          <ul role="list" className={styles.creds}>
            {credentials.map((c) => <li key={c.name}><span>{c.name}</span><span className="label">{c.date}</span></li>)}
          </ul>
        </div>
        <div>
          <Wobble className="h2 sm" text="Tools I *reach* for" />
          <dl className={styles.stack}>
            {Object.entries(stack).map(([k, v]) => (
              <div key={k}><dt className="label">{k}</dt><dd>{v.join(" · ")}</dd></div>
            ))}
          </dl>
        </div>
      </section>

      <section aria-labelledby="faq-title" className={`sec ${styles.section}`} id="quick-answers" data-sec="faq">
        <Wobble id="faq-title" className="h2 sm" text="Quick *answers*" />
        <dl className={styles.faq}>
          {faq.map((f) => (
            <div key={f.q}>
              <dt><h3>{f.q}</h3></dt>
              <dd>{f.a}</dd>
            </div>
          ))}
        </dl>
        <p className="label">Last updated <time dateTime={faqUpdated}>{new Date(faqUpdated).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</time></p>
      </section>

      <section aria-labelledby="quiet-title" className={`sec ${styles.section} ${styles.quiet}`} data-sec="contact">
        <Tulsi />
        <div>
          <h2 id="quiet-title" className="label label--caps">Underneath</h2>
          <p className={styles.ram}>
            Beyond the complexity, <span lang="hi">राम</span> — Ram Naam — is my quieter centre.
          </p>
          <p>Curiosity in the work, a constant underneath it. Still learning. Still looking up.</p>
        </div>
      </section>

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
    </div>
  );
}
