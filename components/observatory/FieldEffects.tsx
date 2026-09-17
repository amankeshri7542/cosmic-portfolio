"use client";
import { useEffect } from "react";
export default function FieldEffects() {
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => document.documentElement.style.setProperty("--sky-shift", `${media.matches ? 0 : Math.min(window.scrollY * .17, 180)}px`));
    };
    update(); window.addEventListener("scroll", update, { passive: true }); media.addEventListener("change", update);
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("is-observed"); observer.unobserve(entry.target); } });
    }, { threshold: .1 });
    document.querySelectorAll(".study-visual, .stack-copy, .light-copy").forEach(element => observer.observe(element));
    return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener("scroll", update); media.removeEventListener("change", update); };
  }, []);
  return null;
}
