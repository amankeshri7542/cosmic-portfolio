import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { credentials, education, experience, profile, stack, SITE_URL } from "@/content/profile";
import { JsonLd, pageMetadata, personId } from "@/lib/seo";
import { Tulsi } from "@/components/about/Tulsi";
import styles from "./about.module.css";

export const metadata: Metadata = pageMetadata(
  "/about",
  "About Aman Kumar",
  "Aman Kumar is a full-stack software engineer in Bengaluru working across React, TypeScript, Rust, PostgreSQL and AWS. Experience, education, certifications and how he works.",
);

// Set when the portrait is supplied: { src, width, height, alt }.
const portrait: { src: string; width: number; height: number; alt: string } | null = null;

const principles = [
  { title: "Start with the business", body: "Who uses it, what slows them down, what must never be wrong. A useful product begins with the right problem." },
  { title: "Follow the feature through every layer", body: "Interface, API, data model and cloud — and applied AI where it genuinely helps. I don’t stop at the boundary of my part." },
  { title: "Design for the bad day", body: "Transactions that can’t leave half a record, permissions checked where they matter, deployments that roll back cleanly." },
];

export default function AboutPage() {
  return (
    <div className={`shell ${styles.page}`}>
      <header className={styles.head} data-has-portrait={portrait ? "" : undefined}>
        <div className={styles.intro}>
          <p className="label label--caps">About</p>
          <h1>Hello, I’m Aman.</h1>
          <p className={styles.lede}>
            I’m a full-stack software engineer in Bengaluru. I like owning a feature end to end: understanding the business
            problem, shaping the data, building the interface and the API, and running it on AWS.
          </p>
          <p>
            Most of my work sits where correctness matters — billing that has to agree with stock, workflows that must not skip a
            step, messages that should reach everyone who’s listening. Right now I’m building a procure-to-pay platform at
            CodeApto with React, TypeScript, Rust and PostgreSQL.
          </p>
          <p className={styles.actions}>
            <a className="button button--solid" href={profile.resume}>Resume (PDF)</a>
            <Link className="button" href="/contact">Get in touch</Link>
          </p>
        </div>
        {portrait && (
          <figure className={styles.portrait}>
            <Image src={portrait.src} alt={portrait.alt} width={portrait.width} height={portrait.height} sizes="(max-width: 860px) 100vw, 36vw" priority />
            <figcaption className="label">Printed as a cyanotype. Bengaluru, 2026.</figcaption>
          </figure>
        )}
      </header>

      <section aria-labelledby="how-title" className={styles.section}>
        <h2 id="how-title" className="label label--caps">How I work</h2>
        <ul role="list" className={styles.principles}>
          {principles.map((p) => (
            <li key={p.title}>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="exp-title" className={styles.section}>
        <h2 id="exp-title" className="label label--caps">Experience</h2>
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

      <section aria-labelledby="cred-title" className={`${styles.section} ${styles.split}`}>
        <div>
          <h2 id="cred-title" className="label label--caps">Certifications & recognition</h2>
          <ul role="list" className={styles.creds}>
            {credentials.map((c) => <li key={c.name}><span>{c.name}</span><span className="label">{c.date}</span></li>)}
          </ul>
        </div>
        <div>
          <h2 className="label label--caps">Tools I reach for</h2>
          <dl className={styles.stack}>
            {Object.entries(stack).map(([k, v]) => (
              <div key={k}><dt className="label">{k}</dt><dd>{v.join(" · ")}</dd></div>
            ))}
          </dl>
        </div>
      </section>

      <section aria-labelledby="quiet-title" className={`${styles.section} ${styles.quiet}`}>
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
          dateModified: "2026-10-10",
        }}
      />
    </div>
  );
}
