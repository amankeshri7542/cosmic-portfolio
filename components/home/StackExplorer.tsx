"use client";

import { useState } from "react";
import { Drip, Melt } from "@/components/acid/Text";
import { stack } from "@/content/profile";
import { layerBlurbs, toolLogos, usedIn } from "@/content/services";

const layers = Object.entries(stack) as [string, readonly string[]][];
const total = layers.reduce((n, [, items]) => n + items.length, 0);

/** Six layers of tools. A tab lights one layer; a tool shows where I've used it. */
export function StackExplorer() {
  const [layer, setLayer] = useState("All");
  const [tool, setTool] = useState("PostgreSQL");
  const toolLayer = layers.find(([, items]) => items.includes(tool))?.[0] ?? "";

  return (
    <>
      <div role="group" aria-label="Filter by layer" className="row">
        {["All", ...layers.map(([name]) => name)].map((l) => (
          <button type="button" key={l} className="tab" aria-pressed={l === layer} onClick={() => setLayer(l)}>{l}</button>
        ))}
      </div>
      <div className="grid-cats">
        {layers.map(([name, items]) => (
          <div key={name} className={layer === "All" ? "cat" : layer === name ? "cat lit" : "cat dim"}>
            <div className="cat-h">
              <Drip as="h3" className="disp cat-t" text={name} />
              <Drip className="mono cat-n" text={`${items.length} TOOLS`} />
            </div>
            <Melt className="cat-b" text={layerBlurbs[name] ?? ""} />
            <div className="chips">
              {items.map((n) => (
                <button type="button" key={n} className={toolLogos[n] ? "chip" : "chip txt"} aria-pressed={n === tool} onClick={() => setTool(n)}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- tiny static SVG logos */}
                  {toolLogos[n] && <img src={toolLogos[n]} alt="" width={22} height={22} loading="lazy" decoding="async" />}
                  {n}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="used" aria-live="polite">
        <div className="col tight">
          <span className="mono used-k">WHERE I USED IT</span>
          <Drip key={tool} className="disp used-t" text={tool} />
          <span className="mono used-l">{toolLayer.toUpperCase()} · {total} TOOLS IN {layers.length} LAYERS</span>
        </div>
        <div className="pills">
          {(usedIn[tool] ?? []).map((u) => <span className="pill" key={u}>{u}</span>)}
        </div>
      </div>
    </>
  );
}
