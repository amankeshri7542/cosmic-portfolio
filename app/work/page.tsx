'use client';

import { motion } from 'framer-motion';
import { Briefcase, Code2 } from 'lucide-react';

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
    description: 'E-commerce platform with product catalog, cart, and checkout features',
    points: [
      'Developed using React.js, Node.js, and MongoDB',
      'Integrated payment gateway and optimized database queries, improving transaction speed by 25%',
      'Implemented admin panel for managing products and orders, reducing manual overhead by 40%',
    ],
  },
  {
    title: 'Shiv Traders',
    period: 'Nov 2024',
    description: 'Online inventory and inquiry platform for cement business',
    points: [
      'Built with MERN stack and responsive React.js frontend with TailwindCSS',
      'Developed secure Express.js APIs with MongoDB integration',
      'Implemented admin dashboard for CRUD operations, improving backend efficiency by 50%',
    ],
  },
  {
    title: 'AI-Powered Alexa Assistant',
    period: 'Aug 2025',
    description: 'Alexa Skill integrated with OpenAI GPT-4',
    points: [
      'Integrated via AWS Lambda for real-time conversational responses',
      'Achieved 95%+ response accuracy',
      'Implemented response limiting (200 tokens) to manage API cost',
    ],
  },
];

export default function Work() {
  return (
    <main className="relative z-10 pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold mb-12 text-white"
        >
          Work Experience
        </motion.h1>

        {/* Experience Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <div className="glass-cosmic p-8 rounded-xl">
            <div className="flex items-start gap-4 mb-4">
              <Briefcase className="w-8 h-8 text-purple-400 mt-1" />
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-white mb-2">{experience.title}</h2>
                <p className="text-purple-400 font-medium">{experience.company}</p>
                <p className="text-gray-400 text-sm">{experience.period}</p>
              </div>
            </div>
            <ul className="space-y-2 ml-12">
              {experience.points.map((point, idx) => (
                <li key={idx} className="text-gray-300 flex items-start">
                  <span className="text-purple-400 mr-2">▹</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Projects Section */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl md:text-4xl font-bold mb-8 text-white"
        >
          Projects
        </motion.h2>

        <div className="space-y-8">
          {projects.map((project, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + idx * 0.1 }}
              className="glass-cosmic p-8 rounded-xl"
            >
              <div className="flex items-start gap-4 mb-4">
                <Code2 className="w-8 h-8 text-blue-400 mt-1" />
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold text-white mb-2">{project.title}</h3>
                  <p className="text-gray-400 text-sm mb-2">{project.period}</p>
                  <p className="text-gray-300 mb-4">{project.description}</p>
                </div>
              </div>
              <ul className="space-y-2 ml-12">
                {project.points.map((point, pidx) => (
                  <li key={pidx} className="text-gray-300 flex items-start">
                    <span className="text-blue-400 mr-2">▹</span>
                    {point}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}