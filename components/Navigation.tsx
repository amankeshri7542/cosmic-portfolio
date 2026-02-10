'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const navItems = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Work', href: '/work' },
  { name: 'Blogs', href: '/blogs' },
  { name: 'Contact', href: '/contact' },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Always show background on subpages, only transparent on home when not scrolled
  const isHome = pathname === '/';
  const showBackground = !isHome || scrolled;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${showBackground
          ? 'bg-[rgba(5,5,15,0.95)] backdrop-blur-xl border-b border-purple-500/20'
          : 'bg-transparent'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-purple-500/50 group-hover:ring-purple-400 transition-all">
              <Image
                src="/aman1.png"
                alt="Aman Kumar"
                fill
                className="object-cover"
              />
            </div>
            <span className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
              Aman Kumar
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`transition-colors relative group ${pathname === item.href
                    ? 'text-cyan-300'
                    : 'text-gray-300 hover:text-white'
                  }`}
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg bg-purple-500/20 border border-purple-500/30 text-cyan-300 hover:text-white hover:bg-purple-500/30 transition-all"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[rgba(5,5,15,0.98)] backdrop-blur-xl border-b border-purple-500/30"
          >
            <div className="px-4 pt-3 pb-5 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 text-center text-lg font-medium rounded-lg transition-all ${pathname === item.href
                      ? 'text-cyan-300 bg-purple-500/20 border border-purple-500/30'
                      : 'text-gray-200 hover:text-white hover:bg-purple-500/15'
                    }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}