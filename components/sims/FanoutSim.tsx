"use client";

import { useId, useState } from "react";
import { Log } from "./Log";
import { useRunner } from "./useRunner";
import base from "./Sim.module.css";
import own from "./Fanout.module.css";
import { merge } from "./merge";

const s = merge(base, own);

const PEOPLE = ["A", "B", "C"] as const;
type Who = (typeof PEOPLE)[number];
type Result = "idle" | "flying" | "delivered" | "gone" | "duplicate";

/**
 * Plate III instrument: one message, independent deliveries. API Gateway's postToConnection
 * returns 410 GoneException for a closed socket; allSettled records it, all() turns it into a
 * failed broadcast that the sender retries.
 */
export function FanoutSim() {
  const [online, setOnline] = useState<Record<Who, boolean>>({ A: true, B: false, C: true });
  const [mode, setMode] = useState<"allSettled" | "all">("allSettled");
  const [phase, setPhase] = useState<"idle" | "in" | "out">("idle");
  const [results, setResults] = useState<Record<Who, Result>>({ A: "idle", B: "idle", C: "idle" });
  const [received, setReceived] = useState<Record<Who, number>>({ A: 0, B: 0, C: 0 });
  const { busy, log, say, run, clear } = useRunner(650);
  const id = useId();

  function send() {
    const snapOnline = { ...online };
    const live = PEOPLE.filter((p) => snapOnline[p]);
    const dead = PEOPLE.filter((p) => !snapOnline[p]);
    const steps: Array<() => void> = [
      () => { setResults({ A: "idle", B: "idle", C: "idle" }); setPhase("in"); say("sendMessage → API Gateway (WebSocket) → Lambda", "sql"); },
      () => { say("Query connections for room #design (DynamoDB, single table)", "sql"); },
      () => {
        setPhase("out");
        setResults({ A: "flying", B: "flying", C: "flying" });
        say(`await Promise.${mode}(recipients.map(postToConnection))`, "sql");
      },
      () => {
        setResults(Object.fromEntries(PEOPLE.map((p) => [p, snapOnline[p] ? "delivered" : "gone"])) as Record<Who, Result>);
        setReceived((r) => ({ ...r, ...Object.fromEntries(live.map((p) => [p, r[p] + 1])) }));
        live.forEach((p) => say(`${p} · 200 delivered`, "ok", p));
        dead.forEach((p) => say(`${p} · 410 GoneException — socket closed`, "fail", p));
      },
    ];
    if (mode === "allSettled") {
      steps.push(() => {
        if (dead.length) say(`${dead.join(", ")}: stale connection deleted. ${live.length} of 3 delivered; handler returns 200.`, "note");
        else say("All three delivered. Handler returns 200.", "note");
        setPhase("idle");
      });
    } else if (dead.length) {
      steps.push(() => say(`Promise.all rejected on ${dead[0]} — the handler throws although ${live.join(" and ") || "nobody"} already got it`, "fail"));
      steps.push(() => {
        say("Sender sees an error and retries the whole broadcast…", "wait");
        setPhase("out");
        setResults((r) => ({ ...r, ...Object.fromEntries(live.map((p) => [p, "flying"])) }));
      });
      steps.push(() => {
        setResults(Object.fromEntries(PEOPLE.map((p) => [p, snapOnline[p] ? "duplicate" : "gone"])) as Record<Who, Result>);
        setReceived((r) => ({ ...r, ...Object.fromEntries(live.map((p) => [p, r[p] + 1])) }));
        live.forEach((p) => say(`${p} · 200 delivered — again (duplicate)`, "fail", p));
        say("One quiet recipient turned into a failed send and duplicate messages.", "note");
        setPhase("idle");
      });
    } else {
      steps.push(() => { say("All three delivered. (Promise.all only hurts when someone is gone.)", "note"); setPhase("idle"); });
    }
    run(steps);
  }

  function reset() {
    clear();
    setPhase("idle");
    setResults({ A: "idle", B: "idle", C: "idle" });
    setReceived({ A: 0, B: 0, C: 0 });
    setOnline({ A: true, B: false, C: true });
    setMode("allSettled");
  }

  // Layout in a 600×240 drawing.
  const Y: Record<Who, number> = { A: 50, B: 120, C: 190 };
  return (
    <div className={s.instrument} aria-labelledby={`${id}-t`}>
      <div className={s.bar}>
        <p id={`${id}-t`} className="label label--caps">Instrument · independent deliveries</p>
        <button type="button" className={s.ghost} onClick={reset} disabled={busy}>Reset</button>
      </div>

      <div className={s.stage}>
        <svg viewBox="0 0 600 240" className={s.drawing} role="img" aria-label={`Message fan-out: A ${online.A ? "online" : "offline"}, B ${online.B ? "online" : "offline"}, C ${online.C ? "online" : "offline"}`}>
          <defs>
            <marker id={`${id}-arrow`} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0 0 L8 4 L0 8 z" fill="currentColor" />
            </marker>
          </defs>
          {/* sender → lambda */}
          <g className={s.node}>
            <rect x="14" y="98" width="96" height="44" rx="2" />
            <text x="62" y="118">you</text>
            <text x="62" y="133" className={s.small}>sendMessage</text>
          </g>
          <path d="M110 120 H222" className={s.wire} markerEnd={`url(#${id}-arrow)`} />
          {phase === "in" && <circle r="5" className={s.packet} style={{ offsetPath: "path('M110 120 H222')" }} />}
          <g className={s.node} data-hot={phase !== "idle" || undefined}>
            <rect x="224" y="88" width="122" height="64" rx="2" />
            <text x="285" y="112">Lambda</text>
            <text x="285" y="128" className={s.small}>fan-out</text>
            <text x="285" y="142" className={s.small}>{mode === "all" ? "Promise.all" : "Promise.allSettled"}</text>
          </g>
          {PEOPLE.map((p) => {
            const d = `M346 120 C 410 120, 410 ${Y[p]}, 470 ${Y[p]}`;
            const r = results[p];
            return (
              <g key={p} data-result={r} data-online={online[p] || undefined} className={s.leg}>
                <path d={d} className={s.wire} markerEnd={`url(#${id}-arrow)`} />
                {r === "flying" && <circle r="5" className={s.packet} style={{ offsetPath: `path('${d}')` }} />}
                <g className={s.node}>
                  <rect x="472" y={Y[p] - 22} width="112" height="44" rx="2" />
                  <text x="528" y={Y[p] - 3}>{p}</text>
                  <text x="528" y={Y[p] + 12} className={s.small}>
                    {r === "gone" ? "410 gone" : r === "delivered" ? "delivered" : r === "duplicate" ? "got it twice" : online[p] ? "connected" : "offline"}
                    {received[p] > 0 ? ` · ${received[p]}` : ""}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      <div className={s.controls}>
        <button type="button" className="button button--solid" onClick={send} disabled={busy}>Send to #design</button>
        <fieldset className={s.toggles}>
          <legend className="label">Connected</legend>
          {PEOPLE.map((p) => (
            <label key={p} className={s.check}>
              <input type="checkbox" checked={online[p]} onChange={(e) => setOnline((o) => ({ ...o, [p]: e.target.checked }))} disabled={busy} />
              <span className="label">{p}</span>
            </label>
          ))}
        </fieldset>
        <label className={s.field}>
          <span className="label">Fan-out with</span>
          <select value={mode} onChange={(e) => setMode(e.target.value as typeof mode)} disabled={busy}>
            <option value="allSettled">Promise.allSettled</option>
            <option value="all">Promise.all</option>
          </select>
        </label>
      </div>

      <Log lines={log} empty="B is offline. Send a message, then switch to Promise.all and send again." />
    </div>
  );
}
