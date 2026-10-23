import { Fragment, type CSSProperties, type ElementType, type ReactElement } from "react";

// Split text for the lab effects, rendered on the server with no client JavaScript.
// - <Wobble>: headings; every letter wobbles, about one in five also melts. `*word*` marks the accent word.
// - <Drip>: small caps and labels; words drop in and about a third melt with a colour split. Short tokens
//   such as numbers ("14", "3rd") still split by letter.
// - <Melt>: paragraphs stay still and readable; only a few meaningful words (tool names, numbers, `*marked*`
//   words) melt. Splitting every letter and word cost thousands of nodes per page and made prose hard to read.
// Split letters are aria-hidden next to a visually hidden copy, so screen readers and search engines read whole words.
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

/** Small text and numbers: words drop in and some melt. A short single token splits by letter. */
export function Drip({ text, as: Tag = "span", className, style, id }: DripProps) {
  const rnd = seeded(text);
  if (text.length <= 6 && !text.includes(" ")) {
    return (
      <Tag className={className} style={style} id={id}>
        <span className="sr">{text}</span>
        <span aria-hidden="true" className="word">
          {Array.from(text).map((c, k) => {
            const m = rnd() < 0.3;
            const v: Vars = { "--dd": s(0.08 + k * 0.03), "--dl": s(rnd() * 7), "--du": s(4.5 + rnd() * 3.5) };
            return <span key={k} className={m ? "dr mlt" : "dr"} style={v}>{c}</span>;
          })}
        </span>
      </Tag>
    );
  }
  const words = text.split(" ");
  // one wrapper, so the spaces between words survive inside flex containers such as pills and kickers
  return (
    <Tag className={className} style={style} id={id}>
      <span>
        {words.map((w, i) => {
          const m = rnd() < 0.3;
          const v: Vars = { "--dd": s(0.08 + i * 0.06), "--dl": s(rnd() * 7), "--du": s(4.5 + rnd() * 3.5) };
          return (
            <Fragment key={i}>
              <span className={m ? "dr mlt" : "dr"} style={v}>{w}</span>
              {i < words.length - 1 ? " " : null}
            </Fragment>
          );
        })}
      </span>
    </Tag>
  );
}

type MeltProps = { text: string; as?: ElementType; className?: string; style?: CSSProperties; id?: string };

// A word worth melting: a tool or proper name mid-sentence (PostgreSQL, AWS, Vartalaap) or anything with a digit.
const keyword = (w: string, prev: string | undefined) => {
  const bare = w.replace(/^[(“"']+|[)”"'.,;:!?…]+$/g, "");
  if (bare.length < 2 || /^I[’']/.test(bare)) return false;
  if (/\d/.test(bare)) return true;
  return /^[A-Z]/.test(bare) && prev !== undefined && !/[.!?:]$/.test(prev);
};

/** Paragraphs: the copy stays still; a few keywords (or `*marked*` words) melt with a colour split. */
export function Melt({ text, as: Tag = "p", className, style, id }: MeltProps) {
  const rnd = seeded(text);
  const words = text.split(" ");
  const marked = text.includes("*");
  const picks = new Set<number>();
  if (marked) words.forEach((w, i) => w.includes("*") && picks.add(i));
  else {
    const pool = words.map((w, i) => (keyword(w, words[i - 1]) ? i : -1)).filter((i) => i >= 0);
    const want = Math.min(pool.length, Math.floor(words.length / 9));
    while (picks.size < want) picks.add(pool[Math.floor(rnd() * pool.length)]);
  }
  const out: (string | ReactElement)[] = [];
  let run: string[] = [];
  words.forEach((raw, i) => {
    const w = marked ? raw.replace(/\*/g, "") : raw;
    if (!picks.has(i)) { run.push(w); return; }
    if (run.length) out.push(run.join(" ") + " ");
    run = [];
    out.push(<span key={i} className="mw mm" style={{ "--dl": s(rnd() * 8), "--du": s(5.5 + rnd() * 3) } as Vars}>{w}</span>);
    if (i < words.length - 1) out.push(" ");
  });
  if (run.length) out.push(run.join(" "));
  return <Tag className={className ? `mlp ${className}` : "mlp"} style={style} id={id}>{out}</Tag>;
}
