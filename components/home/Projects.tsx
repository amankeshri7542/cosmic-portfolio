import Image from "next/image";
import Link from "next/link";
import { plates, prints } from "@/content/work";
import styles from "./Projects.module.css";

const mechanism: Record<string, string> = {
  "hardware-erp": "BEGIN → lock stock → invoice · stock · ledger → COMMIT",
  procurement: "request → approve → award → release  · role ✓ state ✓",
  vartalaap: "send → fan-out → A ✓  B ✕ 410  C ✓",
};

export function Projects() {
  return (
    <section id="projects" className={`shell ${styles.wrap}`} aria-labelledby="projects-title">
      <header className={styles.head} data-reveal>
        <p className="label label--caps">What I’ve shipped</p>
        <h2 id="projects-title">Real systems, and the decisions behind them.</h2>
        <p>Three I can take apart for you, then everything else — business platforms, AI products and cloud infrastructure.</p>
      </header>

      <ol role="list" className={styles.featured}>
        {plates.map((p) => (
          <li key={p.id} data-reveal>
            <Link href={`/work#${p.id}`} className={styles.card}>
              <span className="label">{p.period} · {p.status}</span>
              <span className={styles.cardTitle}>{p.name}</span>
              <span className={styles.thesis}>{p.thesis}</span>
              <code className={styles.mech}>{mechanism[p.id]}</code>
              <span className={styles.stack}>{p.stack.join(" · ")}</span>
              <span className={styles.more}>Open the case study — try breaking it <span aria-hidden="true">→</span></span>
            </Link>
          </li>
        ))}
      </ol>

      <ul role="list" className={styles.grid}>
        {prints.map((p) => (
          <li key={p.id} className={styles.item} data-reveal>
            <Link href={`/work#${p.id}`} className={styles.shot}>
              <Image src={p.image.src} alt={p.image.alt} width={p.image.width} height={p.image.height} sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw" />
            </Link>
            <p className="label">{p.kind} · {p.date}</p>
            <h3><Link href={`/work#${p.id}`}>{p.title}</Link></h3>
            <p className={styles.desc}>{p.description}</p>
            <p className={styles.tech}>{p.tech.slice(0, 5).join(" · ")}</p>
            {p.note && <p className={`label ${styles.note}`}>{p.note}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}
