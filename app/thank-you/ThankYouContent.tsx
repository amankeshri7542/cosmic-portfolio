'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, CheckCircle, Sparkles } from 'lucide-react';

export default function ThankYouContent() {
    return (
        <main className="relative z-10 min-h-screen flex items-center justify-center px-6 py-20">
            <div className="max-w-xl mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-8"
                >
                    <div className="relative inline-block">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-cyan-500 rounded-full blur-3xl opacity-30 animate-pulse" />
                        <CheckCircle className="relative w-24 h-24 text-green-400" strokeWidth={1.5} />
                    </div>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl md:text-5xl font-bold text-white mb-4"
                    style={{ fontFamily: 'var(--font-cinzel)' }}
                >
                    <span className="text-glow-white">Thank You!</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="text-lg text-white font-semibold leading-relaxed mb-4"
                    style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}
                >
                    Your message has been sent successfully! ✨
                </motion.p>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    className="text-base text-white/85 font-medium leading-relaxed mb-10"
                    style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}
                >
                    I&apos;ll get back to you soon. In the meantime, feel free to explore my
                    projects and see what I&apos;ve been building!
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                    <Link
                        href="/work"
                        className="glass-cosmic px-8 py-4 hover:bg-purple-600/30 text-white font-semibold rounded-full transition-all inline-flex items-center justify-center gap-2 group border border-purple-500/30 hover:border-purple-400"
                    >
                        <Sparkles size={18} />
                        Explore My Projects
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                        href="/"
                        className="glass-cosmic px-8 py-4 hover:bg-cyan-600/30 text-white font-semibold rounded-full transition-all border border-cyan-500/30 hover:border-cyan-400 inline-flex items-center justify-center"
                    >
                        Back to Home
                    </Link>
                </motion.div>
            </div>
        </main>
    );
}
