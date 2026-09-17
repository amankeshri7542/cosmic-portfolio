"use client";
import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
const ObjectCanvas = dynamic(() => import("./ObjectCanvas"), { ssr: false });
let webglAvailable: boolean | undefined;
function supportsWebGL() {
  if (webglAvailable !== undefined) return webglAvailable;
  try {
    const context = document.createElement("canvas").getContext("webgl2");
    webglAvailable = !!context;
    context?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch { webglAvailable = false; }
  return webglAvailable;
}
class RenderBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}
const labels = {
  satellite: { title: "Communications satellite", control: "Satellite view angle", left: "Rotate the satellite", note: "Solar cells supply power. The antenna carries the signal." },
  circuit: { title: "Layered circuit board", control: "Separate the layers", left: "Pull the layers apart", note: "A physical analogy for the software layers below." },
  prism: { title: "Triangular optical prism", control: "Prism view angle", left: "Change your perspective", note: "One beam. Different wavelengths. A spectrum revealed." },
};
export default function ObjectStudy({ kind, compact = false }: { kind: keyof typeof labels; compact?: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [motion, setMotion] = useState(false);
  const [still, setStill] = useState(false);
  const [failed, setFailed] = useState(false);
  const [framesReady, setFramesReady] = useState(false);
  const [value, setValue] = useState(kind === "circuit" ? 25 : 50);
  const label = labels[kind];
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      if (!media.matches && !supportsWebGL()) setFailed(true);
      setMotion(!media.matches);
    };
    update(); media.addEventListener("change", update);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: "100px" });
    if (ref.current) observer.observe(ref.current);
    return () => { observer.disconnect(); media.removeEventListener("change", update); };
  }, []);
  const live = visible && motion && !still && !failed;
  return <figure ref={ref} className={`object-study object-${kind}${compact ? " object-compact" : ""}`} data-object-mode={live ? "3d" : "still"}>
    <div className="object-stage" aria-label={label.title} role="img">
      {kind === "prism" && <div className="prism-spectrum" style={{ transform: `rotate(${(value - 50) / 10}deg)` }} aria-hidden="true" />}
      <Image style={{ opacity: !live && visible && framesReady ? 0 : undefined }} className="object-fallback" src={`/observatory/${kind}.png`} alt="" width={900} height={760} sizes={compact ? "260px" : "(max-width: 700px) 90vw, 500px"} />
      {!live && visible && <svg className="object-fallback" viewBox={`0 0 600 507`} aria-hidden="true" style={{ visibility: framesReady ? "visible" : "hidden" }}><image href={`/observatory/${kind}-views.webp`} x={-Math.round(value / 10) * 600} width="6600" height="507" onLoad={() => setFramesReady(true)} /></svg>}
      {live && <div className="object-webgl"><RenderBoundary onFailure={() => setFailed(true)}><ObjectCanvas kind={kind} value={value} onFailure={() => setFailed(true)} /></RenderBoundary></div>}
    </div>
    <figcaption>
      <div className="object-caption"><span className="handwritten">{label.left} <span aria-hidden="true">↗</span></span>{motion && !failed && <button type="button" className="motion-toggle" onClick={() => setStill(!still)} aria-pressed={still}>{still ? "Enable 3D" : "Still view"}</button>}</div>
      <label className="object-control"><span className="sr-only">{label.control}</span><input type="range" min="0" max="100" value={value} onChange={e => setValue(Number(e.target.value))} aria-valuetext={kind === "circuit" ? `${value}% layer separation` : `${Math.round((value - 50) * 180 / (60 * Math.PI))} degrees`} /></label>
      {!compact && <p className="object-note">{label.note}</p>}
      {failed && <p className="object-note">Rendered views · drag to explore the same object.</p>}
    </figcaption>
  </figure>;
}
