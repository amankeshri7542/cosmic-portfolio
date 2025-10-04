'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Code2, Cloud, Shield } from 'lucide-react';

export default function Home() {
  return (
    <main className="relative z-10">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 pt-16">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 text-white">
              Aman Kumar
            </h1>
            <p className="text-xl md:text-2xl text-purple-400 mb-8">
              Full Stack Developer
            </p>
            <p className="text-lg text-gray-400 mb-12 max-w-3xl mx-auto">
              Building secure, scalable applications with modern web technologies.
              Specialized in MERN stack, cloud infrastructure, and cybersecurity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/work"
                className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors inline-flex items-center gap-2"
              >
                View My Work <ArrowRight size={20} />
              </Link>
              <Link
                href="/contact"
                className="px-8 py-4 border border-purple-500 hover:bg-purple-500/20 text-white rounded-lg transition-colors"
              >
                Get In Touch
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Skills Preview */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-white">
            Expertise
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Code2, title: 'Full Stack Development', desc: 'React, Node.js, Express, MongoDB' },
              { icon: Cloud, title: 'Cloud & DevOps', desc: 'AWS, Docker, Kubernetes, CI/CD' },
              { icon: Shield, title: 'Security', desc: 'Secure coding, vulnerability assessment' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="glass-cosmic p-6 rounded-xl hover:border-purple-500 transition-colors"
              >
                <item.icon className="w-12 h-12 text-purple-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-white">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}