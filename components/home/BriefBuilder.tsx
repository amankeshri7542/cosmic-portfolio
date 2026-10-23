"use client";

import Link from "next/link";
import { useState } from "react";
import { Drip } from "@/components/acid/Text";
import { needs } from "@/content/briefs";
import { profile } from "@/content/profile";
import { terms } from "@/content/services";

const times = ["As soon as possible", "In 1–2 months", "Flexible"];

/** Pick what you need: the receipt shows how I'd build it, where I've done it, and sends the brief. */
export function BriefBuilder() {
  const [picked, setPicked] = useState<string[]>(["website", "ai"]);
  const [tm, setTm] = useState(1);
  const chosen = needs.filter((n) => picked.includes(n.id));
  const title = chosen.length ? chosen.map((n) => n.label).join(" + ") : "Pick what you need";
  const stackOut = [...new Set(chosen.flatMap((n) => n.stack))];
  const proof = [...new Map(chosen.map((n) => [n.proof.name, n.proof])).values()];
  const body = `Hi Aman,\n\nI need: ${chosen.map((n) => n.label).join(", ") || "..."}.\nTimeline: ${times[tm]}.\n\nAbout my business:\n`;
  const mailto = `mailto:${profile.email}?subject=${encodeURIComponent(`Project brief: ${title}`)}&body=${encodeURIComponent(body)}`;
  const form = `/contact?brief=${picked.join(",")}`;

  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  return (
    <div className="grid-brief">
      <div className="col">
        <div role="group" aria-label="What do you need?" className="grid-needs">
          {needs.map((n) => (
            <button type="button" key={n.id} className="need" aria-pressed={picked.includes(n.id)} onClick={() => toggle(n.id)}>{n.label}</button>
          ))}
        </div>
        <div className="col tight">
          <Drip className="mono muted-k" text="WHEN DO YOU NEED IT?" />
          <div role="group" aria-label="Timeline" className="row">
            {times.map((t, i) => (
              <button type="button" key={t} className="tab" aria-pressed={i === tm} onClick={() => setTm(i)}>{t}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="rcpt">
        <div className="receipt" aria-live="polite">
          <Drip className="mono rc-k" text="YOUR BRIEF" />
          <span className="disp rc-t">{title}</span>
          <div className="col tight">
            <Drip className="mono rc-k" text="HOW I’D BUILD IT" />
            <div className="pills">{stackOut.map((s) => <span className="pill" key={s}>{s}</span>)}</div>
          </div>
          <div className="col tight">
            <Drip className="mono rc-k" text="WHERE I’VE DONE IT" />
            <div className="pills">{proof.map((p) => <Link className="tag" href={p.href} key={p.name}>{p.name}</Link>)}</div>
          </div>
          <div className="rline"><span>TIMELINE</span><span>{times[tm].toUpperCase()}</span></div>
          <div className="rline"><span>PRICE</span><span>{terms.startingPrice ? `FROM ${terms.startingPrice}` : "ON REPLY"}</span></div>
          <div className="row">
            <Link href={form} className="cta cta-dark">Send this brief <span aria-hidden="true">→</span></Link>
            <a href={mailto} className="cta cta-line cta-sm">or by email</a>
          </div>
        </div>
      </div>
    </div>
  );
}
