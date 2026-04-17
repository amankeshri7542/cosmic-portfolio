'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [isDawn, setIsDawn] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('cosmic-theme');
    if (saved === 'dawn') {
      setIsDawn(true);
      document.documentElement.classList.add('dawn');
    }
  }, []);

  const toggle = () => {
    const next = !isDawn;
    setIsDawn(next);
    if (next) {
      document.documentElement.classList.add('dawn');
      localStorage.setItem('cosmic-theme', 'dawn');
    } else {
      document.documentElement.classList.remove('dawn');
      localStorage.setItem('cosmic-theme', 'cosmic');
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label={isDawn ? 'Switch to cosmic (dark) mode' : 'Switch to dawn (light header) mode'}
      title={isDawn ? 'Dawn mode — header & footer are warm' : 'Cosmic mode — deep space'}
      className="fixed bottom-6 right-6 z-[99] w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 border"
      style={{
        background: isDawn ? 'rgba(232, 160, 69, 0.15)' : 'rgba(139, 92, 246, 0.15)',
        borderColor: isDawn ? 'rgba(232, 160, 69, 0.4)' : 'rgba(139, 92, 246, 0.3)',
        backdropFilter: 'blur(12px)',
        boxShadow: isDawn
          ? '0 0 16px rgba(232, 160, 69, 0.25)'
          : '0 0 16px rgba(139, 92, 246, 0.2)',
      }}
    >
      {/* Sun = currently in dawn/light mode  |  Moon = currently in dark/cosmic mode */}
      {isDawn ? (
        <Sun size={18} className="text-amber-300" />
      ) : (
        <Moon size={18} className="text-purple-300" />
      )}
    </button>
  );
}
