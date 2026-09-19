"use client";
import { useState, type CSSProperties } from "react";
import Image from "next/image";

const layers = [
  { name: "Interface", code: "UI", tools: "React / Next.js / TypeScript", icons: ["react", "nextjs", "typescript"], color: "#82d9ef", title: "The part people actually use.", text: "Customer websites, business dashboards and mobile workflows. Interfaces shaped around what people need to get done.", proof: "See the Procure-to-Pay platform", href: "#procurement" },
  { name: "Backend & data", code: "API", tools: "Rust / PostgreSQL / Node.js", icons: ["rust", "postgresql"], color: "#d9b0ff", title: "The rules that hold it together.", text: "Typed services, permissions and transactional data. In my ERP, invoices, stock and ledgers commit together—or not at all.", proof: "Explore the Hardware Store ERP", href: "#hardware-erp" },
  { name: "Applied AI", code: "AI", tools: "Python / OpenAI / RAG", icons: ["python"], color: "#f0bdce", title: "AI with a job to do.", text: "Language, voice and vision inside useful products: multilingual product enquiries, a contextual Alexa assistant and medication information.", proof: "See the AI projects", href: "#ai-work" },
  { name: "Cloud & delivery", code: "OPS", tools: "AWS / Docker / CI/CD", icons: ["amazonwebservices", "docker"], color: "#ecc28d", title: "Built is only the beginning.", text: "Deployment, background jobs and resilient delivery. AWS infrastructure and repeatable releases keep the product moving beyond the first demo.", proof: "Explore Vartalaap’s architecture", href: "#vartalaap" },
];

export default function TechStack() {
  const [active, setActive] = useState(0);
  const layer = layers[active];
  return <section className="tech-explorer" aria-label="Explore my engineering stack">
    <div className="stack-caption"><span className="micro">One product. Every layer.</span></div>
    <div className="stack-scene">
      <div className="stack-assembly">
        {layers.map((item, index) => <button key={item.code} className="stack-plane" style={{ "--layer": index, "--layer-color": item.color } as CSSProperties} aria-pressed={active === index} aria-controls="stack-detail" onClick={() => setActive(index)}>
          <span className="plane-top"><span>{item.code}</span><span className="plane-dots" aria-hidden="true">···</span></span>
          <span className="plane-logos">{item.icons.map(icon => <Image key={icon} src={`/stack/${icon}.svg`} alt="" width={38} height={38} className={`tech-icon icon-${icon}`} />)}</span>
          <span className="plane-name">{item.name}<span aria-hidden="true">↗</span></span>
        </button>)}
      </div>
    </div>
    <div className="stack-selection" aria-label="Stack layers">{layers.map((item, index) => <button key={item.code} onClick={() => setActive(index)} aria-pressed={active === index}>{item.code}</button>)}</div>
    <div className="stack-detail" id="stack-detail" aria-live="polite"><p className="micro">{layer.tools}</p><h2>{layer.title}</h2><p>{layer.text}</p><a href={layer.href}>{layer.proof} <span aria-hidden="true">↗</span></a></div>
  </section>;
}
