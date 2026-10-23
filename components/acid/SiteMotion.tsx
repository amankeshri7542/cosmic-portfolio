"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// The lab's director. Everything here is optional: without it the page is complete and still.
// - draws the scroll-progress ink line (its motion is pure CSS, driven by the scroll timeline)
// - marks [data-sec] blocks "in" (seen once: letters drop in) and "vis" (on screen: animations run)
// - on a mouse, moves the cursor ring and nudges the hero blobs and portrait, one rAF write per frame
// - tilts service cards toward the pointer, and swells the cursor ring over anything pressable
// - says hello in the DevTools console

const quiet = () =>
  matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "off";

export function SiteMotion() {
  const path = usePathname();

  useEffect(() => {
    const secs = Array.from(document.querySelectorAll<HTMLElement>("[data-sec]"));
    if (typeof IntersectionObserver === "undefined") {
      secs.forEach((el) => el.classList.add("in", "vis"));
      return;
    }
    const seen = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("in");
          seen.unobserve(e.target);
        }
      },
      { threshold: 0.08 },
    );
    const vis = new IntersectionObserver(
      (entries) => {
        for (const e of entries) e.target.classList.toggle("vis", e.isIntersecting);
      },
      { rootMargin: "80px 0px" },
    );
    secs.forEach((el) => {
      if (!el.classList.contains("in")) seen.observe(el);
      vis.observe(el);
    });
    return () => {
      seen.disconnect();
      vis.disconnect();
    };
  }, [path]);

  useEffect(() => {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const ring = document.querySelector<HTMLElement>(".cur.ring");
    const dot = document.querySelector<HTMLElement>(".cur.dot");
    let raf = 0;
    let x = -100;
    let y = -100;
    let tilt: { el: HTMLElement; px: number; py: number } | null = null;

    const frame = () => {
      raf = 0;
      if (dot) dot.style.translate = `${x}px ${y}px`;
      if (ring) ring.style.translate = `${x}px ${y}px`;
      const hero = document.querySelector<HTMLElement>(".hero.vis");
      if (hero && !quiet()) {
        const r = hero.getBoundingClientRect();
        const nx = (x - r.left) / r.width - 0.5;
        const ny = Math.max(-0.5, Math.min(0.5, (y - r.top) / Math.min(r.height, 1000) - 0.5));
        // Set on the moving pieces only: a variable on the hero would restyle every letter under it.
        hero.querySelectorAll<HTMLElement>(".blob, .halo").forEach((el) => {
          el.style.setProperty("--nx", nx.toFixed(3));
          el.style.setProperty("--ny", ny.toFixed(3));
          if (el.classList.contains("a")) {
            el.style.setProperty("--hx", `${Math.round(x - r.left - 320)}px`);
            el.style.setProperty("--hy", `${Math.round(y - r.top - 320)}px`);
          }
        });
      }
      if (tilt) {
        const { el, px, py } = tilt;
        el.style.setProperty("--trx", `${((0.5 - py) * 16).toFixed(1)}deg`);
        el.style.setProperty("--try", `${((px - 0.5) * 18).toFixed(1)}deg`);
        el.style.setProperty("--tgx", `${Math.round(px * 100)}%`);
        el.style.setProperty("--tgy", `${Math.round(py * 100)}%`);
      }
    };
    let hot = false;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX;
      y = e.clientY;
      const press = !!(e.target as Element | null)?.closest?.("a, button, summary, label, input, select, textarea");
      if (press !== hot && ring) ring.classList.toggle("hot", (hot = press));
      const card = !quiet() && (e.target as Element | null)?.closest?.<HTMLElement>(".svc");
      if (card) {
        const r = card.getBoundingClientRect();
        tilt = { el: card, px: (x - r.left) / r.width, py: (y - r.top) / r.height };
      } else if (tilt) {
        tilt.el.style.setProperty("--trx", "0deg");
        tilt.el.style.setProperty("--try", "0deg");
        tilt = null;
      }
      if (!raf) raf = requestAnimationFrame(frame);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    const w = window as Window & { __akHello?: boolean };
    if (w.__akHello) return;
    w.__akHello = true;
    console.log(
      "%c" +
        [
          "    ___    __ __",
          "   /   |  / //_/   Aman Keshri · full-stack developer",
          "  / /| | / ,<      You opened the console. We will get along.",
          " / ___ |/ /| |     Hire me: amankeshri7479@gmail.com",
          "/_/  |_/_/ |_|     Psst. There is a switch in the header. Do not press it.",
        ].join("\n"),
      "font-family: monospace; font-size: 12px; line-height: 1.4; color: #D4FF3A; background: #0A0A0F; padding: 12px 16px; border-radius: 8px",
    );
  }, []);

  return (
    <>
      <span className="ink" aria-hidden="true"><b /><i /></span>
      <span className="cur ring" aria-hidden="true" />
      <span className="cur dot" aria-hidden="true" />
    </>
  );
}
