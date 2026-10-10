"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { Print } from "@/content/work";
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
          <span className="label">Find a project</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Try “AWS”, “RAG” or “payments”" aria-controls="frames" />
        </label>
        <p className="label" aria-live="polite">{shown.length} of {prints.length} frames</p>
      </div>

      <ol id="frames" className={styles.frames} aria-labelledby={headingId}>
        {shown.map((p) => {
          const n = prints.indexOf(p) + 1;
          return (
            <li key={p.id} id={p.id} className={styles.frame}>
              <p className={styles.edge} aria-hidden="true">
                <span>▸ {String(n).padStart(2, "0")}</span>
                <span>{String(n).padStart(2, "0")}A</span>
              </p>
              <div className={styles.thumb}>
                <Image src={p.image.src} alt={p.image.alt} width={p.image.width} height={p.image.height} sizes="(max-width: 620px) 100vw, (max-width: 1100px) 50vw, 25vw" />
              </div>
              <h3 className={styles.title}>{p.title}</h3>
              <p className="label">{p.kind} · {p.date}</p>
              <details
                className={styles.details}
                open={open === p.id}
                onToggle={(e) => {
                  const el = e.currentTarget;
                  if (el.open) setOpen(p.id);
                  else if (open === p.id) setOpen(null);
                }}
              >
                <summary>Details</summary>
                <div className={styles.body}>
                  <p>{p.description}</p>
                  <p className={styles.muted}>{p.detail}</p>
                  <p className="label">{p.tech.join(" · ")}</p>
                  {p.diagram && (
                    <a href={p.diagram.src} className={styles.diagram} target="_blank" rel="noopener">
                      <Image src={p.diagram.src} alt={p.diagram.alt} width={p.diagram.width} height={p.diagram.height} sizes="(max-width: 620px) 100vw, 40vw" />
                      <span className="label">Open the architecture diagram ↗</span>
                    </a>
                  )}
                  <p className={styles.links}>
                    {p.href ? <a href={p.href} target="_blank" rel="noopener">Visit {p.title} ↗</a> : <span className={styles.muted}>No public demo.</span>}
                    <a href={`/work#${p.id}`} className={styles.perma}>Link to this frame</a>
                  </p>
                </div>
              </details>
            </li>
          );
        })}
      </ol>
      {shown.length === 0 && <p className={styles.empty}>No frame matches “{q}”. Try a technology like PostgreSQL, Lambda or OpenAI.</p>}
    </div>
  );
}
