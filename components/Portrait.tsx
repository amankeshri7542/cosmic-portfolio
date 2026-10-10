"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./Portrait.module.css";

// The engineer, built like everything else on this site: a dot-matrix silhouette resolves into the photo
// behind a scan line, and the stack floats around him at different depths. Each logo links to the step
// of the story where it's used.
const STACK = [
  { logo: "react", name: "React", href: "/#interface", side: "l", at: 5, y: 16, z: 0.9 },
  { logo: "nextjs", name: "Next.js", href: "/#interface", side: "r", at: 7, y: 9, z: 0.6, invert: true },
  { logo: "rust", name: "Rust · Axum", href: "/#api", side: "r", at: 4, y: 32, z: 1, invert: true },
  { logo: "nodejs", name: "Node.js", href: "/#api", side: "l", at: 3, y: 42, z: 0.5 },
  { logo: "postgresql", name: "PostgreSQL", href: "/#data", side: "r", at: 5, y: 56, z: 0.8 },
  { logo: "redis", name: "Redis", href: "/#data", side: "l", at: 6, y: 66, z: 0.7 },
  { logo: "docker", name: "Docker", href: "/#ship", side: "r", at: 8, y: 79, z: 0.5 },
  { logo: "aws", name: "AWS", href: "/#ship", side: "l", at: 7, y: 87, z: 0.9, invert: true },
] as const;

export function Portrait({ size = "lg", priority = false }: { size?: "lg" | "md"; priority?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const [built, setBuilt] = useState(false);

  // Build in when it scrolls into view.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setBuilt(true); io.disconnect(); } }, { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Depth: the pointer tilts the card and moves each layer by its depth. Off for touch and reduced motion.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;
    let raf = 0;
    let tx = 0, ty = 0, cx = 0, cy = 0;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onLeave = () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(tick); };
    const tick = () => {
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      el.style.setProperty("--px", cx.toFixed(3));
      el.style.setProperty("--py", cy.toFixed(3));
      raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.002 ? requestAnimationFrame(tick) : 0;
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <figure ref={root} className={styles.portrait} data-size={size} data-built={built || undefined}>
      <div className={styles.card}>
        <div className={styles.backdrop} aria-hidden="true" />
        <ul role="list" className={styles.stack} aria-label="Tools I build with">
          {STACK.map((t) => (
            <li key={t.name} data-side={t.side} style={{ [t.side === "l" ? "left" : "right"]: `${t.at}%`, top: `${t.y}%`, ["--z" as string]: t.z }}>
              <Link href={t.href} className={styles.chip} title={`${t.name} — see where I use it`}>
                <Image src={`/stack/${t.logo}.svg`} alt="" width={22} height={22} unoptimized className={"invert" in t && t.invert ? styles.invert : undefined} />
                <span className={styles.chipName}>{t.name}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className={styles.person}>
          <div className={styles.dots} aria-hidden="true" />
          <Image
            src="/about/aman.webp"
            alt="Aman Kumar, smiling, in a black-and-white hoodie and a cream scarf with an orange woven border"
            width={800}
            height={1200}
            sizes={size === "lg" ? "(max-width: 860px) 80vw, 420px" : "(max-width: 860px) 70vw, 340px"}
            priority={priority}
            className={styles.photo}
          />
          <span className={styles.scan} aria-hidden="true" />
        </div>
      </div>
      <figcaption className="label">Aman Kumar · Bengaluru <span aria-hidden="true">·</span> tap a logo to see where I use it</figcaption>
    </figure>
  );
}
