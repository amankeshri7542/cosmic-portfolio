import Image from "next/image";
import Link from "next/link";
import { chapters, type Tool } from "@/content/story";
import { profile } from "@/content/profile";
import { Stage } from "./Stage";
import { StoryMotion } from "./StoryMotion";
import styles from "./Story.module.css";

function ToolChip({ t }: { t: Tool }) {
  return (
    <li className={styles.tool}>
      {t.logo && <Image src={`/stack/${t.logo}.svg`} alt="" width={18} height={18} className={t.invert ? styles.invert : undefined} unoptimized />}
      <span>{t.name}</span>
    </li>
  );
}

/**
 * The home story: a product is built in front of you as you scroll. The text is ordinary HTML in reading order;
 * the stage beside it is sticky and the motion layer scrubs each step against the scroll.
 */
export function Story() {
  return (
    <section className={styles.story} aria-label="How I build a product">
      <div className={styles.text}>
        <header className={styles.intro} data-chapter="0">
          <p className={`label ${styles.kicker}`}>
            <span className={styles.live} aria-hidden="true" /> {profile.name} · full-stack engineer · Bengaluru
          </p>
          <h1 className={styles.title}>
            Let’s build a product, <span className={styles.accent}>together.</span>
          </h1>
          <p className={styles.lede}>
            Scroll, and I’ll build one in front of you — the interface, the API, the data, the cloud and the AI — with the tools I
            use every day, and the real projects where I’ve done it.
          </p>
          <div className={styles.actions}>
            <a className="button button--solid" href="#interface">Start building <span aria-hidden="true">↓</span></a>
            <a className="button" href={profile.resume}>Resume <span className="label" style={{ color: "inherit" }}>PDF</span></a>
          </div>
          <p className={`label ${styles.now}`}>Now: full-stack at CodeApto · AWS Certified Solutions Architect</p>
        </header>

        {chapters.map((c) => (
          <article key={c.id} id={c.id} className={styles.chapter} data-chapter={c.step} aria-labelledby={`${c.id}-title`}>
            <p className={`label ${styles.step}`}>
              <span className={styles.stepNo}>{String(c.step).padStart(2, "0")}</span> / 06 · {c.label}
            </p>
            <h2 id={`${c.id}-title`} className={styles.h2}>{c.title}</h2>
            <p className={styles.body}>{c.body}</p>
            <ul role="list" className={styles.know} aria-label="What I know here">
              {c.know.map((k) => <li key={k}>{k}</li>)}
            </ul>
            {c.tools.length > 0 && (
              <ul role="list" className={styles.tools} aria-label="Tools">
                {c.tools.map((t) => <ToolChip key={t.name} t={t} />)}
              </ul>
            )}
            {c.builtIn.length > 0 && (
              <p className={styles.built}>
                <span className="label">Where I did this</span>
                {c.builtIn.map((b) => <Link key={b.name} href={b.href}>{b.name}</Link>)}
              </p>
            )}
            {c.id === "run" && (
              <p className={styles.actions}>
                <a className="button button--solid" href="#projects">See what I’ve shipped <span aria-hidden="true">↓</span></a>
                <Link className="button" href="/contact">Start a conversation</Link>
              </p>
            )}
          </article>
        ))}
      </div>

      <div className={styles.stageWrap} aria-hidden="false">
        <div className={styles.stage}>
          <div className={styles.stageBar}>
            <span className="label">product.build</span>
            <ol className={styles.rail} aria-label="Build progress">
              {chapters.map((c) => (
                <li key={c.id} data-rail={c.step}><span className="visually-hidden">{c.label}</span></li>
              ))}
            </ol>
            <span className={`label ${styles.stageStep}`} data-stage-label>step 0 / 6</span>
          </div>
          <Stage />
          <ol className={styles.log} aria-hidden="true">
            {chapters.flatMap((c) => c.log.map((l, i) => <li key={`${c.id}${i}`} data-s={c.step}>{l}</li>))}
          </ol>
        </div>
      </div>
      <StoryMotion />
    </section>
  );
}
