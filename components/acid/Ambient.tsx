import type { CSSProperties } from "react";
import { icons, type IconName } from "./icons";

// The background: soft colour orbs, faint rings, sparkles and lava-lamp tech blobs.
// Blobs and sparkles live only in the side gutters on wide screens, so nothing decorative sits behind text.

type Vars = CSSProperties & Record<`--${string}`, string>;
type Blob = { icon?: IconName; word?: string; label: string };

const blobs: Blob[] = [
  { icon: "react", label: "React" },
  { icon: "nextdotjs", label: "Next.js" },
  { icon: "typescript", label: "TypeScript" },
  { icon: "nodedotjs", label: "Node.js" },
  { word: "AWS", label: "Cloud" },
  { icon: "postgresql", label: "Postgres" },
  { icon: "rust", label: "Rust" },
  { icon: "docker", label: "Docker" },
  { icon: "redis", label: "Redis" },
  { icon: "mongodb", label: "MongoDB" },
  { icon: "githubactions", label: "CI/CD" },
  { icon: "socketdotio", label: "Sockets" },
  { word: "AI", label: "RAG" },
  { icon: "nginx", label: "Nginx" },
  { icon: "express", label: "Express" },
  { icon: "linux", label: "Linux" },
  { icon: "googlegemini", label: "Gemini" },
  { icon: "expo", label: "Expo" },
  { icon: "jsonwebtokens", label: "JWT" },
  { icon: "git", label: "Git" },
];

const ink = ["var(--c1)", "var(--c2)", "var(--c3)", "var(--c4)"];
const glyphs = ["✺", "✦", "✿", "✸"];

function seeded(n: number) {
  let a = n;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d={icons[name]} />
    </svg>
  );
}

/** `size` scales the layer to the page: "full" for the home page, "lite" for inner pages.
 *  Everything is placed in pixels from the top, never in % of the page: a percentage would move every orb
 *  whenever the page grows while it loads (fonts, streamed sections), and that counts as layout shift. */
export function Ambient({ size = "lite" }: { size?: "full" | "lite" }) {
  const rnd = seeded(size === "full" ? 7 : 3);
  const orbCount = size === "full" ? 12 : 10;
  const blobCount = size === "full" ? 20 : 12;
  const sparkCount = size === "full" ? 22 : 14;
  const depth = size === "full" ? 13200 : 11000; // px of page the decoration covers; below it, plain dark
  const px = (n: number) => `${Math.round(n)}px`;
  return (
    <div className="amb" aria-hidden="true">
      {Array.from({ length: orbCount }, (_, i) => (
        <span
          key={`o${i}`}
          className="orb"
          style={{ top: px(80 + (i * depth) / orbCount), left: i % 2 ? "82%" : "14%", width: 820 + (i % 3) * 140, height: 820 + (i % 3) * 140, animationDelay: `${-i * 3.1}s`, "--oc": ink[[1, 2, 0, 3][i % 4]] } as Vars}
        />
      ))}
      {size === "full" &&
        [0, 1, 2, 3].map((i) => (
          <span key={`r${i}`} className="bgring" style={{ top: px(2600 + i * 2700), left: i % 2 ? "0%" : "100%", width: 640 + ((i * 60) % 180), height: 640 + ((i * 60) % 180) }} />
        ))}
      {blobs.slice(0, blobCount).map((b, i) => (
        <span
          key={b.label}
          className={i % 2 ? "tb r" : "tb l"}
          style={{ top: px(300 + (i * (depth - 600)) / blobCount), "--bc": ink[i % 4], "--ld": `${11 + Math.round(rnd() * 5)}s`, "--fdl": `${(-rnd() * 9).toFixed(1)}s` } as Vars}
        >
          {b.icon ? <Icon name={b.icon} /> : <b>{b.word}</b>}
          <em>{b.label}</em>
        </span>
      ))}
      {Array.from({ length: sparkCount }, (_, i) => {
        const left = rnd() < 0.5 ? 0.6 + rnd() * 2.2 : 93.5 + rnd() * 2.5;
        return (
          <span
            key={`k${i}`}
            className="spk"
            style={{ top: px(200 + rnd() * (depth - 400)), left: `${left.toFixed(1)}%`, color: ink[Math.floor(rnd() * 4)], fontSize: Math.round(18 + rnd() * 34), animationDelay: `${(-rnd() * 9).toFixed(1)}s` }}
          >
            {glyphs[Math.floor(rnd() * 4)]}
          </span>
        );
      })}
    </div>
  );
}
