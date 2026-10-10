"use client";

import { useState } from "react";
import { api, ApiError } from "./api";
import s from "./write.module.css";

export function Login({ onDone, reason }: { onDone: () => void; reason?: string }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) { setError("Enter the editor password."); return; }
    setBusy(true);
    setError("");
    try {
      await api.login(password);
      setPassword("");
      onDone();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) setError("That password isn't right.");
      else if (err instanceof ApiError && err.status === 429) setError("Too many wrong attempts from this network. Wait 15 minutes, then try again.");
      else if (err instanceof ApiError && err.status === 503) setError("Publishing isn't configured on this server (database or password hash missing).");
      else setError(err instanceof Error ? err.message : "Sign-in failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={s.login}>
      <form onSubmit={submit} className={s.loginCard}>
        <p className="label label--caps">Writer’s desk · private</p>
        <h1>Sign in to write.</h1>
        {reason && <p className={s.notice}>{reason}</p>}
        <label htmlFor="pw" className="label">Editor password</label>
        <input id="pw" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={error ? true : undefined} aria-describedby={error ? "pw-err" : undefined} autoFocus />
        {error && <p id="pw-err" className={s.err} role="alert">{error}</p>}
        <button className="button button--solid" type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
      </form>
    </div>
  );
}
