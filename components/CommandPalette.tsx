"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
const destinations = [
  ["Home", "/"],
  ["Work & projects", "/work"],
  ["About Aman", "/about"],
  ["Blog / field notes", "/blogs"],
  ["Contact", "/contact"],
  ["Resume", "/amankeshridotcom.pdf"],
];
export default function CommandPalette() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        if (dialog.current?.open) dialog.current.close();
        else {
          setQuery("");
          dialog.current?.showModal();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const filtered = destinations.filter(([name]) =>
    name.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <button
        className="command-trigger"
        onClick={() => {
          setQuery("");
          dialog.current?.showModal();
        }}
        aria-label="Find a page, Command or Control K"
      >
        <span>⌘ K</span>
      </button>
      <dialog ref={dialog} className="command-dialog">
        <div className="command-top">
          <label>
            <span className="sr-only">Find a page</span>
            <input
              placeholder="Find a page…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <button
            className="icon-button"
            onClick={() => dialog.current?.close()}
            aria-label="Close page finder"
          >
            ×
          </button>
        </div>
        <nav aria-label="Page finder">
          {filtered.map(([name, href]) => (
            <Link
              href={href}
              key={href}
              onClick={() => dialog.current?.close()}
            >
              {name}
              <span>↗</span>
            </Link>
          ))}
        </nav>
        {filtered.length === 0 && <p>No matching pages.</p>}
        <p className="micro">Tab to navigate · Escape to close</p>
      </dialog>
    </>
  );
}
