'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  User,
  Briefcase,
  BookOpen,
  Mail,
  Download,
  Github,
  Linkedin,
  Search,
  Command,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';

type Cmd = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
  action: () => void;
};

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    setSelected(0);
  }, []);

  const commands: Cmd[] = [
    {
      id: 'home',
      label: 'Home',
      description: 'Go to the home page',
      icon: Home,
      color: 'text-purple-400',
      action: () => { router.push('/'); close(); },
    },
    {
      id: 'about',
      label: 'About',
      description: 'Learn more about Aman',
      icon: User,
      color: 'text-cyan-400',
      action: () => { router.push('/about'); close(); },
    },
    {
      id: 'work',
      label: 'Work & Projects',
      description: 'View experience and projects',
      icon: Briefcase,
      color: 'text-blue-400',
      action: () => { router.push('/work'); close(); },
    },
    {
      id: 'blog',
      label: 'Blog',
      description: 'Read posts on cloud and AI',
      icon: BookOpen,
      color: 'text-green-400',
      action: () => { router.push('/blogs'); close(); },
    },
    {
      id: 'contact',
      label: 'Contact',
      description: 'Send a message',
      icon: Mail,
      color: 'text-saffron',
      action: () => { router.push('/contact'); close(); },
    },
    {
      id: 'resume',
      label: 'Download Resume',
      description: 'Get the latest PDF resume',
      icon: Download,
      color: 'text-yellow-400',
      action: () => { window.open('/amankeshridotcom.pdf', '_blank'); close(); },
    },
    {
      id: 'github',
      label: 'GitHub',
      description: 'Open github.com/amankeshri7542',
      icon: Github,
      color: 'text-white/80',
      action: () => { window.open('https://github.com/amankeshri7542', '_blank'); close(); },
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      description: 'Connect on LinkedIn',
      icon: Linkedin,
      color: 'text-blue-400',
      action: () => { window.open('https://www.linkedin.com/in/aman-kumar-keshri', '_blank'); close(); },
    },
  ];

  const filtered = query.trim()
    ? commands.filter(
        (c) =>
          c.label.toLowerCase().includes(query.toLowerCase()) ||
          c.description.toLowerCase().includes(query.toLowerCase())
      )
    : commands;

  // Keyboard: Cmd+K to open, Escape to close, Arrow keys + Enter to navigate
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [close]);

  // Arrow navigation within palette
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelected((s) => Math.min(s + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelected((s) => Math.max(s - 1, 0));
      } else if (e.key === 'Enter' && filtered[selected]) {
        filtered[selected].action();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, selected, filtered]);

  // Auto-focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelected(0);
    }
  }, [open]);

  return (
    <>
      {/* Trigger hint — bottom-left */}
      <motion.button
        onClick={() => setOpen(true)}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2 }}
        className="fixed bottom-6 left-6 z-[98] hidden md:flex items-center gap-2 px-3 py-2 glass-cosmic rounded-lg text-white/40 hover:text-white/80 transition-all text-xs border border-white/10 hover:border-purple-500/40"
        title="Open command palette"
      >
        <Command size={12} />
        <span>K</span>
        <span className="ml-1 opacity-60">search</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
              className="fixed inset-0 z-[9990] bg-black/70"
              style={{ backdropFilter: 'blur(6px)' }}
            />

            {/* Palette modal */}
            <motion.div
              key="palette"
              initial={{ opacity: 0, scale: 0.95, y: -16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -16 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="fixed top-[20%] left-1/2 -translate-x-1/2 z-[9991] w-full max-w-lg"
            >
              <div
                className="rounded-2xl overflow-hidden border border-purple-500/30"
                style={{
                  background: 'rgba(8,4,20,0.97)',
                  backdropFilter: 'blur(30px)',
                  boxShadow: '0 0 60px rgba(139,92,246,0.25), 0 30px 80px rgba(0,0,0,0.7)',
                }}
              >
                {/* Search input */}
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-purple-500/20">
                  <Search size={16} className="text-white/40 flex-shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search pages, actions…"
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setSelected(0); }}
                    className="flex-1 bg-transparent text-white placeholder:text-white/30 outline-none text-sm"
                  />
                  <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/8 border border-white/10 text-white/30 text-[10px] font-mono">
                    esc
                  </kbd>
                </div>

                {/* Results */}
                <div className="py-2 max-h-80 overflow-y-auto">
                  {filtered.length === 0 ? (
                    <p className="px-4 py-8 text-center text-white/30 text-sm">
                      No results for &quot;{query}&quot;
                    </p>
                  ) : (
                    filtered.map((cmd, i) => (
                      <button
                        key={cmd.id}
                        onClick={cmd.action}
                        onMouseEnter={() => setSelected(i)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                          selected === i ? 'bg-purple-600/20' : 'hover:bg-white/5'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          selected === i ? 'bg-purple-600/30' : 'bg-white/5'
                        }`}>
                          <cmd.icon size={15} className={cmd.color} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white">{cmd.label}</div>
                          <div className="text-xs text-white/40 truncate">{cmd.description}</div>
                        </div>
                        {selected === i && (
                          <ArrowRight size={14} className="text-purple-400 flex-shrink-0" />
                        )}
                      </button>
                    ))
                  )}
                </div>

                {/* Footer hint */}
                <div className="flex items-center gap-4 px-4 py-2.5 border-t border-purple-500/15 text-[10px] text-white/25 font-mono">
                  <span><kbd>↑↓</kbd> navigate</span>
                  <span><kbd>↵</kbd> select</span>
                  <span><kbd>esc</kbd> close</span>
                  <span className="ml-auto flex items-center gap-1">
                    <Command size={9} /><span>K</span> to toggle
                  </span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
