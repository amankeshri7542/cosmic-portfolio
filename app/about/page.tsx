'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Cloud, Code2, Database, Cpu, Server, Globe, Shield } from 'lucide-react';

const skillCategories = [
  {
    title: 'Cloud & DevOps',
    icon: Cloud,
    color: 'text-cyan-400',
    borderColor: 'border-cyan-500/30',
    skills: [
      { name: 'AWS Lambda', icon: '⚡' },
      { name: 'EC2 / S3 / IAM', icon: '☁️' },
      { name: 'DynamoDB', icon: '🗄️' },
      { name: 'Docker', icon: '🐳' },
      { name: 'Kubernetes (K3s)', icon: '☸️' },
      { name: 'Terraform', icon: '🏗️' },
    ],
  },
  {
    title: 'Development',
    icon: Code2,
    color: 'text-purple-400',
    borderColor: 'border-purple-500/30',
    skills: [
      { name: 'Next.js', icon: '▲' },
      { name: 'React', icon: '⚛️' },
      { name: 'Node.js', icon: '🟢' },
      { name: 'Python', icon: '🐍' },
      { name: 'TypeScript', icon: '🔷' },
      { name: 'JavaScript', icon: '⚡' },
    ],
  },
  {
    title: 'AI & Data',
    icon: Database,
    color: 'text-amber-400',
    borderColor: 'border-amber-500/30',
    skills: [
      { name: 'OpenAI API', icon: '🤖' },
      { name: 'LangChain', icon: '🔗' },
      { name: 'MongoDB', icon: '🍃' },
      { name: 'PostgreSQL', icon: '🐘' },
      { name: 'Stable Diffusion', icon: '🎨' },
      { name: 'MoviePy', icon: '🎬' },
    ],
  },
];

const timeline = [
  {
    year: '2021 – 2025',
    title: 'B.E. Computer Science',
    institution: 'JSS Academy of Technical Education, Bangalore',
    type: 'education',
  },
  {
    year: 'Feb 2026',
    title: 'AWS Certified Solutions Architect – Associate',
    institution: 'Amazon Web Services',
    type: 'certification',
  },
  {
    year: 'October 2025',
    title: 'AWS Certified Cloud Practitioner',
    institution: 'Amazon Web Services',
    type: 'certification',
  },
  {
    year: 'March 2023',
    title: 'CODEATHON – 3rd Place',
    institution: 'JSSATE Bengaluru',
    type: 'achievement',
  },
];

export default function About() {
  return (
    <main className="relative z-10 pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold mb-12 text-white"
        >
          <span className="text-glow-white">About Me</span>
        </motion.h1>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          {/* Profile & Bio */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-6 mb-8">
              <div className="relative w-32 h-32 rounded-full overflow-hidden ring-4 ring-purple-500 glow-purple">
                <Image
                  src="/aman2.png"
                  alt="Aman Kumar"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Aman Kumar</h2>
                <p className="text-cyan-300 text-lg font-medium">Cloud & GenAI Engineer</p>
              </div>
            </div>

            <div className="glass-cosmic p-6 rounded-xl space-y-4 leading-relaxed">
              <p className="text-white/90 font-medium text-base md:text-lg">
                DevOps & Cloud Engineer with a passion for building AI-powered creative tools. I specialize in <span className="text-cyan-300 font-semibold">AWS Serverless architectures</span>, Infrastructure as Code (Terraform), and orchestrating <span className="text-purple-300 font-semibold">Multi-Modal AI systems</span>.
              </p>
              <p className="text-white/90 font-medium text-base md:text-lg">
                Experienced in deploying scalable MERN applications and managing production Linux environments. My focus is on engineering robust, secure, and scalable systems with clean, maintainable code.
              </p>
              <p className="text-white/90 font-medium text-base md:text-lg">
                Beyond coding, I&apos;m passionate about fitness and maintaining a healthy work-life balance. The discipline from the gym translates directly to my approach in software development.
              </p>
            </div>
          </motion.div>

          {/* Skills Grid */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {skillCategories.map((category, catIdx) => (
              <div key={category.title} className={`glass-cosmic p-6 rounded-xl border ${category.borderColor}`}>
                <div className="flex items-center gap-3 mb-4">
                  <category.icon className={`w-6 h-6 ${category.color}`} />
                  <h3 className="text-xl font-semibold text-white">{category.title}</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {category.skills.map((skill, idx) => (
                    <motion.div
                      key={skill.name}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + catIdx * 0.1 + idx * 0.05 }}
                      className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <span className="text-lg">{skill.icon}</span>
                      <span className="text-white/85 text-sm font-medium">{skill.name}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-3xl font-semibold text-white mb-8 text-center">
            <span className="text-glow-white">Journey</span>
          </h3>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-purple-500 via-blue-500 to-cyan-500"></div>

            <div className="space-y-12">
              {timeline.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.2 }}
                  className={`flex items-center gap-8 ${idx % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  <div className={`flex-1 ${idx % 2 === 0 ? 'text-right' : 'text-left'}`}>
                    <div className="glass-cosmic p-6 rounded-xl inline-block hover:border-purple-500/50 transition-all">
                      <span className="text-cyan-300 text-sm font-semibold">{item.year}</span>
                      <h4 className="text-xl font-semibold text-white mt-2">{item.title}</h4>
                      <p className="text-white/85 font-medium mt-1">{item.institution}</p>
                    </div>
                  </div>

                  <div className="relative z-10">
                    <div className="w-5 h-5 bg-purple-500 rounded-full ring-4 ring-purple-500/30 animate-pulse"></div>
                  </div>

                  <div className="flex-1"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}