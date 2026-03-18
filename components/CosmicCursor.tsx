'use client';

import { useEffect, useRef } from 'react';

export default function CosmicCursor() {
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Don't run on touch devices — no mouse to track
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const dot = dotRef.current;
    if (!dot) return;

    // Hide native cursor globally
    document.body.style.cursor = 'none';

    const onMouseMove = (e: MouseEvent) => {
      // Move the main dot
      dot.style.left = `${e.clientX}px`;
      dot.style.top = `${e.clientY}px`;

      // Create a trail particle at cursor position
      const trail = document.createElement('div');
      trail.style.cssText = `
        position: fixed;
        left: ${e.clientX}px;
        top: ${e.clientY}px;
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: #E8A045;
        pointer-events: none;
        z-index: 9998;
        transform: translate(-50%, -50%);
        opacity: 0.7;
        transition: opacity 400ms ease-out, transform 400ms ease-out;
      `;
      document.body.appendChild(trail);

      // Trigger fade-out on next frame (allows transition to kick in)
      requestAnimationFrame(() => {
        trail.style.opacity = '0';
        trail.style.transform = 'translate(-50%, -50%) scale(0.2)';
      });

      // Remove from DOM after animation completes
      setTimeout(() => trail.remove(), 400);
    };

    // Restore cursor on interactive elements
    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button, [role="button"]')) {
        document.body.style.cursor = 'pointer';
        if (dot) dot.style.transform = 'translate(-50%, -50%) scale(1.8)';
      }
    };

    const onMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button, [role="button"]')) {
        document.body.style.cursor = 'none';
        if (dot) dot.style.transform = 'translate(-50%, -50%) scale(1)';
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseover', onMouseOver);
    document.addEventListener('mouseout', onMouseOut);

    // Cleanup — critical, prevents memory leaks between navigations
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
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: '#8b5cf6',
        boxShadow: '0 0 10px rgba(139, 92, 246, 0.8), 0 0 20px rgba(139, 92, 246, 0.4)',
        pointerEvents: 'none',
        zIndex: 9999,
        transform: 'translate(-50%, -50%)',
        transition: 'transform 150ms ease-out',
        left: '-20px',
        top: '-20px',
      }}
    />
  );
}
