"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./ContactForm.module.css";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "error"; message: string };
const DRAFT_KEY = "contact-draft";

/**
 * The contact print: your message is the negative. It's kept as a draft in this tab until it
 * sends, so a failed send never loses what you wrote.
 */
export function ContactForm({ email }: { email: string }) {
  const [values, setValues] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof values, string>>>({});
  const token = useRef<string>("");
  const router = useRouter();

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(DRAFT_KEY);
      // Restoring an unsent draft from this tab is a one-time sync from external storage.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setValues(JSON.parse(saved));
    } catch {}
    fetch("/api/contact", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d?.t) token.current = d.t; })
      .catch(() => {});
  }, []);

  useEffect(() => {
    try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(values)); } catch {}
  }, [values]);

  function validate() {
    const e: typeof errors = {};
    if (!values.name.trim()) e.name = "Add your name so I know who’s writing.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) e.email = "Enter an email address I can reply to, like name@example.com.";
    if (values.message.trim().length < 10) e.message = "Write at least a sentence — ten characters or more.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (!validate()) {
      const first = ev.currentTarget.querySelector<HTMLElement>("[aria-invalid='true']");
      first?.focus();
      return;
    }
    setStatus({ kind: "sending" });
    const form = new FormData(ev.currentTarget);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, company: form.get("company") ?? "", t: token.current }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "The message didn’t send.");
      try { sessionStorage.removeItem(DRAFT_KEY); } catch {}
      router.push("/thank-you");
    } catch (err) {
      setStatus({ kind: "error", message: err instanceof Error ? err.message : "The message didn’t send." });
    }
  }

  const field = (k: keyof typeof values) => ({
    id: `c-${k}`,
    name: k,
    value: values[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setValues((v) => ({ ...v, [k]: e.target.value })),
    "aria-invalid": errors[k] ? (true as const) : undefined,
    "aria-describedby": errors[k] ? `c-${k}-err` : undefined,
  });

  return (
    <form className={styles.form} onSubmit={submit} noValidate data-sending={status.kind === "sending" || undefined}>
      <div className={styles.row}>
        <label htmlFor="c-name" className="label">Your name</label>
        <input {...field("name")} autoComplete="name" maxLength={80} />
        {errors.name && <p id="c-name-err" className={styles.err}>{errors.name}</p>}
      </div>
      <div className={styles.row}>
        <label htmlFor="c-email" className="label">Your email</label>
        <input {...field("email")} type="email" autoComplete="email" inputMode="email" maxLength={254} />
        {errors.email && <p id="c-email-err" className={styles.err}>{errors.email}</p>}
      </div>
      <div className={`${styles.row} ${styles.wide}`}>
        <label htmlFor="c-message" className="label">Message</label>
        <textarea {...field("message")} rows={8} maxLength={4000} />
        <p className={`label ${styles.count}`}>{values.message.length} / 4000</p>
        {errors.message && <p id="c-message-err" className={styles.err}>{errors.message}</p>}
      </div>
      <div className={styles.trap} aria-hidden="true">
        <label htmlFor="c-company">Company</label>
        <input id="c-company" name="company" tabIndex={-1} autoComplete="off" />
      </div>
      <div className={styles.foot}>
        <button className="button button--solid" type="submit" disabled={status.kind === "sending"}>
          {status.kind === "sending" ? "Sending…" : "Send message"}
        </button>
        <p className="label" role="status" aria-live="polite">
          {status.kind === "error" ? "" : "Your draft stays in this tab until it sends."}
        </p>
      </div>
      {status.kind === "error" && (
        <p className={styles.fail} role="alert">
          {status.message} Your text is still here — try again, or email me directly at <a href={`mailto:${email}`}>{email}</a>.
        </p>
      )}
    </form>
  );
}
