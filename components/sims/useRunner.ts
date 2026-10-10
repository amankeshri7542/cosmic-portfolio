"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type LogLine = { id: number; who?: string; text: string; tone?: "ok" | "fail" | "wait" | "sql" | "note" };

/** Runs a scripted sequence of steps with a delay between them (none under reduced motion). */
export function useRunner(stepMs = 520) {
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<LogLine[]>([]);
  const timers = useRef<number[]>([]);
  const seq = useRef(0);
  const reduced = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduced.current = mq.matches;
    const on = () => (reduced.current = mq.matches);
    mq.addEventListener("change", on);
    return () => {
      mq.removeEventListener("change", on);
      timers.current.forEach(clearTimeout);
    };
  }, []);

  const say = useCallback((text: string, tone?: LogLine["tone"], who?: string) => {
    setLog((l) => [...l.slice(-13), { id: ++seq.current, text, tone, who }]);
  }, []);

  const run = useCallback(
    (steps: Array<() => void>) => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      setBusy(true);
      const gap = reduced.current ? 0 : stepMs;
      steps.forEach((fn, i) => {
        timers.current.push(window.setTimeout(fn, gap * i));
      });
      timers.current.push(window.setTimeout(() => setBusy(false), gap * steps.length));
    },
    [stepMs],
  );

  const clear = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setBusy(false);
    setLog([]);
  }, []);

  return { busy, log, say, run, clear };
}
