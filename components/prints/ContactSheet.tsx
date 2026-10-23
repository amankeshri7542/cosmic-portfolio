"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import type { Print } from "@/content/work";
import { Drip, Melt } from "@/components/acid/Text";
import styles from "./ContactSheet.module.css";

/** Every project, as frames on a photographer's contact sheet. Each frame is linkable: /work#id. */
export function ContactSheet({ prints, headingId = "sheet-title" }: { prints: Print[]; headingId?: string }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => {
      const id = decodeURIComponent(location.hash.slice(1));
      if (prints.some((p) => p.id === id)) {
        setOpen(id);
        requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: "start" }));
      }
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [prints]);

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return prints;
    return prints.filter((p) => [p.title, p.kind, p.description, p.detail, ...p.tech].join(" ").toLowerCase().includes(t));
  }, [q, prints]);

  return (
    <div className={styles.sheet}>
      <div className={styles.tools}>
        <label className={styles.search}>
          <span className="mono">FIND A PROJECT</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Try “AWS”, “RAG” or “payments”" aria-controls="frames" />
        </label>
        <p className={styles.count} aria-live="polite">{shown.length} of {prints.length} projects</p>
      </div>

      <ol id="frames" className={styles.frames} aria-labelledby={headingId} data-all={shown.length === prints.length || undefined}>
        {shown.map((p) => {
          const n = prints.indexOf(p) + 1;
          const ink = `var(--c${((n - 1) % 4) + 1})`;
          return (
            <li key={p.id} id={p.id} className={styles.frame} style={{ "--pc": ink, "--pr": `${[-3, 2, -1.5, 3][n % 4]}deg` } as CSSProperties}>
              <div className={styles.thumb}>
                <Image src={p.image.src} alt={p.image.alt} width={p.image.width} height={p.image.height} sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 400px" />
                <span className={styles.no} aria-hidden="true">Nº {String(n).padStart(2, "0")}</span>
              </div>
              <div className={styles.body}>
                <Drip as="p" className={`mono ${styles.kind}`} text={`${p.kind.toUpperCase()} · ${p.date.toUpperCase()}`} />
                <Drip as="h3" className={`disp ${styles.title}`} text={p.title} />
                <Melt className={styles.desc} text={p.description} />
                <details
                  className={styles.details}
                  open={open === p.id}
                  onToggle={(e) => {
                    const el = e.currentTarget;
                    if (el.open) setOpen(p.id);
                    else if (open === p.id) setOpen(null);
                  }}
                >
                  <summary>How it’s built</summary>
                  <div className={styles.more}>
                    <p>{p.detail}</p>
                    <div className="pills">{p.tech.map((t) => <span className="pill" key={t}>{t}</span>)}</div>
                    {p.diagram && (
                      <a href={p.diagram.src} className={styles.diagram} target="_blank" rel="noopener">
                        <Image src={p.diagram.src} alt={p.diagram.alt} width={p.diagram.width} height={p.diagram.height} sizes="(max-width: 700px) 100vw, 400px" />
                        <span className="mono">Open the architecture diagram ↗</span>
                      </a>
                    )}
                    <a href={`/work#${p.id}`} className={styles.perma}>Link to this project</a>
                  </div>
                </details>
                {p.href ? (
                  <a className={styles.go} href={p.href} target="_blank" rel="noopener">Open {p.title} <span aria-hidden="true">↗</span></a>
                ) : (
                  <span className={styles.nodemo}>Architecture project, no public demo</span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      {shown.length === 0 && <p className={styles.empty}>Nothing matches “{q}”. Try a tool like PostgreSQL, Lambda or OpenAI.</p>}
    </div>
  );
}
