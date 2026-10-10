import { credentials, education, experience } from "@/content/profile";
import styles from "./Experience.module.css";

export function Experience() {
  return (
    <section className={`shell ${styles.wrap}`} aria-labelledby="exp-title">
      <header className={styles.head} data-reveal>
        <p className="label label--caps">Where I’ve done it</p>
        <h2 id="exp-title">Experience</h2>
      </header>
      <ol role="list" className={styles.list}>
        {experience.map((r) => (
          <li key={r.org} data-reveal>
            <p className="label">{r.period}</p>
            <div>
              <h3>{r.org}</h3>
              <p className={styles.role}>{r.title} · {r.place}</p>
              <p className={styles.point}>{r.points[0]}</p>
            </div>
          </li>
        ))}
        <li data-reveal>
          <p className="label">{education.period}</p>
          <div>
            <h3>{education.school}</h3>
            <p className={styles.role}>{education.degree}</p>
          </div>
        </li>
      </ol>
      <ul role="list" className={styles.creds} data-reveal>
        {credentials.map((c) => <li key={c.name}><span>{c.name}</span><span className="label">{c.date}</span></li>)}
      </ul>
    </section>
  );
}
