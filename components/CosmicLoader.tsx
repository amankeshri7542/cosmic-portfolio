'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CosmicLoader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for DOM content + a brief moment for Three.js to start
    const timer = setTimeout(() => setLoading(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center"
          style={{ background: '#050505' }}
        >
          {/* Spinning mandala loader */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="mb-8"
          >
            <svg viewBox="0 0 120 120" width="80" height="80">
              <g transform="translate(60,60)" fill="none" stroke="#E8A045" strokeWidth="1" opacity="0.7">
                <circle r="50" />
                <circle r="38" />
                {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
                  <line
                    key={angle}
                    x1={Math.round(Math.cos((angle * Math.PI) / 180) * 38 * 100) / 100}
                    y1={Math.round(Math.sin((angle * Math.PI) / 180) * 38 * 100) / 100}
                    x2={Math.round(Math.cos((angle * Math.PI) / 180) * 50 * 100) / 100}
                    y2={Math.round(Math.sin((angle * Math.PI) / 180) * 50 * 100) / 100}
                    strokeWidth="2"
                  />
                ))}
                <polygon points="0,-28 24,14 -24,14" />
                <polygon points="0,28 24,-14 -24,-14" />
              </g>
            </svg>
          </motion.div>

          {/* Pulsing text */}
          <motion.p
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              color: '#E8A045',
              fontSize: '13px',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-cinzel), serif',
            }}
          >
            Entering the Brahmaand
          </motion.p>

          {/* Progress bar */}
          <div className="mt-6 w-48 h-[2px] bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 2, ease: 'easeInOut' }}
              style={{ height: '100%', background: 'linear-gradient(90deg, #8b5cf6, #E8A045)' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
