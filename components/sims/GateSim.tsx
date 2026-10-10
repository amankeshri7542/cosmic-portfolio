"use client";

import { useId, useState } from "react";
import { Log } from "./Log";
import { useRunner } from "./useRunner";
import base from "./Sim.module.css";
import own from "./Gate.module.css";
import { merge } from "./merge";

const s = merge(base, own);

const STATES = ["Draft", "Submitted", "Approved", "Awarded", "Released"] as const;
type State = (typeof STATES)[number];
const ROLES = ["Requester", "Approver", "Buyer", "Finance"] as const;
type Role = (typeof ROLES)[number];
const TENANTS = ["Tenant A", "Tenant B"] as const;

const ACTIONS: { key: string; label: string; role: Role; from: State; to: State; verb: string }[] = [
  { key: "submit", label: "Submit request", role: "Requester", from: "Draft", to: "Submitted", verb: "submit" },
  { key: "approve", label: "Approve", role: "Approver", from: "Submitted", to: "Approved", verb: "approve" },
  { key: "award", label: "Award supplier", role: "Buyer", from: "Approved", to: "Awarded", verb: "award" },
  { key: "release", label: "Release PO", role: "Finance", from: "Awarded", to: "Released", verb: "release" },
];

type Check = null | "pass" | "fail";

/**
 * Plate II instrument: every transition is guarded by tenant, role and state — on the server.
 * An illustration of the pattern only; not CodeApto's actual roles, rules or data.
 */
export function GateSim() {
  const [state, setState] = useState<State>("Draft");
  const [role, setRole] = useState<Role>("Requester");
  const [tenant, setTenant] = useState<(typeof TENANTS)[number]>("Tenant A");
  const [gate, setGate] = useState<{ index: number; role: Check; state: Check } | null>(null);
  const [pos, setPos] = useState(0);
  const { busy, log, say, run, clear } = useRunner(420);
  const id = useId();

  function attempt(a: (typeof ACTIONS)[number]) {
    const index = ACTIONS.indexOf(a);
    const steps: Array<() => void> = [
      () => { setGate({ index, role: null, state: null }); say(`POST /requests/PR-2041/${a.verb} · as ${role.toLowerCase()} · ${tenant}`, "sql"); },
    ];
    if (tenant !== "Tenant A") {
      steps.push(() => say("404 Not Found — PR-2041 doesn't exist in this tenant (and we don't say otherwise)", "fail"));
      steps.push(() => setGate(null));
      return run(steps);
    }
    const roleOk = role === a.role;
    steps.push(() => {
      setGate({ index, role: roleOk ? "pass" : "fail", state: null });
      say(roleOk ? `role check · ${role.toLowerCase()} may ${a.verb}` : `403 Forbidden — only ${a.role.toLowerCase()} may ${a.verb}`, roleOk ? "ok" : "fail");
    });
    if (!roleOk) return run([...steps, () => setGate(null)]);

    if (a.key === "release" && state === "Released") {
      steps.push(() => {
        setGate({ index, role: "pass", state: "fail" });
        say("409 Conflict — already released. Same idempotency key: no second purchase order.", "fail");
      });
      return run([...steps, () => setGate(null)]);
    }
    const stateOk = state === a.from;
    steps.push(() => {
      setGate({ index, role: "pass", state: stateOk ? "pass" : "fail" });
      say(stateOk ? `state check · ${state} → ${a.to}` : `409 Conflict — request is ${state}; ${a.verb} needs ${a.from}`, stateOk ? "ok" : "fail");
    });
    if (!stateOk) return run([...steps, () => setGate(null)]);
    steps.push(() => {
      setState(a.to);
      setPos(STATES.indexOf(a.to));
      say(`UPDATE requests SET status='${a.to.toLowerCase()}' WHERE id=… AND status='${a.from.toLowerCase()}'`, "sql");
    });
    steps.push(() => {
      setGate(null);
      say(a.to === "Released" ? "PO-7731 released. Money can move now — once." : `${a.to}. Next gate waits for its own role.`, "note");
    });
    run(steps);
  }

  function reset() {
    clear();
    setState("Draft");
    setPos(0);
    setGate(null);
    setRole("Requester");
    setTenant("Tenant A");
  }

  return (
    <div className={s.instrument} aria-labelledby={`${id}-t`}>
      <div className={s.bar}>
        <p id={`${id}-t`} className="label label--caps">Instrument · guarded transitions</p>
        <button type="button" className={s.ghost} onClick={reset} disabled={busy}>Reset</button>
      </div>

      <div className={s.stage}>
        <ol className={s.track} aria-label={`Purchase request PR-2041 is ${state}`}>
          {STATES.map((st, i) => (
            <li key={st} className={s.station} data-here={i === pos || undefined} data-done={i < pos || undefined}>
              <span className={s.dot} aria-hidden="true" />
              <span className={s.stName}>{st}</span>
              {i < ACTIONS.length && (
                <span
                  className={s.gate}
                  data-active={gate?.index === i || undefined}
                  data-open={i < pos || undefined}
                  aria-hidden="true"
                >
                  <span data-check={gate?.index === i ? gate.role ?? "" : ""}>role</span>
                  <span data-check={gate?.index === i ? gate.state ?? "" : ""}>state</span>
                </span>
              )}
            </li>
          ))}
        </ol>
        <p className={`label ${s.caption}`}>
          PR-2041 · 40 bags OPC-53 · {tenant === "Tenant A" ? "owned by Tenant A" : "you are signed in to Tenant B"}
        </p>
      </div>

      <div className={s.controls}>
        <fieldset className={s.seg}>
          <legend className="label">Signed in as</legend>
          {ROLES.map((r) => (
            <label key={r}>
              <input type="radio" name={`${id}-role`} value={r} checked={role === r} onChange={() => setRole(r)} disabled={busy} />
              <span>{r}</span>
            </label>
          ))}
        </fieldset>
        <fieldset className={s.seg}>
          <legend className="label">Tenant</legend>
          {TENANTS.map((t) => (
            <label key={t}>
              <input type="radio" name={`${id}-tenant`} value={t} checked={tenant === t} onChange={() => setTenant(t)} disabled={busy} />
              <span>{t}</span>
            </label>
          ))}
        </fieldset>
        <div className={s.actions}>
          {ACTIONS.map((a) => (
            <button key={a.key} type="button" className="button" onClick={() => attempt(a)} disabled={busy}>
              {a.label}
            </button>
          ))}
        </div>
      </div>

      <Log lines={log} empty="Pick a role, then try to move the request. Try releasing the PO as the requester." />
      <p className={`label ${s.disclaimer}`}>An illustration of the pattern. Roles and rules are simplified; no CodeApto data.</p>
    </div>
  );
}
