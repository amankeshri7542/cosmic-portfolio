"use client";

import { useEffect, useRef, useState } from "react";
import { chaosLines } from "@/content/services";

/** The easter egg: "don't press". Letters on screen fall off, a terminal restores them, the page rebuilds. */
export function ChaosSwitch() {
  const [lines, setLines] = useState(0);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function press() {
    if (lines) return;
    const root = document.documentElement;
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches || root.dataset.motion === "off";
    const at = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));
    timers.current = [];
    setLines(1);
    if (!calm) root.classList.add("chaos");
    at(500, () => setLines(2));
    at(1400, () => setLines(3));
    at(2100, () => {
      setLines(4);
      if (!calm) root.classList.replace("chaos", "rebuild");
    });
    at(2900, () => setLines(5));
    at(3400, () => root.classList.remove("chaos", "rebuild"));
    at(7500, () => setLines(0));
  }

  return (
    <div className="egg">
      <button type="button" className="nope" onClick={press} aria-disabled={lines > 0} title="Seriously, don’t.">
        ⚠ don’t press
      </button>
      {lines > 0 && (
        <div className="term" role="status" aria-live="polite">
          <div className="term-bar" aria-hidden="true"><i /><i /><i /><span>prod · amankeshri.com</span></div>
          {chaosLines.slice(0, lines).map((l) => (
            <p key={l.t} className={l.cls ? `tl ${l.cls}` : "tl"}>{l.t}</p>
          ))}
        </div>
      )}
    </div>
  );
}
