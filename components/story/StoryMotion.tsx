"use client";

import { useEffect } from "react";

/**
 * Scroll-scrubbed build. Each chapter owns one step of the stage; scrolling back un-builds it.
 * Loaded on the client only. Without it (or under reduced motion) the finished product stays visible.
 */
export function StoryMotion() {
  useEffect(() => {
    const root = document.documentElement;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.classList.remove("story-motion");
      return;
    }
    let ctx: { revert: () => void } | undefined;
    let killLoops: (() => void) | undefined;
    let dead = false;

    (async () => {
      const [{ gsap }, { ScrollTrigger }, { MotionPathPlugin }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
        import("gsap/MotionPathPlugin"),
      ]);
      if (dead) return;
      gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

      const svg = document.querySelector<SVGSVGElement>("[aria-labelledby='stage-title stage-desc']");
      if (!svg) return;
      const q = (sel: string) => Array.from(svg.querySelectorAll<SVGElement>(sel));
      const part = (name: string) => q(`[data-part='${name}']`);
      const logLines = Array.from(document.querySelectorAll<HTMLElement>("ol[aria-hidden='true'] li[data-s]"));
      const label = document.querySelector<HTMLElement>("[data-stage-label]");
      const rails = Array.from(document.querySelectorAll<HTMLElement>("[data-rail]"));
      const mobile = window.matchMedia("(max-width: 900px)").matches;

      ctx = gsap.context(() => {
        // Start from an empty canvas.
        gsap.set(q("[data-s]:not([data-s='0'])"), { opacity: 0 });
        gsap.set(q("[data-s='0']"), { opacity: 1 });
        gsap.set(logLines, { opacity: 0, display: "none" });
        rails.forEach((r) => r.style.setProperty("--p", "0"));
        root.classList.add("story-live");

        type TL = ReturnType<typeof gsap.timeline>;
        const steps: Record<number, (tl: TL) => void> = {
          1: (tl) => {
            tl.to(q("[data-s='0']"), { opacity: 0, duration: 0.2 })
              .fromTo(part("frame"), { opacity: 0, scale: 0.94, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.5 }, "<")
              .set(part("ui"), { opacity: 1 })
              .from(q("[data-part='ui'] > rect:not([fill])"), { opacity: 0, duration: 0.25 })
              .from(q("[data-part='ui'] text"), { opacity: 0, y: 6, stagger: 0.02, duration: 0.3 }, "<")
              .from(q("[data-row]"), { opacity: 0, x: -14, stagger: 0.08, duration: 0.3 }, "<0.1")
              .from(q("[data-part='ui'] rect[fill]"), { opacity: 0, y: 10, scale: 0.9, transformOrigin: "50% 50%", duration: 0.3 });
          },
          2: (tl) => {
            tl.fromTo(part("api"), { opacity: 0 }, { opacity: 1, duration: 0.01 })
              .from(q("[data-wire='uiApi']"), { opacity: 0, duration: 0.3 })
              .from(q("[data-part='api'] > rect, [data-part='api'] > text"), { opacity: 0, x: 24, stagger: 0.04, duration: 0.4 }, "<")
              .from(q("[data-guard]"), { opacity: 0, scale: 0.5, transformOrigin: "50% 50%", stagger: 0.15, duration: 0.3 })
              .to(q("[data-packet='uiApi']"), { opacity: 1, duration: 0.2 });
          },
          3: (tl) => {
            tl.fromTo(part("db"), { opacity: 0 }, { opacity: 1, duration: 0.01 })
              .from(q("[data-wire='apiDb'], [data-wire='apiQueue']"), { opacity: 0, duration: 0.3 })
              .from(q("[data-part='db'] > rect, [data-part='db'] > text:not([data-tx])"), { opacity: 0, y: 18, stagger: 0.04, duration: 0.4 }, "<")
              .from(q("[data-table]"), { opacity: 0, y: 14, stagger: 0.08, duration: 0.3 })
              .from(q("[data-tx]"), { opacity: 0, duration: 0.2 })
              // the point of the transaction: all three rows land together
              .from(q("[data-table] > rect:nth-of-type(n+5), [data-table] > text:last-child"), { opacity: 0, scale: 0.8, transformOrigin: "50% 50%", duration: 0.25 })
              .from(q("[data-job]"), { opacity: 0, x: -14, stagger: 0.1, duration: 0.3 })
              .to(q("[data-packet='apiDb'], [data-packet='apiQueue']"), { opacity: 1, duration: 0.2 });
          },
          4: (tl) => {
            tl.fromTo(part("pipeline"), { opacity: 0 }, { opacity: 1, duration: 0.01 })
              .from(q("[data-part='pipeline'] > rect"), { opacity: 0, y: 16, duration: 0.3 })
              .from(q("[data-pipe]"), { opacity: 0, x: -10, stagger: 0.15, duration: 0.3 })
              .fromTo(part("docker"), { opacity: 0, scale: 1.04, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.4 })
              .fromTo(part("aws"), { opacity: 0, scale: 1.04, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.4 })
              .to(q("[data-packet='ship']"), { opacity: 1, duration: 0.2 });
          },
          5: (tl) => {
            tl.fromTo(part("ai"), { opacity: 0 }, { opacity: 1, duration: 0.01 })
              .from(q("[data-part='ai'] > rect, [data-part='ai'] > text"), { opacity: 0, x: 30, duration: 0.4 })
              .from(q("[data-wire='dbAi']"), { opacity: 0, duration: 0.3 })
              .from(q("[data-bubble='0']"), { opacity: 0, y: 10, duration: 0.3 })
              .from(q("[data-bubble='1']"), { opacity: 0, y: 10, duration: 0.3 }, "+=0.15")
              .to(q("[data-packet='dbAi']"), { opacity: 1, duration: 0.2 }, "<");
          },
          6: (tl) => {
            tl.fromTo(part("done"), { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.4 })
              .to(q("[data-wire]"), { stroke: "#ff9f1c", duration: 0.4 }, "<");
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
              onUpdate: (self) => rails[n - 1]?.style.setProperty("--p", self.progress.toFixed(3)),
              onToggle: (self) => { if (self.isActive && label) label.textContent = `step ${n} / 6`; },
              onLeaveBack: () => { if (label) label.textContent = `step ${n - 1} / 6`; },
            });
          }
          // Text rises in as each chapter arrives.
          const kids = Array.from(chapter.children);
          gsap.from(kids, {
            opacity: 0,
            y: 28,
            stagger: 0.06,
            duration: 0.9,
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
        killLoops = () => loops.forEach((l) => l?.kill());

        // Pause the loops whenever the story is off screen.
        ScrollTrigger.create({
          trigger: svg.closest("section"),
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) => loops.forEach((l) => (self.isActive ? l?.resume() : l?.pause())),
        });
      });

      // Smooth scrolling (desktop) drives ScrollTrigger through native scroll events; refresh once fonts settle.
      document.fonts?.ready.then(() => ScrollTrigger.refresh());
    })().catch(() => root.classList.remove("story-motion"));

    return () => {
      dead = true;
      killLoops?.();
      ctx?.revert();
      root.classList.remove("story-live");
    };
  }, []);
  return null;
}
