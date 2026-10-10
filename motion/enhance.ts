// The motion layer. Loaded after idle; every effect is optional and reversible.
// Content is fully visible and usable without this file.

const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;

export function enhance(path: string): () => void {
  const cleanups: Array<() => void> = [];
  cleanups.push(trackScrolled());
  if (!reduceMotion()) {
    cleanups.push(revealOnView());
    const reading = path.startsWith("/write") || path.startsWith("/blogs/");
    if (finePointer() && !reading) {
      let stop: (() => void) | undefined;
      let dead = false;
      import("./smooth").then((m) => { if (!dead) stop = m.startSmoothScroll(); });
      cleanups.push(() => { dead = true; stop?.(); });
    }
  }
  return () => cleanups.forEach((fn) => fn());
}

function trackScrolled() {
  const root = document.documentElement;
  const update = () => root.toggleAttribute("data-scrolled", window.scrollY > 24);
  update();
  window.addEventListener("scroll", update, { passive: true });
  return () => window.removeEventListener("scroll", update);
}

/** Generic reveal for [data-reveal] blocks below the fold: short rise, no opacity trap above the fold. */
function revealOnView() {
  const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]")).filter(
    (el) => el.getBoundingClientRect().top > window.innerHeight,
  );
  els.forEach((el) => el.setAttribute("data-reveal", "pending"));
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        (e.target as HTMLElement).setAttribute("data-reveal", "in");
        io.unobserve(e.target);
      }
    },
    { rootMargin: "0px 0px -10% 0px" },
  );
  els.forEach((el) => io.observe(el));
  return () => {
    io.disconnect();
    els.forEach((el) => el.setAttribute("data-reveal", ""));
  };
}
