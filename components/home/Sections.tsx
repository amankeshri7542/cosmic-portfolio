import Link from "next/link";
import { Drip, Melt, Wobble } from "@/components/acid/Text";
import { experience, credentials, education, profile } from "@/content/profile";
import { fresh, habits, homeFaq, processSteps, services, terms } from "@/content/services";
import { getPublishedPosts } from "@/lib/posts";
import { formatDate } from "@/lib/post-types";
import { erp, homeArt, sysArt, type Figure } from "./art";

/** A numbered section head: outlined number, kicker pill and a wobbling heading. */
export function Head({ n, kicker, title, id, flip, size, hint }: { n: string; kicker: string; title: string | string[]; id: string; flip?: boolean; size?: "xl" | "sm"; hint?: string }) {
  return (
    <div className={flip ? "hd flip" : "hd"} data-n={n}>
      <Drip as="p" className="kicker" text={kicker} />
      <Wobble id={id} className={size ? `h2 ${size}` : "h2"} text={title} />
      {hint && <Drip as="p" className="hint" text={hint} />}
    </div>
  );
}

export function Blueprint({ fig, caption, tag, label, wide }: { fig: Figure; caption: string; tag: string; label: string; wide?: boolean }) {
  return (
    <figure className={wide ? "bp wide" : "bp"} aria-label={label}>
      <figcaption>{caption} <span>{tag}</span></figcaption>
      <svg className="sd" viewBox={fig.viewBox} aria-hidden="true" dangerouslySetInnerHTML={{ __html: fig.svg }} />
      {fig.code && <pre className="code" aria-hidden="true" dangerouslySetInnerHTML={{ __html: fig.code }} />}
    </figure>
  );
}

export function About() {
  return (
    <section className="sec block" data-sec="about" id="about" aria-labelledby="about-h">
      <Head n="01" kicker="ABOUT ✺ WHO YOU’D WORK WITH" title="Hello, I’m *Aman.*" id="about-h" size="xl" />
      <div className="grid-2">
        <Melt className="lead-p" text="I’m a full-stack software engineer in Bengaluru. I like owning a feature end to end: understanding the business problem, shaping the data, building the interface and the API, and running it on AWS." />
        <div className="col">
          <Melt className="body-p" text="Most of my work sits where correctness matters: billing that has to agree with stock, workflows that must not skip a step, messages that should reach everyone who’s listening. Right now I’m building a procure-to-pay platform at CodeApto with React, TypeScript, Rust and PostgreSQL." />
          <Melt className="body-p" text="Before that I built a full business platform for a cement retailer in Patna, and moved client apps onto AWS. B.E. in Computer Science, AWS Certified Solutions Architect." />
          <div className="row">
            <a href={profile.resume} className="cta cta-ghost cta-sm">Resume (PDF)</a>
            <Link href="/about" className="cta cta-ghost cta-sm">My story</Link>
          </div>
        </div>
      </div>
      <div className="grid-3">
        {habits.map((h, i) => (
          <div className="pr" key={h.title}>
            <Drip className="mono pr-k" style={{ color: `var(--c${i + 1})` }} text={`HABIT Nº ${i + 1}`} />
            <Drip className="disp pr-t" text={h.title} />
            <Melt as="span" className="pr-b" text={h.body} />
          </div>
        ))}
      </div>
      <div className="ram">
        <span lang="hi">राम</span>
        <Melt text="Beyond the complexity, Ram Naam is my quieter centre. Curiosity in the work, a constant underneath it. Still learning. Still looking up." />
      </div>
      <Blueprint
        wide
        fig={erp}
        caption="// one sale, every layer"
        tag="HARDWARE STORE ERP · SIMPLIFIED"
        label="Simplified diagram of the Hardware Store ERP: browser, CloudFront, an Express API, PostgreSQL on RDS for the sale transaction, and a BullMQ queue with a PDF worker writing to private S3."
      />
    </section>
  );
}

