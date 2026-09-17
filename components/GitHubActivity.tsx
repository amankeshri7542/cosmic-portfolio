"use client";
import { useEffect, useState } from "react";
type GitEvent = {
  id: string;
  label: string;
  detail: string;
  created_at: string;
};
export default function GitHubActivity() {
  const [events, setEvents] = useState<GitEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    fetch("/api/github-activity", { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || data.error) throw new Error("Unavailable");
        setEvents(data.events ?? []);
      })
      .catch((reason) => {
        if (reason.name !== "AbortError") setError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [revision]);
  return (
    <section className="activity-section">
      <div className="activity-heading">
        <div>
          <p className="eyebrow">Out in the open</p>
          <h2>Recent public work.</h2>
        </div>
        <button
          className="text-link"
          disabled={loading}
          onClick={() => setRevision(revision + 1)}
        >
          Refresh ↻
        </button>
      </div>
      <div aria-live="polite">
        {loading ? (
          <p className="muted">Loading public activity…</p>
        ) : error ? (
          <p className="muted">
            Activity is unavailable right now.{" "}
            <a className="text-link" href="https://github.com/amankeshri7542">
              Visit GitHub ↗
            </a>
          </p>
        ) : events.length === 0 ? (
          <p className="muted">No recent public activity.</p>
        ) : (
          <ul className="activity-list">
            {events.slice(0, 5).map((event) => (
              <li key={event.id}>
                <div>
                  <span>{event.label}</span>
                  {event.detail && <p>{event.detail}</p>}
                </div>
                <time dateTime={event.created_at}>
                  {new Date(event.created_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                  })}
                </time>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
