'use client';

import { motion } from 'framer-motion';
import { ExternalLink, Github } from 'lucide-react';
import Image from 'next/image';
import { useTilt } from '@/hooks/useTilt';
import React from 'react';

const experiences = [
    {
        title: 'Contract Developer — Full-Stack Business Platform',
        company: 'Shiv Cement Store — Top 5 Cement Seller in Bihar',
        period: 'Aug 2025 – Mar 2026',
        logo: '/shivtraders.png',
        points: [
            'Built a full-stack business platform for a retail cement store — Next.js 14 customer website, Expo React Native admin/staff mobile app, and Express 5 REST API deployed on Render + Vercel',
            'Implemented RAG-powered AI chatbot using OpenAI GPT-4o, Pinecone vector search, and Upstash Redis caching — supports Hindi, English, and Hinglish with live product pricing via OpenAI function calling',
            'Engineered a tamper-proof GPS + rotating QR code attendance system with Haversine geofence validation, bcrypt-secured 4-digit PIN auth, and soft-delete staff management',
            'Architected multi-role JWT authentication (admin 7-day / staff 1-day), AWS S3 presigned uploads, rate limiting, NoSQL injection protection, and optimistic UI updates across mobile and web',
            'Tech: Next.js 14 · Express 5 · MongoDB Atlas · React Native (Expo) · OpenAI GPT-4o · Pinecone · Upstash Redis · AWS S3 · Vercel · Render',
        ],
        liveUrl: 'https://shiv-cement-app.vercel.app/',
    },
    {
        title: 'Intern — Cybersecurity, Cloud Computing & Web Development',
        company: 'Technosys IT Management Private Limited',
        period: 'Feb 2025 – Aug 2025',
        logo: '/internship.png',
        points: [
            'Deployed AWS cloud apps (EC2, S3, IAM, Lambda), boosting uptime by 15%',
            'Identified and remediated 20+ security flaws using Nmap, Burp Suite, and Wireshark',
            'Built MERN modules with secure coding, cutting load times by 25%',
        ],
    },
];

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
        title: 'MedScan AI',
        description:
            'An intelligent healthcare companion that instantly identifies medications from images or text. Powered by Gemini Vision AI and AWS, it provides easy-to-read summaries of uses, dosages, and critical drug interactions. Also available as an APK.',
        tech: ['Gemini Vision AI', 'AWS', 'Next.js', 'React Native'],
        liveUrl: 'https://med-scan-ai-web.vercel.app/',
        githubUrl: '',
        image: '/image.png',
    },
    {
        title: 'URL Shortener',
        description:
            'A fast, minimal URL shortener built with Next.js. Paste any long URL and get a clean, shareable short link instantly.',
        tech: ['Next.js', 'Vercel', 'TypeScript'],
        liveUrl: 'https://url-shortner-woad-tau.vercel.app',
        githubUrl: '',
        image: '/url.png',
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

function ProjectCard({ project, idx }: { project: typeof projects[0]; idx: number }) {
    const { ref, style, onMouseMove, onMouseLeave } = useTilt(6);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
        >
            <div
                ref={ref}
                onMouseMove={onMouseMove}
                onMouseLeave={onMouseLeave}
                style={style}
                className="glass-cosmic rounded-xl overflow-hidden transition-all group flex flex-col h-full border border-purple-500/15 hover:border-purple-500/60 hover:shadow-[0_0_35px_rgba(139,92,246,0.35)]"
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
            </div>
        </motion.div>
    );
}

export default function WorkContent() {
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
                    <div className="space-y-8">
                        {experiences.map((exp, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.15 }}
                                className="glass-cosmic p-8 rounded-xl"
                            >
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="relative w-16 h-16 flex-shrink-0">
                                        <Image
                                            src={exp.logo}
                                            alt={exp.company}
                                            fill
                                            className="object-cover rounded-lg"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-semibold text-white mb-2">
                                            {exp.title}
                                        </h3>
                                        <p className="text-cyan-300 font-semibold">{exp.company}</p>
                                        <p className="text-[#C0C0C0] text-sm font-medium">{exp.period}</p>
                                    </div>
                                </div>
                                <ul className="space-y-3">
                                    {exp.points.map((point, idx) => {
                                        const isTechLine = point.startsWith('Tech:');
                                        return (
                                            <li
                                                key={idx}
                                                className={`font-medium flex items-start ${isTechLine ? 'text-cyan-300/90 mt-2' : 'text-white/90'}`}
                                            >
                                                <span className={`mr-3 mt-1 ${isTechLine ? 'text-saffron' : 'text-cyan-400'}`}>{isTechLine ? '⚙' : '▹'}</span>
                                                <span>{isTechLine ? (
                                                    <span className="text-sm">{point}</span>
                                                ) : point}</span>
                                            </li>
                                        );
                                    })}
                                </ul>
                                {exp.liveUrl && (
                                    <a
                                        href={exp.liveUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 mt-6 px-4 py-2 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 font-semibold rounded-lg transition-all border border-cyan-500/30 hover:border-cyan-400 text-sm"
                                    >
                                        <ExternalLink size={16} />
                                        View Live
                                    </a>
                                )}
                            </motion.div>
                        ))}
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
                            <ProjectCard key={idx} project={project} idx={idx} />
                        ))}
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
