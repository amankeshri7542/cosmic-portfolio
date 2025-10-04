'use client';

import { motion } from 'framer-motion';

export default function About() {
  return (
    <main className="relative z-10 pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-8 text-white">
            About Me
          </h1>

          <div className="glass-cosmic p-8 rounded-xl space-y-6 text-gray-300">
            <p className="text-lg leading-relaxed">
              I&apos;m a MERN Full Stack Developer specializing in building secure, scalable applications. 
              Currently pursuing B.E. in Computer Science at JSS Academy of Technical Education, Bangalore.
            </p>

            <div className="border-l-4 border-purple-500 pl-6">
              <h2 className="text-2xl font-semibold text-white mb-4">Technical Focus</h2>
              <p className="leading-relaxed">
                My expertise spans modern web development with React and Node.js, cloud infrastructure 
                deployment with AWS, and implementing security best practices. I&apos;m passionate about clean 
                architecture, performance optimization, and applying DevOps principles to create robust 
                applications.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div>
                <h3 className="text-xl font-semibold text-purple-400 mb-3">Education</h3>
                <p className="font-medium text-white">JSS Academy of Technical Education</p>
                <p className="text-gray-400">B.E. Computer Science (2021 - 2025)</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-purple-400 mb-3">Certifications</h3>
                <p className="font-medium text-white">AWS Certified Cloud Practitioner</p>
                <p className="text-gray-400">September 2025</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}