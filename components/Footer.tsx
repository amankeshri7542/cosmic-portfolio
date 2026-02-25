import Link from 'next/link';
import { Github, Linkedin, Mail, Heart } from 'lucide-react';

const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Work', href: '/work' },
    { name: 'Blogs', href: '/blogs' },
    { name: 'Contact', href: '/contact' },
];

const socialLinks = [
    { icon: Github, href: 'https://github.com/amankeshri7542', label: 'GitHub' },
    { icon: Linkedin, href: 'https://www.linkedin.com/in/aman-kumar-keshri', label: 'LinkedIn' },
    { icon: Mail, href: 'mailto:amankeshri7479@gmail.com', label: 'Email' },
];

export default function Footer() {
    return (
        <footer
            className="relative z-10 border-t border-purple-500/25"
            style={{
                background: 'rgba(2, 2, 8, 0.95)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
            }}
        >
            <div className="max-w-6xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    {/* Brand */}
                    <div className="space-y-3">
                        <h3
                            className="text-xl font-bold text-white"
                            style={{ fontFamily: 'var(--font-cinzel)' }}
                        >
                            Aman Kumar
                        </h3>
                        <p className="text-white/80 text-sm leading-relaxed font-medium">
                            Cloud &amp; GenAI Engineer building AI-powered tools and scalable
                            serverless infrastructure.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                            Navigation
                        </h4>
                        <nav className="flex flex-col gap-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="text-white/75 hover:text-cyan-300 text-sm font-medium transition-colors w-fit"
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Social */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                            Connect
                        </h4>
                        <div className="flex gap-3">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={social.label}
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-purple-500/20 border border-purple-500/30 text-white/80 hover:text-cyan-300 hover:border-cyan-400/50 hover:bg-purple-500/30 transition-all"
                                >
                                    <social.icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Divider + Copyright */}
                <div className="border-t border-purple-500/20 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
                    <p className="text-white/60 text-xs font-medium">
                        © {new Date().getFullYear()} Aman Kumar. All rights reserved.
                    </p>
                    <p className="text-white/60 text-xs font-medium flex items-center gap-1">
                        Made with <Heart size={12} className="text-red-400" /> and cosmic energy
                    </p>
                </div>
            </div>
        </footer>
    );
}
