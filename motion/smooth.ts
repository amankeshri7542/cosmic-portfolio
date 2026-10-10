import Lenis from "lenis";

/** Gentle wheel smoothing on desktop pointers only. Never on touch, reading pages or reduced motion. */
export function startSmoothScroll() {
  const lenis = new Lenis({
    duration: 1.05,
    smoothWheel: true,
    anchors: { offset: -72 },
    prevent: (node) => node.closest("dialog, [data-lenis-prevent], pre, textarea") !== null,
    autoRaf: true,
  });
  document.documentElement.classList.add("lenis");
  (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
  return () => {
    lenis.destroy();
    document.documentElement.classList.remove("lenis");
    delete (window as unknown as { __lenis?: Lenis }).__lenis;
  };
}
