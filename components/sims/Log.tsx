"use client";

import { useEffect, useRef } from "react";
import type { LogLine } from "./useRunner";
import s from "./Sim.module.css";

/** A terminal-style event log. Announced politely to screen readers, line by line. */
export function Log({ lines, empty }: { lines: LogLine[]; empty: string }) {
  const box = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const el = box.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);
  return (
    <ol ref={box} className={s.log} aria-live="polite" aria-relevant="additions" data-lenis-prevent>
      {lines.length === 0 && <li className={s.muted}>{empty}</li>}
      {lines.map((l) => (
        <li key={l.id} data-tone={l.tone}>
          {l.who && <span className={s.who}>{l.who}</span>}
          <span>{l.text}</span>
        </li>
      ))}
    </ol>
  );
}
