'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Cloud, Shield, Cpu, Download } from 'lucide-react';
import Typewriter from 'typewriter-effect';
import BrahmaandGalaxy from '@/components/BrahmaandGalaxy';

export default function Home() {
  return (
    <main className="relative z-10 min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-6 py-20 relative">
        <div className="max-w-4xl mx-auto w-full text-center z-10">

          {/* Centered Profile Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="mb-8 relative inline-block"
          >
            <div className="relative w-40 h-40 md:w-56 md:h-56 mx-auto" style={{ overflow: 'visible' }}>
              {/* Mandala ring behind everything — scaled up to extend beyond profile */}
              <div className="absolute" style={{
                inset: '-25%',
                zIndex: 0,
                animation: 'mandala-spin 25s linear infinite',
              }}>
                <style>{`
                  @keyframes mandala-spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                  }
                `}</style>
                <svg
                  viewBox="0 0 200 200"
                  width="100%"
                  height="100%"
                  style={{ display: 'block' }}
                >
                  <g transform="translate(100,100)" fill="none" stroke="#E8A045" strokeWidth="0.8" opacity="0.55">
                    <circle r="94" />
                    <circle r="82" />
                    {[0,45,90,135,180,225,270,315].map(angle => (
                      <line
                        key={angle}
                        x1={Math.cos((angle * Math.PI) / 180) * 82}
                        y1={Math.sin((angle * Math.PI) / 180) * 82}
                        x2={Math.cos((angle * Math.PI) / 180) * 94}
                        y2={Math.sin((angle * Math.PI) / 180) * 94}
                        strokeWidth="1.5"
                      />
                    ))}
                    <polygon points="0,-72 62,36 -62,36" />
                    <polygon points="0,72 62,-36 -62,-36" />
                    {[0,45,90,135,180,225,270,315].map(angle => (
                      <circle
                        key={angle}
                        cx={Math.cos((angle * Math.PI) / 180) * 88}
                        cy={Math.sin((angle * Math.PI) / 180) * 88}
                        r="3"
                        fill="#E8A045"
                      />
                    ))}
                  </g>
                </svg>
              </div>

              {/* Blur glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full blur-3xl opacity-40 animate-pulse" style={{ zIndex: 1 }}></div>

              {/* Profile image */}
              <div className="relative w-full h-full rounded-full overflow-hidden ring-4 ring-purple-500/50 glow-purple shadow-2xl" style={{ zIndex: 2 }}>
                <Image
                  src="/aman1.png"
                  alt="Aman Kumar"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </motion.div>

          {/* Centered Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-tight tracking-tight">
              <span className="text-glow-white">Aman Kumar</span>
            </h1>

            <div className="text-xl md:text-3xl text-cyan-300 min-h-[45px] flex justify-center items-center font-medium">
              <Typewriter
                options={{
                  strings: [
                    'Ram Bhakt 🙏',
                    'JS Developer living inside AWS Cloud ☁️',
                  ],
                  autoStart: true,
                  loop: true,
                  deleteSpeed: 30,
                  delay: 50,
                }}
              />
            </div>

            <p className="text-lg md:text-xl text-white/90 font-medium leading-relaxed max-w-2xl mx-auto">
              Building AI-powered creative tools and scalable serverless infrastructure on AWS.
            </p>

            {/* Hero Icons */}
            <div className="flex justify-center gap-8 py-6">
              {[
                { icon: Cloud, label: 'Cloud Native', color: 'text-cyan-300' },
                { icon: Cpu, label: 'GenAI', color: 'text-purple-300' },
                { icon: Shield, label: 'DevOps', color: 'text-blue-300' },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + idx * 0.2 }}
                  className="flex flex-col items-center gap-2 group"
                >
                  <item.icon className={`w-8 h-8 ${item.color} group-hover:scale-110 transition-transform duration-300`} />
                  <span className="text-xs text-white/80 font-semibold tracking-wide">{item.label}</span>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link
                href="/work"
                className="glass-cosmic px-8 py-4 hover:bg-purple-600/30 text-white font-semibold rounded-full transition-all inline-flex items-center gap-2 group border border-purple-500/30 hover:border-purple-400"
              >
                View My Work
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="/cloud.pdf"
                download
                className="glass-cosmic px-8 py-4 hover:bg-green-600/30 text-white font-semibold rounded-full transition-all inline-flex items-center gap-2 border border-green-500/30 hover:border-green-400"
              >
                <Download size={20} />
                Resume
              </a>
              <Link
                href="/contact"
                className="glass-cosmic px-8 py-4 hover:bg-cyan-600/30 text-white font-semibold rounded-full transition-all border border-cyan-500/30 hover:border-cyan-400"
              >
                Get In Touch
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="min-h-screen flex items-center justify-center px-6 py-20">
        <div className="max-w-6xl mx-auto w-full">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 text-white">
            <span className="text-glow-white">About Me</span>
          </h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-cosmic p-8 md:p-12 rounded-2xl max-w-4xl mx-auto text-center md:text-left"
          >
            <p className="text-lg md:text-xl text-white/90 font-medium leading-loose mb-8">
              DevOps & Cloud Engineer with a passion for building <span className="text-cyan-300 font-semibold">AI-powered creative tools</span>. I specialize in <span className="text-cyan-300 font-semibold">AWS Serverless architectures</span>, Infrastructure as Code (Terraform), and orchestrating <span className="text-purple-300 font-semibold">Multi-Modal AI systems</span>. Experienced in deploying scalable MERN applications and managing production Linux environments.
            </p>
          </motion.div>

          {/* Brahmaand Galaxy — Tech Solar System */}
          <div className="mt-16">
            <h3 className="text-2xl font-semibold text-center text-white mb-2">
              The Brahmaand — <span className="text-saffron">IT Universe</span>
            </h3>
            <p className="text-center text-white/50 text-sm mb-10">Your tech solar system</p>
            <BrahmaandGalaxy />
          </div>
        </div>
      </section>

      {/* Dharma Code Section */}
      <section className="py-20 px-6 flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="glass-cosmic rounded-2xl p-12 max-w-3xl w-full text-center"
          style={{ borderColor: 'rgba(232,160,69,0.2)' }}
        >
          {/* Top saffron line */}
          <div style={{ width: 40, height: 1, background: '#E8A045', opacity: 0.6, margin: '0 auto 20px' }} />

          <p style={{
            color: 'rgba(232,160,69,0.6)',
            fontSize: '11px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            marginBottom: '20px'
          }}>
            My Dharma
          </p>

          <p style={{
            color: 'rgba(255,255,255,0.92)',
            fontSize: '22px',
            lineHeight: 1.8,
            fontStyle: 'italic',
            marginBottom: '16px',
            fontFamily: 'serif'
          }}>
            कर्मण्येवाधिकारस्ते मा फलेषु कदाचन
          </p>

          <p style={{ color: '#E8A045', fontSize: '14px', letterSpacing: '0.03em', marginBottom: '10px' }}>
            You have the right to work, never to its fruits.
          </p>

          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>
            — Bhagavad Gita 2.47
          </p>

          {/* Bottom saffron line */}
          <div style={{ width: 40, height: 1, background: '#E8A045', opacity: 0.6, margin: '20px auto 0' }} />
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="min-h-[50vh] flex items-center justify-center px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-6xl font-bold mb-6 text-white">
              <span className="text-glow-purple">Let&apos;s Build Something Amazing</span>
            </h2>
            <p className="text-lg md:text-xl text-white/90 font-medium mb-12 max-w-2xl mx-auto">
              Ready to bring your ideas to life with cutting-edge technology and best practices.
            </p>
            <Link
              href="/contact"
              className="glass-cosmic px-10 py-5 hover:bg-purple-600/30 text-white text-lg font-semibold rounded-full transition-all inline-flex items-center gap-3 border border-purple-500/30 hover:border-purple-400"
            >
              Start a Project <ArrowRight size={24} />
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}