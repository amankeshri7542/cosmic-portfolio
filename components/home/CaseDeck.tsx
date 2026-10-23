"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { Drip, Melt, Wobble } from "@/components/acid/Text";
import { plates } from "@/content/work";
import { caseHeads } from "@/content/services";

type Vars = CSSProperties & Record<`--${string}`, string | number>;

const slots = [
  { tx: 0, ty: 0, rot: -0.6, sc: 1, z: 3, dim: 0 },
  { tx: 26, ty: 22, rot: 2.4, sc: 0.97, z: 2, dim: 0.2 },
  { tx: -18, ty: 40, rot: -3, sc: 0.94, z: 1, dim: 0.35 },
];

/** Three case studies as a stacked deck of cards. Only the top card is readable; the rest peek out behind it. */
export function CaseDeck() {
  const [top, setTop] = useState(0);
  const n = plates.length;
  return (
    <>
      <div role="group" aria-label="Choose a case study" className="row deck-ctl">
        {plates.map((p, i) => (
          <button type="button" key={p.id} className="dk" aria-pressed={i === top} onClick={() => setTop(i)}>{caseHeads[p.id].short}</button>
        ))}
        <button type="button" className="big" onClick={() => setTop((t) => (t + 1) % n)}>Shuffle the deck <span aria-hidden="true">↻</span></button>
        <p className="sr" aria-live="polite">Showing case study {top + 1} of {n}: {plates[top].name}</p>
      </div>
      <div className="deck">
        {plates.map((p, i) => {
          const pos = (i - top + n) % n;
          const s = slots[pos];
          return (
            <article
              key={p.id}
              className="case"
              aria-hidden={pos !== 0}
              inert={pos !== 0}
              style={{ background: `var(--c${i + 1})`, zIndex: s.z, "--tx": s.tx, "--ty": s.ty, "--rot": s.rot, "--ksc": s.sc, "--dim": s.dim } as Vars}
            >
              <div className="col">
                <div className="tags">
                  <span className="stamp">{p.status.toUpperCase()}</span>
                  <span className="tag">{p.period.toUpperCase()}</span>
                  <span className="tag">{i + 1} / {n}</span>
                </div>
                <Wobble as="h3" className="disp case-t" text={caseHeads[p.id].thesis} />
                <Drip as="p" className="mono case-n" text={`${p.name} · ${p.role}`} />
                <div className="tags">{p.stack.map((s) => <span className="tag soft" key={s}>{s}</span>)}</div>
                <Link href={`/work#${p.id}`} className="cta cta-dark cta-sm">Read the case study →</Link>
              </div>
              <div className="col">
                <Melt className="case-l" text={p.lede} />
                {p.notes.map((note) => (
                  <div className="case-note" key={note.heading}>
                    <span className="disp case-nh">{note.heading}</span>
                    <Melt as="span" className="case-nb" text={note.body} />
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
