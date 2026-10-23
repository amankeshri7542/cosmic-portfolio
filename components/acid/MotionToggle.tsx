"use client";

import { useRootData } from "./useRootData";

/** Footer switch that stills every animation on the site, remembered on this device. */
export function MotionToggle() {
  const off = useRootData("motion") === "off";

  function toggle() {
    const next = !off;
    if (next) document.documentElement.dataset.motion = "off";
    else delete document.documentElement.dataset.motion;
    try {
      localStorage.setItem("motion", next ? "off" : "on");
    } catch {}
  }

  return (
    <button type="button" className="motion-t" aria-pressed={off} onClick={toggle}>
      {off ? "Play motion" : "Pause motion"}
    </button>
  );
}
