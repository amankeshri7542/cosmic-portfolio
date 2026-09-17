"use client";
import { useEffect, useId, useRef, useState } from "react";

const lines = Array.from({ length: 92 }, (_, i) => {
  const x = i * 12 - 150;
  return `M${x},-70 C${x + 170},35 ${x - 140},110 ${x},170 S${x + 130},275 ${x + 10},390`;
});

export default function InterferenceStudy() {
  const id = useId();
  const ref = useRef<HTMLElement>(null);
  const [angle, setAngle] = useState(7);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return <figure className="interference-study" ref={ref} data-drifting={visible && !paused}>
    <div className="interference-heading"><div><p className="eyebrow">A study in perception</p><h3>Two patterns.<br /><em>A third appears.</em></h3></div><p>A slight shift between repeating lines creates a new pattern. That’s moiré: something unexpected, hiding in the overlap.</p></div>
    <svg className="interference-art" viewBox="0 0 800 300" role="img" aria-label="Two overlapping fields of curved blue and coral lines forming a shifting moiré pattern">
      <defs><linearGradient id={`${id}-fade`}><stop offset="0" stopColor="black" /><stop offset=".12" stopColor="white" /><stop offset=".88" stopColor="white" /><stop offset="1" stopColor="black" /></linearGradient><mask id={`${id}-mask`}><rect width="800" height="300" fill={`url(#${id}-fade)`} /></mask></defs>
      <g mask={`url(#${id}-mask)`} fill="none" strokeWidth="3.5">
        <g stroke="#75a7b7" opacity=".8">{lines.map((d,i) => <path d={d} key={i} />)}</g>
        <g transform={`rotate(${angle} 400 150)`}><g className="interference-moving">{lines.map((d,i) => <path d={d} key={i} stroke={i % 3 === 0 ? "#ecc17f" : "#d78b78"} />)}</g></g>
      </g>
    </svg>
    <figcaption><label htmlFor={`${id}-angle`}><span>Shift the alignment</span><output>{angle}°</output></label><input id={`${id}-angle`} aria-label="Pattern alignment" type="range" min="-12" max="12" step=".5" value={angle} onChange={e => { setAngle(Number(e.target.value)); setPaused(true); }} /><button type="button" className="interference-motion text-link" aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? "Let it drift" : "Pause drift"}</button><span className="handwritten">Look a little longer.</span></figcaption>
  </figure>;
}
