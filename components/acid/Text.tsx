import { Fragment, type CSSProperties, type ElementType } from "react";

// Split text for the lab effects, rendered on the server with no client JavaScript.
// - <Wobble>: headings; every letter wobbles, about one in five also melts. `*word*` marks the accent word.
// - <Drip>: small caps, labels and numbers; letters drop in, ooze, and some melt with a colour split.
// - <Melt>: paragraphs; each word oozes a little and about one in three melts harder.
// Letters are aria-hidden next to a visually hidden copy, so screen readers and search engines read whole words.
// Randomness is seeded from the text itself, so server and client always agree.

function seeded(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const s = (n: number) => `${n.toFixed(2)}s`;
type Vars = CSSProperties & Record<`--${string}`, string>;

type WobbleProps = {
  text: string | string[];
  as?: ElementType;
  className?: string;
  id?: string;
  melt?: number;
  /** Override what screen readers and search engines read (defaults to the text). */
  label?: string;
  lineClasses?: string[];
};

/** A heading whose letters wobble and drop in. Pass an array for explicit lines. */
export function Wobble({ text, as: Tag = "h2", className, id, melt = 0.2, label, lineClasses }: WobbleProps) {
  const lines = Array.isArray(text) ? text : [text];
  const plain = lines.join(" ").replace(/\*/g, "");
  const rnd = seeded(plain);
  let li = 0;
  return (
    <Tag id={id} className={className}>
      <span className="sr">{label ?? plain}</span>
      {lines.map((line, n) => (
        <span className={lineClasses?.[n] ? `line ${lineClasses[n]}` : "line"} aria-hidden="true" key={n}>
          {line.split(" ").map((w, i, all) => {
            const accent = w.includes("*");
            const word = w.replace(/\*/g, "");
            return (
              <Fragment key={i}>
                <span className={accent ? "word em" : "word"}>
                  {Array.from(word).map((c, k) => {
                    const style: Vars = { "--dd": s(0.12 + li++ * 0.035), "--wd": s(-rnd() * 3.4) };
                    const m = rnd() < melt;
                    if (m) { style["--dl"] = s(rnd() * 7); style["--du"] = s(5 + rnd() * 3); }
                    return <span key={k} className={m ? "wob mlt" : "wob"} style={style}>{c}</span>;
                  })}
                </span>
                {i < all.length - 1 ? " " : null}
              </Fragment>
            );
          })}
        </span>
      ))}
    </Tag>
  );
}

type DripProps = { text: string; as?: ElementType; className?: string; style?: CSSProperties; id?: string };

/** Small text and numbers: letters drop in, ooze and sometimes melt. */
export function Drip({ text, as: Tag = "span", className, style, id }: DripProps) {
  const rnd = seeded(text);
  let li = 0;
  return (
    <Tag className={className} style={style} id={id}>
      <span className="sr">{text}</span>
      <span aria-hidden="true">
        {text.split(" ").map((w, i, all) => (
          <Fragment key={i}>
            <span className="word">
              {Array.from(w).map((c, k) => {
                const m = rnd() < 0.3;
                const style: Vars = { "--dd": s(0.08 + li++ * 0.022), "--dl": s(rnd() * 7), "--du": s(4.5 + rnd() * 3.5) };
                return <span key={k} className={m ? "dr mlt" : "dr"} style={style}>{c}</span>;
              })}
            </span>
            {i < all.length - 1 ? " " : null}
          </Fragment>
        ))}
      </span>
    </Tag>
  );
}

type MeltProps = { text: string; as?: ElementType; className?: string; style?: CSSProperties; id?: string };

/** Paragraphs: every word oozes, about a third melt harder with a colour split. Words stay whole for readers. */
export function Melt({ text, as: Tag = "p", className, style, id }: MeltProps) {
  const rnd = seeded(text);
  const words = text.split(" ");
  return (
    <Tag className={className} style={style} id={id}>
      {words.map((w, i) => {
        const hard = rnd() < 0.3;
        const dl = rnd() * 8;
        const du = 5.5 + rnd() * 3;
        return (
          <Fragment key={i}>
            {hard ? <span className="mw mm" style={{ "--dl": s(dl), "--du": s(du) } as Vars}>{w}</span> : <span className="mw">{w}</span>}
            {i < words.length - 1 ? " " : null}
          </Fragment>
        );
      })}
    </Tag>
  );
}
