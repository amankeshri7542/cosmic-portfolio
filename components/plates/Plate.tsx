import type { Plate as PlateData } from "@/content/work";
import { TitleBlock } from "./TitleBlock";
import styles from "./Plate.module.css";

/** One engineering case study, laid out like a drawing sheet with its title block in the corner. */
export function Plate({ plate, instrument, headingLevel = 3 }: { plate: PlateData; instrument: React.ReactNode; headingLevel?: 2 | 3 }) {
  const H = `h${headingLevel}` as "h2" | "h3";
  const Sub = `h${headingLevel + 1}` as "h3" | "h4";
  return (
    <article id={plate.id} className={styles.plate} aria-labelledby={`${plate.id}-name`} data-reveal>
      <div className={styles.text}>
        <p className={`label label--caps ${styles.no}`}>Plate {plate.plate} · {plate.system}</p>
        <p className={styles.thesis}>{plate.thesis}</p>
        <H id={`${plate.id}-name`} className={styles.name}>{plate.name}</H>
        <p className={styles.lede}>{plate.lede}</p>
        {plate.link && (
          <p><a className="button" href={plate.link.href} target="_blank" rel="noopener">{plate.link.label} <span aria-hidden="true">↗</span></a></p>
        )}
      </div>

      <div className={styles.sheet}>
        <span className={styles.reg} aria-hidden="true" />
        {instrument}
        <TitleBlock
          className={styles.block}
          rows={[
            ["System", plate.system],
            ["Role", plate.role],
            ["Period", plate.period],
            ["Status", plate.status],
            ["Stack", plate.stack.join(" · ")],
          ]}
          sheet={`Plate ${plate.plate}`}
        />
      </div>

      <div className={styles.notes}>
        {plate.notes.map((n) => (
          <section key={n.heading} className={styles.note}>
            <Sub className="label label--caps">{n.heading}</Sub>
            <p>{n.body}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
