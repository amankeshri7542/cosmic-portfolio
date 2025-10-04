'use client';

import { motion } from 'framer-motion';

const blogs = [
  {
    title: 'Building Secure APIs with Node.js',
    date: 'Coming Soon',
    excerpt: 'Best practices for implementing authentication and authorization in RESTful APIs',
  },
  {
    title: 'AWS Lambda vs EC2: Choosing the Right Service',
    date: 'Coming Soon',
    excerpt: 'Understanding when to use serverless functions versus traditional server instances',
  },
  {
    title: 'Docker in Development: A Practical Guide',
    date: 'Coming Soon',
    excerpt: 'Containerizing your development environment for consistency and portability',
  },
];

export default function Blogs() {
  return (
    <main className="relative z-10 pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold mb-12 text-white"
        >
          Blog
        </motion.h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog, idx) => (
            <motion.article
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-cosmic p-6 rounded-xl hover:border-purple-500 transition-all cursor-pointer"
            >
              <h2 className="text-xl font-semibold text-white mb-3">{blog.title}</h2>
              <p className="text-sm text-purple-400 mb-4">{blog.date}</p>
              <p className="text-gray-400">{blog.excerpt}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </main>
  );
}