export function Services() {
  return (
    <section className="sec block" data-sec="services" id="services" aria-labelledby="svc-h">
      <div className="row-head">
        <Head n="03" kicker="SERVICES ✺ WHAT YOU CAN HIRE ME FOR" title={["One engineer,", "*every* layer"]} id="svc-h" />
        <Drip as="p" className="hint hover-only" text="Move over a card. It tilts toward you." />
      </div>
      <div className="grid-4">
        {services.map((c, i) => (
          <article className="svc" key={c.title} style={{ background: `var(--c${i + 1})` }}>
            <span className="glare" aria-hidden="true" />
            <Drip className="mono svc-k" text={c.kicker} />
            <Wobble as="h3" className="disp svc-t" text={c.title} />
            <Melt className="svc-b" text={c.body} />
            <Drip as="p" className="mono svc-p" text={`Proof → ${c.proof}`} />
          </article>
        ))}
      </div>
    </section>
  );
}

export function Fresh() {
  const { systemLab: a, dreamHome: b, subhangi: c } = fresh;
  return (
    <section className="sec block" data-sec="fresh" aria-labelledby="fresh-h">
      <div className="row-head">
        <Head n="06" kicker="FRESH BUILDS ✺ LIVE LINKS" title={["Fresh off", "the *build*"]} id="fresh-h" />
        <Drip as="p" className="hint hover-only" text="Hover: a server fails, the windows light up, the light moves." />
      </div>
      <div className="grid-fresh">
        <a className="feat wide" href={a.href} target="_blank" rel="noopener">
          <div className="art art-sys">
            <svg viewBox={sysArt.viewBox} aria-hidden="true" dangerouslySetInnerHTML={{ __html: sysArt.svg }} />
          </div>
          <div className="fbody">
            <Drip className="mono f-k" style={{ color: "var(--c1)" }} text={a.kicker} />
            <Wobble as="h3" className="disp f-t" text={a.title} />
            <Melt className="f-b" text={a.body} />
            <div className="tags">{a.tags.map((t) => <span className="ftag" key={t}>{t}</span>)}</div>
            <span className="go">Open live ↗</span>
          </div>
        </a>
        <a className="feat" href={b.href} target="_blank" rel="noopener">
          <div className="art art-home">
            <svg viewBox={homeArt.viewBox} aria-hidden="true" dangerouslySetInnerHTML={{ __html: homeArt.svg }} />
          </div>
          <div className="fbody">
            <Drip className="mono f-k" style={{ color: "var(--c4)" }} text={b.kicker} />
            <Wobble as="h3" className="disp f-t" text={b.title} />
            <Melt className="f-b" text={b.body} />
            <span className="go">Open live ↗</span>
          </div>
        </a>
        <a className="feat" href={c.href} target="_blank" rel="noopener">
          <div className="art art-flute" aria-hidden="true">
            <span className="flute-t">A home in<br />fluted espresso</span>
          </div>
          <div className="fbody">
            <Drip className="mono f-k" style={{ color: "var(--c3)" }} text={c.kicker} />
            <Wobble as="h3" className="disp f-t" text={c.title} />
            <Melt className="f-b" text={c.body} />
            <span className="go">Open live ↗</span>
          </div>
        </a>
      </div>
    </section>
  );
}

export function Experience() {
  return (
    <section className="sec block" data-sec="experience" id="experience" aria-labelledby="exp-h">
      <Head n="02" kicker="EXPERIENCE ✺ SINCE FEB 2025" title="Where I’ve *built*" id="exp-h" flip />
      <div>
        {experience.map((j, i) => (
          <details key={j.org} open={i === 0}>
            <summary className="acc">
              <span className="acc-h">
                <Drip className="mono acc-k" text={`${j.period.toUpperCase()} · ${j.place.toUpperCase()}`} />
                <Drip className="disp acc-t" text={j.org} />
                <span className="acc-s">{j.title}</span>
              </span>
              <span className="plus" aria-hidden="true">+</span>
            </summary>
            <div className="acc-body">
              {j.points.map((p) => <Melt key={p} className="pt" text={p} />)}
            </div>
          </details>
        ))}
      </div>
      <div className="creds">
        {[...credentials.map((c) => ({ d: c.date, t: c.name })), { d: education.period, t: `${education.degree}, ${education.school}` }].map((c) => (
          <div className="cred" key={c.t}>
            <Drip className="mono cred-d" text={c.d.toUpperCase()} />
            <Drip className="cred-t" text={c.t} />
          </div>
        ))}
      </div>
    </section>
  );
}

