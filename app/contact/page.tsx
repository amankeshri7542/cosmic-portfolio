'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { Mail, Github, Linkedin, Send, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface FormData {
  name: string;
  email: string;
  message: string;
}

export default function Contact() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const onSubmit = async (data: FormData) => {
    setStatus('loading');
    setErrorMessage('');
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus('success');
        reset();
        setTimeout(() => setStatus('idle'), 5000);
      } else {
        setStatus('error');
        setErrorMessage(result.error || 'Failed to send message');
        setTimeout(() => setStatus('idle'), 5000);
      }
    } catch {
      setStatus('error');
      setErrorMessage('Network error. Please check your connection.');
      setTimeout(() => setStatus('idle'), 5000);
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
                <a 
                  href="mailto:amankeshri7479@gmail.com" 
                  className="flex items-center gap-3 text-gray-300 hover:text-purple-400 transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  amankeshri7479@gmail.com
                </a>
                <a 
                  href="tel:+919297513707" 
                  className="flex items-center gap-3 text-gray-300 hover:text-purple-400 transition-colors"
                >
                  <span className="w-5 h-5 flex items-center justify-center">📞</span>
                  +91-9297513707
                </a>
                <a 
                  href="https://github.com/yourusername" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-3 text-gray-300 hover:text-purple-400 transition-colors"
                >
                  <Github className="w-5 h-5" />
                  GitHub
                </a>
                <a 
                  href="https://linkedin.com/in/yourusername" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-3 text-gray-300 hover:text-purple-400 transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                  LinkedIn
                </a>
              </div>
            </div>

            <div className="glass-cosmic p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-white mb-2">Available For</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center gap-2">
                  <span className="text-purple-400">▹</span> Freelance Projects
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-400">▹</span> Full-time Opportunities
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-400">▹</span> Technical Consultations
                </li>
              </ul>
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
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Name *
                </label>
                <input
                  {...register('name', { 
                    required: 'Name is required',
                    minLength: { value: 2, message: 'Name must be at least 2 characters' }
                  })}
                  type="text"
                  id="name"
                  placeholder="Your name"
                  className="w-full px-4 py-2 bg-black/30 border border-purple-500/30 rounded-lg text-white placeholder:text-gray-500 focus:border-purple-500 focus:outline-none transition-colors"
                />
                {errors.name && (
                  <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: { 
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 
                      message: 'Invalid email address' 
                    }
                  })}
                  type="email"
                  id="email"
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-2 bg-black/30 border border-purple-500/30 rounded-lg text-white placeholder:text-gray-500 focus:border-purple-500 focus:outline-none transition-colors"
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                  Message *
                </label>
                <textarea
                  {...register('message', { 
                    required: 'Message is required',
                    minLength: { value: 10, message: 'Message must be at least 10 characters' }
                  })}
                  id="message"
                  rows={5}
                  placeholder="Your message..."
                  className="w-full px-4 py-2 bg-black/30 border border-purple-500/30 rounded-lg text-white placeholder:text-gray-500 focus:border-purple-500 focus:outline-none resize-none transition-colors"
                />
                {errors.message && (
                  <p className="text-red-400 text-sm mt-1">{errors.message.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 disabled:cursor-not-allowed text-white rounded-lg transition-colors inline-flex items-center justify-center gap-2"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message <Send size={18} />
                  </>
                )}
              </button>

              <AnimatePresence>
                {status === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-green-400 bg-green-400/10 p-3 rounded-lg"
                  >
                    <CheckCircle size={20} />
                    <span>Message sent successfully!</span>
                  </motion.div>
                )}
                {status === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-lg"
                  >
                    <XCircle size={20} />
                    <span>{errorMessage || 'Failed to send message'}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </motion.div>
        </div>
      </div>
    </main>
  );
}