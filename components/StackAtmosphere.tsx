"use client";

import { useEffect, useRef } from "react";

const logos = ["react", "rust", "python", "amazonwebservices", "nextjs", "postgresql", "typescript", "docker"];

/** Perspective-projected ribbon. Decorative: never captures scrolling or touch. */
export default function StackAtmosphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const images = logos.map(name => {
      const image = new Image();
      image.src = `/stack/${name}.svg`;
      image.onload = () => draw();
      return image;
    });
    let width = 0, height = 0, time = 0, frame = 0, last = 0;

    function point(u: number, lane = 0) {
      const angle = u * Math.PI * 2.6 + time * .12;
      const depth = Math.cos(angle) * 180;
      const scale = 850 / (850 - depth);
      return {
        x: width * (width < 760 ? .94 : .79) + (Math.sin(angle) * Math.min(width * .26, 350) + lane * 13) * scale,
        y: (u * 1.5 - .25) * height + Math.sin(angle + lane * .15) * 28,
        scale, angle: Math.sin(angle) * .22, depth,
      };
    }

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      const mobile = width < 760;
      for (let lane = -5; lane <= 5; lane++) {
        ctx.beginPath();
        for (let step = 0; step <= 90; step++) {
          const p = point(step / 90, lane);
          if (step === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = lane < 0 ? "rgba(136,220,215,.13)" : "rgba(185,160,255,.17)";
        ctx.lineWidth = lane === 0 ? 1.2 : .7;
        ctx.stroke();
      }
      const nodes = images.map((image, index) => {
        const u = (index / images.length + time * .012) % 1;
        return { image, index, u, ...point(u) };
      }).sort((a, b) => a.depth - b.depth);
      for (const node of nodes) {
        if (!node.image.complete || !node.image.naturalWidth) continue;
        const size = (mobile ? 34 : 42) * node.scale;
        const fade = Math.min(1, node.u * 10, (1 - node.u) * 10);
        ctx.save();
        ctx.translate(node.x, node.y);
        ctx.rotate(node.angle);
        ctx.scale(1, .86 + node.depth / 1400);
        ctx.globalAlpha = fade * (mobile ? .36 : .52);
        ctx.fillStyle = "#10192d";
        ctx.strokeStyle = node.index % 2 ? "#a98ddc" : "#6dafbf";
        ctx.lineWidth = .7;
        ctx.beginPath();
        ctx.roundRect(-size * .76, -size * .76, size * 1.52, size * 1.52, 9);
        ctx.fill();
        ctx.stroke();
        if (["rust", "nextjs"].includes(logos[node.index])) ctx.filter = "invert(1)";
        if (logos[node.index] === "amazonwebservices") ctx.filter = "brightness(0) invert(1)";
        ctx.drawImage(node.image, -size / 2, -size / 2, size, size);
        ctx.restore();
      }
    }

    function tick(now: number) {
      if (now - last >= 1000 / 30) {
        time += Math.min((now - last) / 1000, .06);
        last = now;
        draw();
      }
      frame = requestAnimationFrame(tick);
    }

    function sync() {
      cancelAnimationFrame(frame);
      draw();
      if (!document.hidden && !reduced.matches) {
        last = performance.now();
        frame = requestAnimationFrame(tick);
      }
    }

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      sync();
    }

    resize();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", sync);
    reduced.addEventListener("change", sync);
    return () => {
      cancelAnimationFrame(frame);
      images.forEach(image => { image.onload = null; });
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", sync);
      reduced.removeEventListener("change", sync);
    };
  }, []);

  return <canvas ref={canvasRef} className="stack-atmosphere" aria-hidden="true" />;
}
