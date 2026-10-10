import Image from "next/image";
import Link from "next/link";
import { chapters, type Tool } from "@/content/story";
import { profile } from "@/content/profile";
import { getStoryCode } from "@/lib/story-code";
import { Stage } from "./Stage";
import { StoryMotion } from "./StoryMotion";
import { StepControls } from "./StepControls";
import { HighlightOnHover, MotionToggle, Rail } from "./StoryChrome";
import styles from "./Story.module.css";

// Which part of the stage each chapter's tools light up.
const TARGET: Record<string, string> = { interface: "ui", api: "api", data: "db", ship: "ship", ai: "ai", run: "" };

function ToolChip({ t }: { t: Tool }) {
  return (
    <li className={styles.tool}>
      {t.logo && <Image src={`/stack/${t.logo}.svg`} alt="" width={18} height={18} className={t.invert ? styles.invert : undefined} unoptimized />}
      <span>{t.name}</span>
    </li>
  );
}

/**
 * The home story: a product is built in front of you as you scroll, and you get to use it at every step.
 * The text is ordinary HTML in reading order; the stage beside it is sticky and the motion layer scrubs each step.
 */
export async function Story() {
  const code = await getStoryCode();
  return (
    <section className={styles.story} aria-label="How I build a product">
      <div className={styles.text}>
        <header className={styles.intro} data-chapter="0">
          <p className={`label ${styles.kicker}`}>{profile.name} · full-stack engineer · Bengaluru</p>
          <h1 className={styles.title}>
            Let’s build a product, <span className={styles.accent}>together.</span>
          </h1>
          <p className={styles.lede}>
            A billing app for a hardware store — the kind of thing I build for real. Scroll and it comes together layer by layer.
            Everything you can press works: you’ll make the first sale, break it, and watch it recover.
          </p>
          <div className={styles.actions}>
            <a className="button button--solid" href="#interface">Start building <span aria-hidden="true">↓</span></a>
            <a className="button" href={profile.resume}>Resume <span className="label" style={{ color: "inherit" }}>PDF</span></a>
          </div>
          <p className={`label ${styles.now}`}>Now: full-stack at CodeApto · AWS Certified Solutions Architect – Associate</p>
        </header>

        {chapters.map((c) => (
          <article key={c.id} id={c.id} className={styles.chapter} data-chapter={c.step} aria-labelledby={`${c.id}-title`}>
            <p className={`label ${styles.step}`}>
              <span className={styles.stepNo}>{String(c.step).padStart(2, "0")}</span> / 06 · {c.label}
            </p>
            <h2 id={`${c.id}-title`} className={styles.h2}>{c.title}</h2>
            <p className={styles.body}>{c.body}</p>
            <StepControls id={c.id} />
            <ul role="list" className={styles.know} aria-label="What I know here">
              {c.know.map((k) => <li key={k}>{k}</li>)}
            </ul>
            {c.tools.length > 0 && (
              <HighlightOnHover target={TARGET[c.id]}>
                <ul role="list" className={styles.tools} aria-label="Tools">
                  {c.tools.map((t) => <ToolChip key={t.name} t={t} />)}
                </ul>
              </HighlightOnHover>
            )}
            {code[c.id] && (
              <details className={styles.code}>
                <summary>
                  <span>Read the code</span>
                  <span className="label">{code[c.id].file}</span>
                </summary>
                <div className={styles.codeBody} dangerouslySetInnerHTML={{ __html: code[c.id].html }} />
                <p className="label">Simplified from production code; names changed.</p>
              </details>
            )}
            {c.builtIn.length > 0 && (
              <p className={styles.built}>
                <span className="label">Where I did this for real</span>
                {c.builtIn.map((b) => <Link key={b.name} href={b.href}>{b.name}</Link>)}
              </p>
            )}
            {c.id === "run" && (
              <p className={styles.actions}>
                <a className="button button--solid" href="#receipt">See what you built <span aria-hidden="true">↓</span></a>
              </p>
            )}
          </article>
        ))}
      </div>

      <div className={styles.stageWrap}>
        <div className={styles.stage}>
          <div className={styles.stageBar}>
            <span className="label">billing.store</span>
            <Rail steps={chapters.map((c) => ({ id: c.id, label: c.label }))} />
            <span className={`label ${styles.stageStep}`} data-stage-label>step 0 / 6</span>
            <MotionToggle />
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
