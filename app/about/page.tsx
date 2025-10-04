'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

const skills = [
  { name: 'JavaScript', icon: '⚡' },
  { name: 'React.js', icon: '⚛️' },
  { name: 'Node.js', icon: '🟢' },
  { name: 'MongoDB', icon: '🍃' },
  { name: 'AWS', icon: '☁️' },
  { name: 'Docker', icon: '🐳' },
  { name: 'Kubernetes', icon: '☸️' },
  { name: 'Python', icon: '🐍' },
];

const timeline = [
  {
    year: '2021 - 2025',
    title: 'B.E. Computer Science',
    institution: 'JSS Academy of Technical Education, Bangalore',
    type: 'education'
  },
  {
    year: 'October 2025',
    title: 'AWS Certified Cloud Practitioner',
    institution: 'Amazon Web Services',
    type: 'certification'
  },
  {
    year: 'March 2023',
    title: 'CODEATHON - 3rd Place',
    institution: 'JSSATE Bengaluru',
    type: 'achievement'
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
                <p className="text-purple-300 text-lg">Full Stack Developer</p>
              </div>
            </div>

            <div className="glass-cosmic p-6 rounded-xl space-y-4 text-gray-200 leading-relaxed">
              <p>
                From my first line of code, I was fascinated by the power of technology to solve real-world problems. This curiosity led me to pursue a degree in Computer Science and dive deep into the world of full-stack development.
              </p>
              <p>
                My focus is not just on building features, but on engineering robust, secure, and scalable systems. I believe in writing clean, maintainable code, leveraging automation for robust deployments (CI/CD), and prioritizing security at every stage of the development lifecycle.
              </p>
              <p>
                Beyond coding, I&apos;m passionate about fitness and maintaining a healthy work-life balance. The discipline from the gym translates directly to my approach in software development.
              </p>
            </div>
          </motion.div>

          {/* Skills Grid */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="glass-cosmic p-6 rounded-xl">
              <h3 className="text-2xl font-semibold text-white mb-6">Skills & Technologies</h3>
              <div className="grid grid-cols-2 gap-4">
                {skills.map((skill, idx) => (
                  <motion.div
                    key={skill.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + idx * 0.1 }}
                    className="glass-cosmic p-4 rounded-lg hover:border-purple-500 transition-all group cursor-pointer"
                  >
                    <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                      {skill.icon}
                    </div>
                    <span className="text-white font-medium">{skill.name}</span>
                  </motion.div>
                ))}
              </div>
            </div>
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
                    <div className="glass-cosmic p-6 rounded-xl inline-block hover:border-purple-500 transition-all">
                      <span className="text-purple-300 text-sm font-semibold">{item.year}</span>
                      <h4 className="text-xl font-semibold text-white mt-2">{item.title}</h4>
                      <p className="text-gray-200 mt-1">{item.institution}</p>
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