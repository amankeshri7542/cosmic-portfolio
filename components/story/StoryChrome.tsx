"use client";

import { useSyncExternalStore } from "react";
import { story } from "./store";
import styles from "./Story.module.css";

/** Hovering or focusing a chapter's tools lights up the part of the stage they built. */
export function HighlightOnHover({ target, children }: { target: string; children: React.ReactNode }) {
  if (!target) return <>{children}</>;
  const on = () => story.setHighlight(target);
  const off = () => story.setHighlight(null);
  return (
    <div onPointerEnter={on} onPointerLeave={off} onFocus={on} onBlur={off}>
      {children}
    </div>
  );
}

/** Progress rail that doubles as navigation: each segment jumps to its chapter. */
export function Rail({ steps }: { steps: { id: string; label: string }[] }) {
  return (
    <ol className={styles.rail} aria-label="Build steps">
      {steps.map((s, i) => (
        <li key={s.id}>
          <button
            type="button"
            data-rail={i + 1}
            aria-label={`Step ${i + 1}: ${s.label}`}
            title={`${i + 1} · ${s.label}`}
            onClick={() => {
              const el = document.getElementById(s.id);
              if (!el) return;
              const lenis = (window as unknown as { __lenis?: { scrollTo: (t: Element, o?: object) => void } }).__lenis;
              if (lenis) lenis.scrollTo(el, { offset: -80 });
              else el.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          />
        </li>
      ))}
    </ol>
  );
}

// "Motion" preference for the story, on top of the OS reduced-motion setting.
const KEY = "story-motion";
const listeners = new Set<() => void>();
const read = () => { try { return localStorage.getItem(KEY) !== "off"; } catch { return true; } };
export function subscribeMotion(l: () => void) {
  listeners.add(l);
  const onEvent = () => l();
  window.addEventListener("story-motion", onEvent);
  return () => { listeners.delete(l); window.removeEventListener("story-motion", onEvent); };
}
export const motionAllowed = read;

export function MotionToggle() {
  const on = useSyncExternalStore(subscribeMotion, read, () => true);
  return (
    <button
      type="button"
      className={styles.motionToggle}
      aria-pressed={on}
      onClick={() => {
        try { localStorage.setItem(KEY, on ? "off" : "on"); } catch {}
        window.dispatchEvent(new Event("story-motion"));
      }}
    >
      Motion {on ? "on" : "off"}
    </button>
  );
}
