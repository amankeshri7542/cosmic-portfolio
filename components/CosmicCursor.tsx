'use client';

import { useEffect, useRef } from 'react';

export default function CosmicCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const prevX = useRef(-20);
  const prevY = useRef(-20);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const dot = dotRef.current;
    if (!dot) return;

    document.body.style.cursor = 'none';

    const onMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - prevX.current;
      const dy = e.clientY - prevY.current;
      const speed = Math.hypot(dx, dy);

      // Move the core dot
      dot.style.left = `${e.clientX}px`;
      dot.style.top = `${e.clientY}px`;

      prevX.current = e.clientX;
      prevY.current = e.clientY;

      // Only draw a comet tail when moving fast enough
      if (speed < 2.5) return;

      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      // Tail length proportional to speed, capped at 45px
      const tailLen = Math.min(speed * 2.8, 45);
      // Tail width scales slightly with speed
      const tailH = Math.min(2 + speed * 0.06, 3.5);

      const comet = document.createElement('div');
      comet.style.cssText = `
        position: fixed;
        left: ${e.clientX}px;
        top: ${e.clientY - tailH / 2}px;
        width: ${tailLen}px;
        height: ${tailH}px;
        pointer-events: none;
        z-index: 9998;
        transform-origin: left center;
        transform: rotate(${angle + 180}deg);
        background: linear-gradient(
          to right,
          rgba(232,160,69,0.95),
          rgba(168,85,247,0.55),
          transparent
        );
        border-radius: 2px;
        filter: blur(0.6px);
        box-shadow: 0 0 6px rgba(232,160,69,0.45);
        opacity: 0.88;
        transition: opacity 220ms ease-out;
      `;
      document.body.appendChild(comet);

      requestAnimationFrame(() => {
        comet.style.opacity = '0';
      });
      setTimeout(() => comet.remove(), 220);
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button, [role="button"], input, textarea')) {
        document.body.style.cursor = 'pointer';
        if (dot) dot.style.transform = 'translate(-50%, -50%) scale(2)';
      }
    };

    const onMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button, [role="button"], input, textarea')) {
        document.body.style.cursor = 'none';
        if (dot) dot.style.transform = 'translate(-50%, -50%) scale(1)';
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseover', onMouseOver);
    document.addEventListener('mouseout', onMouseOut);

    return () => {
      document.body.style.cursor = 'auto';
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseout', onMouseOut);
    };
  }, []);

  return (
    <div
      ref={dotRef}
      style={{
        position: 'fixed',
        width: '9px',
        height: '9px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, #fff 0%, #8b5cf6 60%)',
        boxShadow: '0 0 8px rgba(139,92,246,0.9), 0 0 18px rgba(139,92,246,0.4)',
        pointerEvents: 'none',
        zIndex: 9999,
        transform: 'translate(-50%, -50%)',
        transition: 'transform 120ms ease-out',
        left: '-20px',
        top: '-20px',
      }}
    />
  );
}
