"use client";

import type { ReactNode } from "react";
import { useRootData } from "./useRootData";

/** The portrait is a button: each tap rotates the four inks of the whole site. Remembered on this device. */
export function PaletteHalo({ children }: { children: ReactNode }) {
  const pal = Number(useRootData("pal")) || 0;

  function shift() {
    const next = (pal + 1) % 4;
    if (next) document.documentElement.dataset.pal = String(next);
    else delete document.documentElement.dataset.pal;
    try {
      localStorage.setItem("pal", String(next));
    } catch {}
  }

  return (
    <div className="halo-wrap">
      <button type="button" className="halo" onClick={shift}>
        {children}
        <span className="sr">: Shift the colours of the page ({pal + 1} of 4)</span>
      </button>
      <p className="hint scrawl">
        <svg className="arrow" viewBox="0 0 70 44" width="70" height="44" aria-hidden="true">
          <path pathLength={1} d="M64 38 C 52 40, 30 36, 22 22 C 16 12, 14 8, 12 4" />
          <path pathLength={1} d="M4 12 L12 3 L19 13" />
        </svg>
        Tap my face to shift the colours ({pal + 1}/4)
      </p>
    </div>
  );
}
