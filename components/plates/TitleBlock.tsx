import styles from "./TitleBlock.module.css";

/** An engineering-drawing title block. Every cell is real data about the work. */
export function TitleBlock({ rows, sheet, className = "" }: { rows: [string, string][]; sheet: string; className?: string }) {
  return (
    <dl className={`${styles.block} ${className}`}>
      {rows.map(([k, v]) => (
        <div key={k} className={styles.row}>
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
      <div className={`${styles.row} ${styles.foot}`}>
        <dt>Sheet</dt>
        <dd>{sheet} <span aria-hidden="true">·</span> drawn by A. Kumar</dd>
      </div>
    </dl>
  );
}
