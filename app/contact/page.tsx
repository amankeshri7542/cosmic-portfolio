'use client';

import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { Mail, Github, Linkedin, Send } from 'lucide-react';

interface FormData {
  name: string;
  email: string;
  message: string;
}

export default function Contact() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const onSubmit = async (data: FormData) => {
    setStatus('loading');
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setStatus('success');
        reset();
        setTimeout(() => setStatus('idle'), 5000);
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <main className="relative z-10 pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold mb-8 text-white"
        >
          Get In Touch
        </motion.h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="glass-cosmic p-6 rounded-xl">
              <h2 className="text-2xl font-semibold text-white mb-4">Contact Information</h2>
              <div className="space-y-4">
                <a href="mailto:amankeshri7479@gmail.com" className="flex items-center gap-3 text-gray-300 hover:text-purple-400 transition-colors">
                  <Mail className="w-5 h-5" />
                  amankeshri7479@gmail.com
                </a>
                <a href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-300 hover:text-purple-400 transition-colors">
                  <Github className="w-5 h-5" />
                  GitHub
                </a>
                <a href="https://linkedin.com/in/yourusername" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-300 hover:text-purple-400 transition-colors">
                  <Linkedin className="w-5 h-5" />
                  LinkedIn
                </a>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <form onSubmit={handleSubmit(onSubmit)} className="glass-cosmic p-6 rounded-xl space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                <input
                  {...register('name', { required: 'Name is required' })}
                  type="text"
                  id="name"
                  className="w-full px-4 py-2 bg-black/30 border border-purple-500/30 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                />
                {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' }
                  })}
                  type="email"
                  id="email"
                  className="w-full px-4 py-2 bg-black/30 border border-purple-500/30 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                />
                {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                <textarea
                  {...register('message', { required: 'Message is required' })}
                  id="message"
                  rows={5}
                  className="w-full px-4 py-2 bg-black/30 border border-purple-500/30 rounded-lg text-white focus:border-purple-500 focus:outline-none resize-none"
                />
                {errors.message && <p className="text-red-400 text-sm mt-1">{errors.message.message}</p>}
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white rounded-lg transition-colors inline-flex items-center justify-center gap-2"
              >
                {status === 'loading' ? 'Sending...' : 'Send Message'} <Send size={18} />
              </button>

              {status === 'success' && (
                <p className="text-green-400 text-center">Message sent successfully!</p>
              )}
              {status === 'error' && (
                <p className="text-red-400 text-center">Failed to send message. Please try again.</p>
              )}
            </form>
          </motion.div>
        </div>
      </div>
    </main>
  );
}