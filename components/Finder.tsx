"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Finder.module.css";

export type Destination = { href: string; label: string; hint: string };

/** ⌘K page finder and the mobile menu share one native <dialog>. */
export function Finder({ destinations, primary }: { destinations: Destination[]; primary: Destination[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const router = useRouter();
  const listId = useId();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return destinations;
    return destinations.filter((d) => `${d.label} ${d.hint}`.toLowerCase().includes(q));
  }, [query, destinations]);

  function open() {
    opener.current = document.activeElement as HTMLElement;
    setQuery("");
    setActive(0);
    dialog.current?.showModal();
    requestAnimationFrame(() => input.current?.focus());
  }
  function close() {
    dialog.current?.close();
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const typing = (e.target as HTMLElement)?.closest?.("input, textarea, [contenteditable]");
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        if (dialog.current?.open) close();
        else open();
      }
    }
    window.addEventListener("keydown", onKey);
    const d = dialog.current;
    const restore = () => opener.current?.focus?.();
    d?.addEventListener("close", restore);
    return () => {
      window.removeEventListener("keydown", onKey);
      d?.removeEventListener("close", restore);
    };
  }, []);

  function go(href: string) {
    close();
    router.push(href);
  }

  function onListKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    if (e.key === "Enter" && results[active]) { e.preventDefault(); go(results[active].href); }
  }

  return (
    <>
      <button type="button" className={styles.trigger} onClick={open} aria-haspopup="dialog">
        <span className={styles.menuWord}>Menu</span>
        <span className={styles.findWord}>Find</span>
        <kbd className={styles.kbd} aria-hidden="true">⌘K</kbd>
      </button>

      <dialog ref={dialog} className={styles.dialog} aria-label="Find a page" onClick={(e) => e.target === dialog.current && close()}>
        <div className={styles.panel}>
          <nav aria-label="Primary" className={styles.primary}>
            {primary.map((d) => (
              <a key={d.href} href={d.href} onClick={(e) => { e.preventDefault(); go(d.href); }}>{d.label}</a>
            ))}
          </nav>
          <div className={styles.search}>
            <label htmlFor={`${listId}-q`} className="label">Find a page, project or note</label>
            <input
              ref={input}
              id={`${listId}-q`}
              type="search"
              autoComplete="off"
              spellCheck={false}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setActive(0); }}
              onKeyDown={onListKey}
              role="combobox"
              aria-expanded="true"
              aria-controls={listId}
              aria-activedescendant={results[active] ? `${listId}-${active}` : undefined}
            />
          </div>
          <ul id={listId} role="listbox" className={styles.results} aria-label="Results">
            {results.map((d, i) => (
              <li
                key={d.href}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                className={styles.result}
                onMouseEnter={() => setActive(i)}
                onClick={() => go(d.href)}
              >
                <span>{d.label}</span>
                <span className="label">{d.hint}</span>
              </li>
            ))}
            {results.length === 0 && <li className={styles.empty}>Nothing matches “{query}”. Try a project name or a technology.</li>}
          </ul>
          <p className={`label ${styles.help}`}>↑ ↓ to move · Enter to open · Esc to close</p>
        </div>
      </dialog>
    </>
  );
}
