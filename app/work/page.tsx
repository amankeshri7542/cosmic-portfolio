'use client';

import { motion } from 'framer-motion';
import { ExternalLink, Github } from 'lucide-react';
import Image from 'next/image';

const experience = {
  title: 'Intern — Cybersecurity, Cloud Computing & Web Development',
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
    title: 'AI-Powered Alexa Assistant',
    description:
      'A serverless voice assistant integrating OpenAI GPT-4 for real-time, intelligent conversations. Features session persistence via DynamoDB.',
    tech: ['AWS Lambda', 'Node.js', 'OpenAI API', 'DynamoDB'],
    liveUrl: 'https://tinyurl.com/bddevjbv',
    githubUrl: '',
    image: '/alexaAI.png',
  },
  {
    title: 'Mythos AI Studio',
    description:
      'An AI-native storytelling platform that converts prompts into cinematic narrated videos using multi-agent orchestration.',
    tech: ['Python', 'Streamlit', 'Stable Diffusion', 'MoviePy'],
    liveUrl: 'https://ai-img-uw5tcdkkkrpzafnnaiq8am.streamlit.app',
    githubUrl: '',
    image: '/mythos.jpeg',
  },
  {
    title: 'Foxpop.in',
    description:
      'A production-grade e-commerce platform for Makhana sales with secure payments and CI/CD pipelines.',
    tech: ['MERN Stack', 'AWS EC2', 'Nginx', 'Razorpay'],
    liveUrl: 'https://foxpop.in',
    githubUrl: '',
    image: '/foxpop.png',
  },
  {
    title: 'Shiv Cement Store (Business ERP)',
    description:
      'A custom inventory and business management system designed for high-volume retail, featuring Role-Based Access Control (RBAC).',
    tech: ['Next.js', 'MongoDB', 'Tailwind CSS'],
    liveUrl: 'https://shivcementstore.com',
    githubUrl: '',
    image: '/cementstore.png',
  },
  {
    title: 'Prompt Enhancer',
    description:
      'A GenAI utility tool designed to optimize and refine LLM prompts for better output quality.',
    tech: ['Next.js', 'OpenAI API', 'Vercel'],
    liveUrl: 'https://prompt-inhancer.vercel.app',
    githubUrl: '',
    image: '/prompt.png',
  },
  {
    title: 'Serverless Notification System',
    description:
      'A cost-optimized (<$1/month) notification architecture sending Emails and SMS. Orchestrated using AWS Step Functions to handle state and logic.',
    tech: ['AWS Lambda', 'API Gateway', 'SNS', 'SES', 'Python'],
    liveUrl: '',
    githubUrl: '',
    image: '/aws-serverless.png',
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
          <h2 className="text-3xl font-bold mb-8 text-cyan-300">Experience</h2>
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
                <h3 className="text-2xl font-semibold text-white mb-2">
                  {experience.title}
                </h3>
                <p className="text-cyan-300 font-semibold">{experience.company}</p>
                <p className="text-[#C0C0C0] text-sm font-medium">{experience.period}</p>
              </div>
            </div>
            <ul className="space-y-3">
              {experience.points.map((point, idx) => (
                <li
                  key={idx}
                  className="text-white/90 font-medium flex items-start"
                >
                  <span className="text-cyan-400 mr-3 mt-1">▹</span>
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
          <h2 className="text-3xl font-bold mb-8 text-cyan-300">Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects.map((project, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="glass-cosmic rounded-xl overflow-hidden hover:border-purple-500/50 transition-all group flex flex-col"
              >
                {/* Project Image */}
                <div className="relative h-48 bg-[rgba(10,10,20,0.8)] overflow-hidden">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,10,20,0.9)] via-transparent to-transparent" />
                </div>

                {/* Project Details */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-white">
                      {project.title}
                    </h3>
                  </div>

                  <p className="text-white/85 font-medium leading-relaxed mb-4 text-sm flex-1">
                    {project.description}
                  </p>

                  {/* Tech Stack */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tech.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-purple-500/20 text-purple-200 rounded-full text-xs font-semibold border border-purple-500/25"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 mt-auto">
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 font-semibold rounded-lg transition-all border border-cyan-500/30 hover:border-cyan-400 text-sm"
                      >
                        <ExternalLink size={16} />
                        Live Demo
                      </a>
                    )}
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white/90 font-semibold rounded-lg transition-all border border-white/10 hover:border-white/20 text-sm"
                      >
                        <Github size={16} />
                        Code
                      </a>
                    )}
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