'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Code2, Cloud, Shield, Cpu, Database, Download } from 'lucide-react';
import Typewriter from 'typewriter-effect';

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
            <div className="relative w-40 h-40 md:w-56 md:h-56 mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full blur-3xl opacity-40 animate-pulse"></div>
              <div className="relative w-full h-full rounded-full overflow-hidden ring-4 ring-purple-500/50 glow-purple shadow-2xl">
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
                    'A developer who lives inside cloud ☁️',
                    'A Ram bhakt 🙏🏼',
                    'Closer to god',
                    'I live inside cloud 😎',
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

          {/* Tech Stack Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            {[
              {
                icon: Cloud,
                title: 'Cloud & DevOps',
                desc: 'AWS Serverless, Infrastructure as Code, and container orchestration for production systems.',
                skills: ['AWS Lambda', 'EC2', 'Docker', 'Kubernetes', 'Terraform']
              },
              {
                icon: Code2,
                title: 'Development',
                desc: 'Full-stack web development with modern frameworks and type-safe architectures.',
                skills: ['Next.js', 'React', 'Node.js', 'Python', 'TypeScript']
              },
              {
                icon: Database,
                title: 'AI & Data',
                desc: 'LLM integration, multi-modal AI orchestration, and scalable data solutions.',
                skills: ['OpenAI API', 'LangChain', 'MongoDB', 'PostgreSQL', 'DynamoDB']
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="glass-cosmic p-8 rounded-xl hover:border-purple-500/50 transition-all group"
              >
                <item.icon className="w-14 h-14 text-cyan-400 mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-semibold mb-4 text-white">{item.title}</h3>
                <p className="text-white/85 font-medium mb-6 leading-relaxed">{item.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {item.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-purple-500/20 text-purple-200 rounded-full text-sm font-medium border border-purple-500/20"
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