'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Code2, Cloud, Shield } from 'lucide-react';
import Typewriter from 'typewriter-effect';

export default function Home() {
  return (
    <main className="relative z-10 snap-y snap-mandatory h-screen overflow-y-scroll">
      {/* Hero Section */}
      <section className="h-screen flex items-center justify-center px-4 snap-start">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left - Image */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="flex justify-center"
            >
              <div className="relative w-80 h-80 md:w-96 md:h-96">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full blur-3xl opacity-30 animate-pulse"></div>
                <div className="relative w-full h-full rounded-full overflow-hidden ring-4 ring-purple-500 glow-purple">
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

            {/* Right - Content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-6"
            >
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white">
                <span className="text-glow-white">Aman Kumar</span>
              </h1>
              
              <div className="text-2xl md:text-3xl text-purple-300 min-h-[45px]">
                <Typewriter
                  options={{
                    strings: ['Full Stack Developer', 'Gym Freak', 'Cloud Enthusiast'],
                    autoStart: true,
                    loop: true,
                    deleteSpeed: 50,
                    delay: 80,
                  }}
                />
              </div>

              <p className="text-lg md:text-xl text-gray-200 leading-relaxed">
                Building secure, scalable applications with modern web technologies.
                Specialized in MERN stack, cloud infrastructure, and cybersecurity.
              </p>

              {/* Hero Icons */}
              <div className="flex gap-6 py-4">
                {[
                  { icon: Code2, label: 'Full Stack', color: 'text-purple-400' },
                  { icon: Cloud, label: 'Cloud & DevOps', color: 'text-blue-400' },
                  { icon: Shield, label: 'Cybersecurity', color: 'text-cyan-400' },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 + idx * 0.2 }}
                    className="flex flex-col items-center gap-2"
                  >
                    <item.icon className={`w-8 h-8 ${item.color}`} />
                    <span className="text-xs text-gray-300">{item.label}</span>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 pt-4">
                <Link
                  href="/work"
                  className="glass-cosmic px-6 py-3 hover:bg-purple-600 text-white font-semibold rounded-lg transition-all inline-flex items-center gap-2 group"
                >
                  View My Work 
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/contact"
                  className="glass-cosmic px-6 py-3 hover:bg-blue-600 text-white font-semibold rounded-lg transition-all"
                >
                  Get In Touch
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="h-screen flex items-center justify-center px-4 snap-start">
        <div className="max-w-6xl mx-auto w-full">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-white">
            <span className="text-glow-white">Expertise</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: Code2, 
                title: 'Full Stack Development', 
                desc: 'Building end-to-end web applications with React, Node.js, Express, and MongoDB',
                skills: ['React', 'Node.js', 'MongoDB', 'Express']
              },
              { 
                icon: Cloud, 
                title: 'Cloud & DevOps', 
                desc: 'Deploying scalable infrastructure with AWS, Docker, Kubernetes, and CI/CD pipelines',
                skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD']
              },
              { 
                icon: Shield, 
                title: 'Security', 
                desc: 'Implementing secure coding practices and performing vulnerability assessments',
                skills: ['Burp Suite', 'Nmap', 'Wireshark', 'OWASP']
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="glass-cosmic p-8 rounded-xl hover:border-purple-500 transition-all group"
              >
                <item.icon className="w-14 h-14 text-purple-400 mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-semibold mb-4 text-white">{item.title}</h3>
                <p className="text-gray-200 mb-6 leading-relaxed">{item.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {item.skills.map((skill) => (
                    <span 
                      key={skill}
                      className="px-3 py-1 bg-purple-500/20 text-purple-200 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="h-screen flex items-center justify-center px-4 snap-start">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              <span className="text-glow-purple">Let&apos;s Build Something Amazing</span>
            </h2>
            <p className="text-xl text-gray-200 mb-12 max-w-2xl mx-auto">
              Ready to bring your ideas to life with cutting-edge technology and best practices.
            </p>
            <Link
              href="/contact"
              className="glass-cosmic px-10 py-5 hover:bg-purple-600 text-white text-lg font-semibold rounded-lg transition-all inline-flex items-center gap-3"
            >
              Start a Project <ArrowRight size={24} />
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}