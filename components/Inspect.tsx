"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Inspect.module.css";

type Stats = { fps: number; frame: number; lcp?: number; cls: number; bytes: number; js: number; requests: number; nodes: number; gpu?: string };

/** "Inspect this page": real numbers about the page you're reading, measured in your browser. */
export function Inspect({ sha }: { sha: string }) {
  const [open, setOpen] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const lcp = useRef<number | undefined>(undefined);
  const cls = useRef(0);

  useEffect(() => {
    try {
      new PerformanceObserver((l) => { const e = l.getEntries().at(-1); if (e) lcp.current = e.startTime; }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((l) => { for (const e of l.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) if (!e.hadRecentInput) cls.current += e.value; }).observe({ type: "layout-shift", buffered: true });
    } catch {}
  }, []);

  useEffect(() => {
    if (!open) return;
    let raf = 0, frames = 0, worst = 0, last = performance.now(), start = last;
    const tick = (now: number) => {
      worst = Math.max(worst, now - last);
      last = now;
      frames++;
      if (now - start > 1000) {
        const res = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
        const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
        const bytes = res.reduce((s, r) => s + (r.transferSize || 0), nav?.transferSize ?? 0);
        const js = res.filter((r) => r.initiatorType === "script" || r.name.endsWith(".js")).reduce((s, r) => s + (r.transferSize || 0), 0);
        setStats({ fps: Math.round((frames * 1000) / (now - start)), frame: Math.round(worst), lcp: lcp.current, cls: cls.current, bytes, js, requests: res.length + 1, nodes: document.getElementsByTagName("*").length, gpu: gpuName() });
        frames = 0; worst = 0; start = now;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [open]);

  const kb = (b: number) => `${(b / 1024).toFixed(0)} KB`;
  return (
    <>
      <button type="button" className={styles.toggle} aria-expanded={open} aria-controls="inspect-panel" onClick={() => setOpen((v) => !v)}>
        {open ? "Close inspector" : "Inspect this page"}
      </button>
      {open && (
        <aside id="inspect-panel" className={styles.panel} aria-label="Page measurements">
          <p className="label label--caps">Measured in your browser</p>
          {!stats ? <p className="label">Measuring…</p> : (
            <dl>
              <div><dt>frame rate</dt><dd>{stats.fps} fps · worst {stats.frame} ms</dd></div>
              <div><dt>largest paint</dt><dd>{stats.lcp ? `${Math.round(stats.lcp)} ms` : "—"}</dd></div>
              <div><dt>layout shift</dt><dd>{stats.cls.toFixed(3)}</dd></div>
              <div><dt>transferred</dt><dd>{kb(stats.bytes)} · {stats.requests} requests</dd></div>
              <div><dt>javascript</dt><dd>{kb(stats.js)} (compressed)</dd></div>
              <div><dt>dom nodes</dt><dd>{stats.nodes.toLocaleString("en-IN")}</dd></div>
              {stats.gpu && <div><dt>renderer</dt><dd>{stats.gpu}</dd></div>}
              <div><dt>build</dt><dd>{sha} · bom1</dd></div>
            </dl>
          )}
        </aside>
      )}
    </>
  );
}

function gpuName() {
  const c = document.querySelector<HTMLCanvasElement>("canvas");
  if (!c) return undefined;
  const gl = c.getContext("webgl2") as WebGL2RenderingContext | null;
  if (!gl) return "no WebGL on this page";
  return `WebGL2 · ${gl.getParameter(gl.MAX_TEXTURE_SIZE)}px textures`;
}