export function Process() {
  return (
    <section className="sec block" data-sec="proc" aria-labelledby="proc-h">
      <Head n="09" kicker="PROCESS ✺ HOW WE’D WORK" title={["Four steps,", "*no* surprises"]} id="proc-h" />
      <ol className="grid-steps" role="list">
        {processSteps().map((s, i) => (
          <li className="step" key={s.title}>
            <Drip className="num" text={String(i + 1).padStart(2, "0")} />
            <Drip className="disp step-t" text={s.title} />
            <Melt as="span" className="step-b" text={s.body} />
          </li>
        ))}
      </ol>
    </section>
  );
}

export function Faq() {
  return (
    <section className="sec block" data-sec="faq" aria-labelledby="faq-h">
      <Head n="10" kicker="QUICK ANSWERS ✺ SIX OF THEM" title="Before you *ask*" id="faq-h" size="sm" />
      <div>
        {homeFaq.map((f, i) => (
          <details key={f.q} open={i === 0}>
            <summary className="acc">
              <span className="disp faq-q">
                <Drip className="qn" text={`Q${String(i + 1).padStart(2, "0")}`} />
                {f.q}
              </span>
              <span className="plus" aria-hidden="true">+</span>
            </summary>
            <Melt className="faq-a" text={f.a} />
          </details>
        ))}
      </div>
    </section>
  );
}

export async function Writing() {
  const posts = (await getPublishedPosts()).filter((p) => !p.sample).slice(0, 3);
  if (!posts.length) return null;
  return (
    <section className="sec block" data-sec="writing" id="writing" aria-labelledby="wr-h">
      <div className="row-head">
        <Head n="11" kicker="WRITING ✺ FROM THE BLOG" title="Notes from the *workbench*" id="wr-h" size="sm" />
        <Link href="/blogs" className="go">All writing →</Link>
      </div>
      <div className="grid-3">
        {posts.map((p) => (
          <Link className="post" href={`/blogs/${p.slug}`} key={p.slug}>
            <Drip className="mono post-d" text={formatDate(p.dateISO).toUpperCase()} />
            <Drip className="disp post-t" text={p.title} />
            {p.excerpt && <Melt as="span" className="post-b" text={p.excerpt} />}
          </Link>
        ))}
      </div>
    </section>
  );
}

export function ContactCard() {
  const reply = terms.replyTime ? `I reply within ${terms.replyTime} with a plan, a timeline and a price.` : "I reply with a plan, a timeline and a price.";
  const price = terms.startingPrice ? ` Projects start from ${terms.startingPrice}.` : "";
  return (
    <section id="contact" className="sec contact-card" data-sec="contact" aria-labelledby="cta-h">
      <span className="peel" aria-hidden="true"><span>AK✺</span></span>
      <Drip as="p" className="kicker" text="CONTACT ✺ ONE EMAIL AWAY" />
      <Wobble id="cta-h" className="disp cta-h" text={["Bring me", "the *problem.*"]} />
      <Melt className="cta-p" text={`Send a short brief. ${reply}${price}`} />
      <div className="row">
        <a href={`mailto:${profile.email}`} className="cta cta-dark cta-mail">{profile.email}</a>
        <Link href="/contact" className="cta cta-line">Contact form</Link>
        <a href={profile.linkedin} className="cta cta-line" rel="me noopener" target="_blank">LinkedIn</a>
        <a href={profile.github} className="cta cta-line" rel="me noopener" target="_blank">GitHub</a>
      </div>
    </section>
  );
}
