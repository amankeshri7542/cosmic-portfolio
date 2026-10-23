"use client";

import { useState, type ReactNode } from "react";

/** Tabs that filter server-rendered cards: items carry data-grp="AI Web", CSS hides the ones that don't match. */
export function FilterTabs({ labels, label, children, className }: { labels: string[]; label: string; children: ReactNode; className?: string }) {
  const [on, setOn] = useState(labels[0]);
  return (
    <>
      <div role="group" aria-label={label} className="row">
        {labels.map((l) => (
          <button type="button" key={l} className="tab" aria-pressed={l === on} onClick={() => setOn(l)}>{l}</button>
        ))}
      </div>
      <div className={className} data-filter={on}>{children}</div>
    </>
  );
}
