import Image from "next/image";
import type { CSSProperties } from "react";
import { Drip, Melt, Wobble } from "@/components/acid/Text";
import { Icon } from "@/components/acid/Ambient";
import { PaletteHalo } from "@/components/acid/PaletteHalo";
import type { IconName } from "@/components/acid/icons";

type Vars = CSSProperties & Record<`--${string}`, string>;

const orbit: { icon?: IconName; word?: string }[] = [
  { icon: "react" }, { icon: "nextdotjs" }, { icon: "typescript" }, { icon: "nodedotjs" },
  { icon: "rust" }, { icon: "postgresql" }, { icon: "docker" }, { word: "AWS" },
];

// Burst points for the "open for projects" badge (a 24-point star, precomputed).
const burst =
  "60.0,2.0 66.5,10.4 75.0,4.0 79.1,13.8 89.0,9.8 90.4,20.3 101.0,19.0 99.7,29.6 110.2,31.0 106.2,40.9 116.0,45.0 109.6,53.5 118.0,60.0 109.6,66.5 116.0,75.0 106.2,79.1 110.2,89.0 99.7,90.4 101.0,101.0 90.4,99.7 89.0,110.2 79.1,106.2 75.0,116.0 66.5,109.6 60.0,118.0 53.5,109.6 45.0,116.0 40.9,106.2 31.0,110.2 29.6,99.7 19.0,101.0 20.3,90.4 9.8,89.0 13.8,79.1 4.0,75.0 10.4,66.5 2.0,60.0 10.4,53.5 4.0,45.0 13.8,40.9 9.8,31.0 20.3,29.6 19.0,19.0 29.6,20.3 31.0,9.8 40.9,13.8 45.0,4.0 53.5,10.4";

const stats = [
  { n: "14", label: "PROJECTS BUILT" },
  { n: "2×", label: "AWS CERTIFIED" },
  { n: "3", label: "ENGINEERING ROLES SINCE 2025" },
  { n: "3", label: "LANGUAGES MY AI SPEAKS: HINDI, ENGLISH, HINGLISH" },
];

export function Hero() {
  return (
    <section className="hero sec in vis" data-sec="top" aria-labelledby="hero-name">
      <div className="blob a" aria-hidden="true" />
      <div className="blob b" aria-hidden="true" />
      <div className="blob c" aria-hidden="true" />
      <div className="wrap">
        <div className="hero-row">
          <div className="hero-copy">
            <Drip as="p" className="kicker" style={{ color: "var(--c2)" }} text="FREELANCE FULL-STACK DEVELOPER · BENGALURU, INDIA" />
            <Wobble
              as="h1"
              id="hero-name"
              className="name"
              text={["Aman", "Keshri"]}
              lineClasses={["", "outline"]}
              label="Aman Keshri (Aman Kumar), freelance full-stack developer"
            />
            <p className="disp hero-line">
              I build{" "}
              <span className="roller" aria-hidden="true">
                <span>web apps</span><span>APIs</span><span>cloud setups</span><span>AI assistants</span><span>web apps</span>
              </span>
              <span className="sr">web apps, APIs, cloud setups and AI assistants</span>
              <br />
              end to end, from the shop counter to{" "}
              <span className="circ">
                the cloud.
                <svg viewBox="0 0 200 70" preserveAspectRatio="none" aria-hidden="true">
                  <path pathLength={1} d="M150 8 C 90 -2, 12 8, 8 34 C 4 60, 120 68, 178 52 C 206 42, 196 14, 140 10 C 110 8, 70 12, 52 16" />
                </svg>
              </span>
            </p>
            <Melt
              className="hero-lede"
              text="The interface, the API, the data model and the cloud it runs on, with applied AI where it earns its place. Colourful on the outside, boringly reliable on the inside."
            />
            <div className="row">
              <a href="#brief" className="cta cta-main">Start a project <span aria-hidden="true">→</span></a>
              <a href="#work" className="cta cta-ghost">See my work</a>
            </div>
          </div>
          <PaletteHalo>
            <span className="rings" aria-hidden="true" />
            <span className="orbit" aria-hidden="true">
              {orbit.map((o, i) => (
                <i key={i} style={{ "--a": `${i * 45}deg`, "--oc": `var(--c${(i % 4) + 1})` } as Vars}>
                  {o.icon ? <Icon name={o.icon} /> : o.word}
                </i>
              ))}
            </span>
            <span className="portrait">
              <Image src="/about/aman-halo.webp" alt="Portrait of Aman Kumar Keshri" width={480} height={480} priority sizes="(max-width: 600px) 56vw, 320px" />
            </span>
            <span className="badge" aria-hidden="true">
              <svg viewBox="0 0 120 120" width="128" height="128">
                <defs>
                  <path id="bdg" d="M60 60 m-38 0 a38 38 0 1 1 76 0 a38 38 0 1 1 -76 0" />
                </defs>
                <polygon className="burst" points={burst} />
                <text className="bt">
                  <textPath href="#bdg" textLength="236" lengthAdjust="spacing">OPEN FOR PROJECTS ✺ OPEN FOR PROJECTS ✺</textPath>
                </text>
                <text x="60" y="71" className="bc">✺</text>
              </svg>
            </span>
          </PaletteHalo>
        </div>
        <div className="stats">
          {stats.map((s, i) => (
            <div className="stat" key={s.label}>
              <Drip className="disp stat-n" style={{ color: `var(--c${i + 1})` }} text={s.n} />
              <Drip className="mono stat-l" text={s.label} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Two tilted marquee bands, then a row of paint drips. */
export function Marquees() {
  const a = ["WEB APPS", "BACKENDS & APIs", "AWS CLOUD", "AI ASSISTANTS", "DASHBOARDS", "REAL-TIME"];
  const b = ["REACT", "NEXT.JS", "RUST", "NODE.JS", "POSTGRESQL", "AWS", "DOCKER", "RAG"];
  return (
    <div className="sec" data-sec="bands" aria-hidden="true">
      <div className="marquee">
        <div className="track">
          {[...a, ...a].map((t, i) => <span key={i}>{t} <i>✺</i></span>)}
        </div>
      </div>
      <div className="marquee alt">
        <div className="track">
          {[...b, ...b].map((t, i) => <span key={i}>{t} <i>✦</i></span>)}
        </div>
      </div>
      <Drips />
    </div>
  );
}

export function Drips({ lime = false }: { lime?: boolean }) {
  // Fixed layout (no randomness at render time): 16 drips across the band.
  const w = [22, 16, 27, 18, 25, 15, 29, 20, 17, 26, 19, 23, 14, 28, 21, 24];
  const h = [64, 41, 88, 52, 76, 35, 95, 47, 58, 82, 39, 70, 44, 90, 55, 66];
  return (
    <div className={lime ? "drips lime" : "drips"} aria-hidden="true">
      {w.map((wd, i) => {
        const d = `${(-((i * 37) % 55) / 10).toFixed(1)}s`;
        return (
          <span key={i} className="drip" style={{ left: `${3 + i * 6.1 + ((i * 7) % 3)}%`, width: wd, height: h[i], animationDelay: d }}>
            <span className="drop" style={{ animationDelay: d }} />
          </span>
        );
      })}
    </div>
  );
}
