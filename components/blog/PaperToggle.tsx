"use client";

import { useSyncExternalStore } from "react";
import styles from "./Article.module.css";

// Reading preference lives in localStorage and on <html data-paper>; this hook keeps them in step.
const KEY = "paper";
const listeners = new Set<() => void>();
function read() {
  try { return localStorage.getItem(KEY) === "on"; } catch { return false; }
}
function write(on: boolean) {
  try { localStorage.setItem(KEY, on ? "on" : "off"); } catch {}
  document.documentElement.toggleAttribute("data-paper", on);
  if (on) document.documentElement.setAttribute("data-paper", "on");
  listeners.forEach((l) => l());
}
function subscribe(l: () => void) {
  listeners.add(l);
  if (read()) document.documentElement.setAttribute("data-paper", "on");
  return () => {
    listeners.delete(l);
    if (!listeners.size) document.documentElement.removeAttribute("data-paper");
  };
}

/** Switch long reading to the inverse print: blue ink on white paper. Remembered per browser. */
export function PaperToggle() {
  const on = useSyncExternalStore(subscribe, read, () => false);
  return (
    <button type="button" className={styles.paper} aria-pressed={on} onClick={() => write(!on)}>
      <span aria-hidden="true" className={styles.swatch} /> Read on paper
    </button>
  );
}
