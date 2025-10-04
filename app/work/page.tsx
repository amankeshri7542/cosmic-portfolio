'use client';

import { motion } from 'framer-motion';
import { Briefcase, Code2, ExternalLink, Github } from 'lucide-react';
import Image from 'next/image';

const experience = {
  title: 'Intern — Cybersecurity, Cloud Computing, and Web Development',
  company: 'Technosys IT Management Private Limited',
  period: 'Feb 2025 – Aug 2025',
  points: [
    'Deployed AWS cloud apps (EC2, S3, IAM, Lambda), boosting uptime by 15%',
    'Identified and remediated 20+ security flaws using Nmap, Burp Suite, and Wireshark',
    'Built MERN modules with secure coding, cutting load times by 25%',
  ],
};

const projects = [
  {
    title: 'Foxpop.in',
    period: 'Jan 2025 – Present',
    description: 'A complete e-commerce platform featuring product catalog, shopping cart, secure checkout, and payment gateway integration. Built with focus on user experience and transaction security.',
    image: '/foxpop.png',
    tech: ['React.js', 'Node.js', 'MongoDB', 'Stripe'],
    points: [
      'Integrated payment gateway and optimized database queries, improving transaction speed by 25%',
      'Implemented admin panel for managing products and orders, reducing manual overhead by 40%',
    ],
    liveUrl: 'https://www.foxpop.in',
    githubUrl: '#',
  },
  {
    title: 'Shiv Traders',
    period: 'Nov 2024',
    description: 'Online inventory and inquiry platform for a local cement business. Features real-time stock updates, customer inquiry management, and responsive design for mobile accessibility.',
    image: '/shivtraders.png',
    tech: ['React.js', 'Express.js', 'MongoDB', 'TailwindCSS'],
    points: [
      'Developed secure Express.js APIs with MongoDB integration for stock tracking',
      'Implemented admin dashboard for CRUD operations, improving backend efficiency by 50%',
    ],
    liveUrl: 'https://www.shivcementstore.com',
    githubUrl: '#',
  },
  {
    title: 'AI-Powered Alexa Assistant',
    period: 'Aug 2025',
    description: 'Voice-activated AI assistant integrated with OpenAI GPT-4. Deployed as serverless function on AWS Lambda with optimized response handling and cost management.',
    image: '/alexa.png',
    tech: ['Node.js', 'AWS Lambda', 'OpenAI GPT-4', 'Alexa Skills Kit'],
    points: [
      'Achieved 95%+ response accuracy with optimized interaction model',
      'Implemented response limiting (200 tokens) to manage API cost, supporting 150+ queries/month',
    ],
    liveUrl: '#',
    githubUrl: '#',
  },
];

export default function Work() {
  return (
    <main className="relative z-10 pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold mb-12 text-white text-glow-white"
        >
          Work & Projects
        </motion.h1>

        {/* Experience Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold mb-8 text-purple-400">Experience</h2>
          <div className="glass-cosmic p-8 rounded-xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="relative w-16 h-16 flex-shrink-0">
                <Image 
                  src="/internship.png" 
                  alt="Technosys" 
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-semibold text-white mb-2">{experience.title}</h3>
                <p className="text-purple-400 font-medium">{experience.company}</p>
                <p className="text-gray-400 text-sm">{experience.period}</p>
              </div>
            </div>
            <ul className="space-y-3">
              {experience.points.map((point, idx) => (
                <li key={idx} className="text-gray-300 flex items-start">
                  <span className="text-purple-400 mr-3 mt-1">▹</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Projects Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-3xl font-bold mb-8 text-purple-400">Projects</h2>
          <div className="space-y-8">
            {projects.map((project, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="glass-cosmic p-8 rounded-xl hover:border-purple-500 transition-all group"
              >
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Project Image */}
                  <div className="relative h-48 md:h-full rounded-lg overflow-hidden">
                    <Image 
                      src={project.image} 
                      alt={project.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Project Details */}
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-2xl font-semibold text-white">{project.title}</h3>
                        <div className="flex gap-3">
                          {project.liveUrl !== '#' && (
                            <a
                              href={project.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-400 hover:text-purple-300 transition-colors"
                              title="Live Demo"
                            >
                              <ExternalLink size={20} />
                            </a>
                          )}
                          {project.githubUrl !== '#' && (
                            <a
                              href={project.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-400 hover:text-purple-300 transition-colors"
                              title="View Code"
                            >
                              <Github size={20} />
                            </a>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-400 text-sm mb-4">{project.period}</p>
                      <p className="text-gray-300 leading-relaxed">{project.description}</p>
                    </div>

                    {/* Tech Stack */}
                    <div className="flex flex-wrap gap-2">
                      {project.tech.map((tech) => (
                        <span 
                          key={tech}
                          className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium border border-purple-500/30"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    {/* Key Points */}
                    <ul className="space-y-2">
                      {project.points.map((point, pidx) => (
                        <li key={pidx} className="text-gray-300 flex items-start text-sm">
                          <span className="text-blue-400 mr-2 mt-1">▹</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </main>
  );
}