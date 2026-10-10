"use client";

import { useEffect, useSyncExternalStore } from "react";
import { motionAllowed, subscribeMotion } from "./StoryChrome";

/**
 * Scroll-scrubbed build. Each chapter owns one step of the stage; scrolling back un-builds it.
 * Off under reduced motion or the "Motion off" toggle: the finished product shows and everything still works.
 */
export function StoryMotion() {
  const allowed = useSyncExternalStore(subscribeMotion, motionAllowed, () => true);

  useEffect(() => {
    const root = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !allowed) {
      root.classList.remove("story-motion", "story-live");
      return;
    }
    root.classList.add("story-motion");
    let ctx: { revert: () => void } | undefined;
    let dead = false;

    (async () => {
      const [{ gsap }, { ScrollTrigger }, { MotionPathPlugin }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
        import("gsap/MotionPathPlugin"),
      ]);
      if (dead) return;
      gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
      ScrollTrigger.config({ ignoreMobileResize: true });

      const svg = document.querySelector<SVGSVGElement>("[aria-labelledby='stage-title stage-desc']");
      if (!svg) return;
      const q = (sel: string) => Array.from(svg.querySelectorAll<SVGElement>(sel));
      const part = (name: string) => q(`[data-part='${name}']`);
      const logLines = Array.from(document.querySelectorAll<HTMLElement>("ol[aria-hidden='true'] li[data-s]"));
      const label = document.querySelector<HTMLElement>("[data-stage-label]");
      const rails = Array.from(document.querySelectorAll<HTMLElement>("[data-rail]"));
      const mobile = window.matchMedia("(max-width: 900px)").matches;

      ctx = gsap.context(() => {
        gsap.set(q("[data-s]:not([data-s='0'])"), { opacity: 0 });
        gsap.set(q("[data-s='0']"), { opacity: 1 });
        gsap.set(logLines, { opacity: 0, display: "none" });
        rails.forEach((r) => r.style.setProperty("--p", "0"));
        root.classList.add("story-live");

        // The label shows the furthest step that has started, however the reader got there (scroll, jump, rail).
        const progress = [0, 0, 0, 0, 0, 0, 0];
        const syncLabel = () => {
          if (!label) return;
          let n = 0;
          for (let i = 1; i < progress.length; i++) if (progress[i] > 0.02) n = i;
          label.textContent = `step ${n} / 6`;
        };

        type TL = ReturnType<typeof gsap.timeline>;
        const steps: Record<number, (tl: TL) => void> = {
          1: (tl) => {
            tl.to(q("[data-s='0']"), { opacity: 0, duration: 0.2 })
              .fromTo(part("frame"), { opacity: 0, scale: 0.94, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.5 }, "<")
              .fromTo(part("ui"), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5 });
          },
          2: (tl) => {
            tl.fromTo(part("api"), { opacity: 0, x: 24 }, { opacity: 1, x: 0, duration: 0.5 })
              .from(q("[data-guard]"), { opacity: 0, scale: 0.5, transformOrigin: "50% 50%", stagger: 0.15, duration: 0.3 })
              .to(q("[data-packet='uiApi']"), { opacity: 1, duration: 0.2 });
          },
          3: (tl) => {
            tl.fromTo(part("db"), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5 })
              .from(q("[data-table]"), { opacity: 0, y: 14, stagger: 0.08, duration: 0.3 })
              // the point of the transaction: all three new rows land together
              .from(q("[data-table] > rect:nth-of-type(n+5), [data-table] > text:last-child"), { opacity: 0, scale: 0.8, transformOrigin: "50% 50%", duration: 0.25 })
              .from(q("[data-job]"), { opacity: 0, x: -14, stagger: 0.1, duration: 0.3 })
              .to(q("[data-packet='apiDb'], [data-packet='apiQueue']"), { opacity: 1, duration: 0.2 });
          },
          4: (tl) => {
            tl.fromTo(part("pipeline"), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4 })
              .from(q("[data-pipe]"), { opacity: 0, x: -10, stagger: 0.15, duration: 0.3 })
              .fromTo(part("docker"), { opacity: 0, scale: 1.04, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.4 })
              .fromTo(part("aws"), { opacity: 0, scale: 1.04, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.4 })
              .to(q("[data-packet='ship']"), { opacity: 1, duration: 0.2 });
          },
          5: (tl) => {
            tl.fromTo(part("ai"), { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.45 })
              .from(q("[data-bubble='0']"), { opacity: 0, y: 10, duration: 0.3 })
              .from(q("[data-bubble='1']"), { opacity: 0, y: 10, duration: 0.3 }, "+=0.15")
              .to(q("[data-packet='dbAi']"), { opacity: 1, duration: 0.2 }, "<");
          },
          6: (tl) => {
            tl.fromTo(part("done"), { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.4 });
          },
        };

        document.querySelectorAll<HTMLElement>("[data-chapter]").forEach((chapter) => {
          const n = Number(chapter.dataset.chapter);
          if (n > 0) {
            const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
            steps[n]?.(tl);
            const lines = logLines.filter((l) => l.dataset.s === String(n));
            tl.set(lines, { display: "list-item" }, 0.01).to(lines, { opacity: 1, stagger: 0.25, duration: 0.15 }, 0.1); // past 0 so it reverts on scroll-back
            ScrollTrigger.create({
              trigger: chapter,
              // On phones the stage covers the top of the screen: finish each step while its title is still visible.
              start: mobile ? "top 96%" : "top 70%",
              end: mobile ? "top 62%" : "top 20%",
              scrub: 0.7,
              animation: tl,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                rails[n - 1]?.style.setProperty("--p", self.progress.toFixed(3));
                progress[n] = self.progress;
                syncLabel();
              },
              onRefresh: (self) => { progress[n] = self.progress; syncLabel(); },
            });
          }
          // Text rises in as each chapter arrives (not the interactive panel — it must never be invisible while usable).
          const kids = Array.from(chapter.children).filter((k) => !k.matches("[role='group'], details"));
          gsap.from(kids, {
            opacity: 0,
            y: 24,
            stagger: 0.05,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: chapter, start: mobile ? "top 95%" : "top 78%", toggleActions: "play none none reverse" },
            immediateRender: n !== 0,
          });
        });

        // Packets: ambient loops along each wire; their visibility is owned by the scrubbed steps above.
        const loops = q("[data-packet]").map((p, i) => {
          const wire = svg.querySelector<SVGPathElement>(`[data-wire='${(p as SVGElement).dataset.packet}']`);
          if (!wire) return null;
          return gsap.to(p, { motionPath: { path: wire, align: wire, alignOrigin: [0.5, 0.5] }, duration: 1.6 + (i % 3) * 0.35, repeat: -1, ease: "none", delay: i * 0.3 });
        });
        ScrollTrigger.create({
          trigger: svg.closest("section"),
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) => loops.forEach((l) => (self.isActive ? l?.resume() : l?.pause())),
        });
      });

      document.fonts?.ready.then(() => ScrollTrigger.refresh());
    })().catch(() => root.classList.remove("story-motion"));

    return () => {
      dead = true;
      ctx?.revert();
      root.classList.remove("story-live", "story-motion");
      const label = document.querySelector<HTMLElement>("[data-stage-label]");
      if (label) label.textContent = "finished";
    };
  }, [allowed]);
  return null;
}
