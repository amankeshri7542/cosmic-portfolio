"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Loads the motion layer after the page is idle. Content never depends on it. */
export function Enhance() {
  const path = usePathname();
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    const run = () => import("@/motion/enhance").then((m) => { if (!cancelled) cleanup = m.enhance(path); });
    const w = window as Window & typeof globalThis;
    const hasIdle = typeof w.requestIdleCallback === "function";
    const idle = hasIdle ? w.requestIdleCallback(run, { timeout: 1200 }) : w.setTimeout(run, 300);
    return () => {
      cancelled = true;
      if (hasIdle) w.cancelIdleCallback(idle); else w.clearTimeout(idle);
      cleanup?.();
    };
  }, [path]);
  return null;
}
