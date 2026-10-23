import type { CSSProperties, ReactNode } from "react";
import type { Plate as PlateData } from "@/content/work";
import { caseHeads } from "@/content/services";
import { Drip, Melt, Wobble } from "@/components/acid/Text";
import styles from "./Plate.module.css";

type Vars = CSSProperties & Record<`--${string}`, string>;

/** One case study: a wobbling thesis, the working model in a coloured frame, its spec sheet and three notes. */
export function Plate({ plate, instrument, ink, tryIt }: { plate: PlateData; instrument: ReactNode; ink: 1 | 2 | 3 | 4; tryIt: string }) {
  const thesis = caseHeads[plate.id].thesis;
  return (
    <article id={plate.id} className={`sec ${styles.plate}`} data-sec="work" aria-labelledby={`${plate.id}-name`} style={{ "--pc": `var(--c${ink})` } as Vars}>
      <div className={styles.head}>
        <span className={styles.no} aria-hidden="true">{String(["I", "II", "III"].indexOf(plate.plate) + 1).padStart(2, "0")}</span>
        <Drip as="p" className={`kicker ${styles.kick}`} text={`CASE Nº ${plate.plate} ✺ ${plate.system.toUpperCase()}`} />
        <Wobble id={`${plate.id}-name`} className={`h2 ${styles.thesis}`} text={thesis} label={`${plate.name}: ${thesis.replace(/\*/g, "")}`} />
        <div className={styles.meta}>
          <span className={`stamp ${styles.name}`}>{plate.name}</span>
          <Drip className="pill" text={plate.role} />
          {plate.period !== plate.role && <Drip className="pill" text={plate.period} />}
          <Drip className={`pill ${styles.live}`} text={`● ${plate.status}`} />
        </div>
        <Melt className={styles.lede} text={plate.lede} />
        {plate.link && (
          <p className="row">
            <a className="cta cta-main cta-sm" href={plate.link.href} target="_blank" rel="noopener">{plate.link.label} <span aria-hidden="true">↗</span></a>
          </p>
        )}
      </div>

      <div className={styles.lab}>
        <div className={styles.try}>
          <svg className="arrow" viewBox="0 0 70 44" width="56" height="36" aria-hidden="true">
            <path pathLength={1} d="M6 6 C 18 4, 40 8, 48 22 C 54 32, 56 36, 58 40" />
            <path pathLength={1} d="M50 34 L58 41 L64 31" />
          </svg>
          <Drip as="p" className="hint" text={tryIt} />
        </div>
        <div className={styles.frame}>{instrument}</div>
        <aside className={styles.spec} aria-label={`${plate.name} at a glance`}>
          <Drip as="p" className={`mono ${styles.specK}`} text="SPEC SHEET" />
          <dl>
            {[["System", plate.system], ["Role", plate.role], ["Period", plate.period], ["Status", plate.status]].map(([k, v]) => (
              <div key={k} className="rline"><dt>{k.toUpperCase()}</dt><dd>{v}</dd></div>
            ))}
          </dl>
          <div className="pills">{plate.stack.map((t) => <span className="pill" key={t}>{t}</span>)}</div>
        </aside>
      </div>

      <ol className={styles.notes} role="list">
        {plate.notes.map((n, i) => (
          <li key={n.heading} className={styles.note}>
            <span className={styles.nn} aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
            <Drip as="h3" className={`disp ${styles.nh}`} text={n.heading} />
            <Melt className={styles.nb} text={n.body} />
          </li>
        ))}
      </ol>
    </article>
  );
}
