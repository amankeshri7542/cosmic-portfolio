import Link from "next/link";
import { profile } from "@/content/profile";
import styles from "./ContactCta.module.css";

export function ContactCta() {
  return (
    <section className={`shell ${styles.wrap}`} aria-labelledby="cta-title">
      <div className={styles.box} data-reveal>
        <p className="label label--caps"><span className={styles.dot} aria-hidden="true" /> Open to roles and projects</p>
        <h2 id="cta-title">Now let’s build <span>yours.</span></h2>
        <p>A product to build, a system that needs to hold, or a team that needs someone who owns the whole thing — I’d like to hear about it.</p>
        <div className={styles.actions}>
          <Link className="button button--solid" href="/contact">Start a conversation</Link>
          <a className="button" href={`mailto:${profile.email}`}>{profile.email}</a>
          <a className="button" href={profile.linkedin} target="_blank" rel="me noopener">LinkedIn ↗</a>
        </div>
        <p className={`label ${styles.quiet}`}><span lang="hi">राम</span> · curiosity in the work, a constant underneath</p>
      </div>
    </section>
  );
}
