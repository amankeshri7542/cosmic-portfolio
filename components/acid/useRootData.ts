"use client";

import { useSyncExternalStore } from "react";

// Reads a data-* attribute on <html> (set before paint by the inline script in app/layout.tsx)
// and re-renders when it changes. On the server it is always undefined.
function subscribe(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-pal", "data-motion"] });
  return () => mo.disconnect();
}

export function useRootData(key: "pal" | "motion") {
  return useSyncExternalStore(
    subscribe,
    () => document.documentElement.dataset[key],
    () => undefined,
  );
}
