'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Calendar, ArrowRight } from 'lucide-react';
import type { BlogMeta } from '@/lib/blog';

export default function BlogsContent({ blogs }: { blogs: BlogMeta[] }) {
    return (
        <main className="relative z-10 pt-24 pb-16 px-4">
            <div className="max-w-5xl mx-auto">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-6xl font-bold mb-4 text-white text-glow-white"
                >
                    Blog
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-white/70 font-medium mb-12 text-lg"
                >
                    Thoughts on cloud, AI, and building things that scale.
                </motion.p>

                {blogs.length === 0 ? (
                    <p className="text-white/50 text-center mt-20">No posts yet. Check back soon!</p>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {blogs.map((blog, idx) => (
                            <motion.article
                                key={blog.slug}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="aurora-card rounded-xl h-full"
                            >
                                <Link
                                    href={`/blogs/${blog.slug}`}
                                    className="block glass-cosmic p-6 rounded-xl hover:border-purple-500/40 transition-all group h-full"
                                >
                                    <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold mb-3">
                                        <Calendar size={12} />
                                        <span>{blog.date}</span>
                                    </div>
                                    <h2 className="text-lg font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors leading-snug">
                                        {blog.title}
                                    </h2>
                                    <p className="text-white/60 text-sm leading-relaxed mb-4 line-clamp-3">
                                        {blog.excerpt}
                                    </p>
                                    <span className="inline-flex items-center gap-1 text-cyan-400 text-sm font-semibold group-hover:gap-2 transition-all">
                                        Read more <ArrowRight size={14} />
                                    </span>
                                </Link>
                            </motion.article>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
