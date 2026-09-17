"use client";

import { useEffect, useRef, useState } from "react";

const captions: Record<string, [string, string]> = {
  "one-sale-three-records": ["Atomicity / a single boundary", "Three changes. One decision."],
  "when-a-recipient-goes-offline": ["Delivery / independent paths", "A quiet branch needn’t stop the others."],
  "patterns-between-patterns": ["Perception / interference", "The pattern lives between the lines."],
};

export default function BlogIllustration({ slug }: { slug: string }) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  const [label, caption] = captions[slug];
  return <figure ref={ref} className={`blog-illustration art-${slug}`} data-running={visible && !paused}>
    <p className="micro">{label}</p>
    <svg viewBox="0 0 600 350" fill="none" role="img" aria-label={caption}>
      {slug === "one-sale-three-records" && <>
        <path d="M46 88V45h508v43M46 260v45h508v-45" stroke="currentColor" strokeDasharray="3 6" />
        {[84, 239, 394].map((x, i) => <g key={x} className="record-leaf" style={{ animationDelay: `${i * 120}ms` }}>
          <path d={`M${x} 94h122v148l-10 6-10-6-10 6-10-6-10 6-10-6-10 6-10-6-10 6-10-6-12 6Z`} fill="#e5e9de" stroke="#78928e" />
          <text x={x + 14} y="125" className="art-label">{["INVOICE", "STOCK", "LEDGER"][i]}</text>
          <path d={`M${x + 14} 145h94m-94 17h72m-72 17h84`} stroke="#93a8a4" />
          <path className="record-check" d={`m${x + 45} 208 10 10 24-29`} stroke="#456d5c" strokeWidth="3" />
        </g>)}
        <text x="300" y="333" textAnchor="middle" className="art-label">COMMIT TOGETHER</text>
      </>}
      {slug === "when-a-recipient-goes-offline" && <>
        <path d="M126 176h105V75h185M231 176h185M231 176v100h185" stroke="#819eb5" strokeWidth="1.4" />
        <g stroke="#c0ccd4"><path d="m60 130 66 18v65l-66-18Zm0 0-28 19v65l28-19m-28-46 66 18 28-19m-28 19v65" fill="#283c56" /></g>
        {[75, 176, 276].map((y, i) => <g key={y}>
          <rect x="418" y={y - 28} width="134" height="56" fill={i === 1 ? "#3e3744" : "#223c4b"} stroke={i === 1 ? "#cd8e78" : "#809da8"} strokeDasharray={i === 1 ? "4 4" : undefined} />
          <text x="485" y={y + 5} textAnchor="middle" className="art-label">{["A · RECEIVED", "B · WAITING", "C · RECEIVED"][i]}</text>
          {i !== 1 && <circle className={`delivery-particle particle-${i}`} cx="231" cy={y} r="4" fill="#e8bd79" />}
        </g>)}
        <text x="77" y="258" textAnchor="middle" className="art-label">OUTBOX</text>
      </>}
      {slug === "patterns-between-patterns" && <>
        <g stroke="#c78b73" strokeWidth="1.2">{Array.from({ length: 58 }, (_, i) => <path key={i} d={`M${i * 13 - 90} -40C${i * 13 + 100} 70 ${i * 13 - 180} 260 ${i * 13 + 30} 400`} />)}</g>
        <g className="pattern-overlay" stroke="#84aeb2" strokeWidth="1.2">{Array.from({ length: 58 }, (_, i) => <path key={i} d={`M${i * 13 - 80} -40C${i * 13 - 210} 110 ${i * 13 + 160} 220 ${i * 13} 400`} />)}</g>
      </>}
    </svg>
    <figcaption><span className="handwritten">{caption}</span><button className="illustration-motion" type="button" aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? "Play illustration" : "Pause illustration"}</button></figcaption>
  </figure>;
}
