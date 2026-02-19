'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Download } from 'lucide-react';
import Image from 'next/image';
import { Great_Vibes } from 'next/font/google';
import html2canvas from 'html2canvas';

const greatVibes = Great_Vibes({ weight: '400', subsets: ['latin'] });

const STORAGE_KEY = 'cosmicWelcomeSeen';
const HOLD_DURATION_MS = 60_000; // 60 seconds

// Stage: input → gone (hidden while processing) → reveal
type Stage = 'input' | 'gone' | 'reveal' | 'hidden';

interface GenerateResult {
    meaning: string;
    imageUrl: string;
    isSpecial: boolean;
}

export default function WelcomePopup() {
    const [stage, setStage] = useState<Stage>('hidden');
    const [name, setName] = useState('');
    const [inputError, setInputError] = useState('');
    const [result, setResult] = useState<GenerateResult | null>(null);
    const apiResultRef = useRef<GenerateResult | null>(null);
    const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const apiDoneRef = useRef(false);
    const holdDoneRef = useRef(false);
    const captureRef = useRef<HTMLDivElement>(null);

    // Show popup on first visit
    useEffect(() => {
        if (!localStorage.getItem(STORAGE_KEY)) {
            const t = setTimeout(() => setStage('input'), 800);
            return () => clearTimeout(t);
        }
    }, []);

    const revealIfReady = useCallback(() => {
        if (apiDoneRef.current && holdDoneRef.current && apiResultRef.current) {
            setResult(apiResultRef.current);
            setStage('reveal');
        }
    }, []);

    const handleClose = useCallback(() => {
        if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
        localStorage.setItem(STORAGE_KEY, '1');
        setStage('hidden');
    }, []);

    const getLocation = (): Promise<string> =>
        new Promise((resolve) => {
            if (!navigator.geolocation) return resolve('Unknown');
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    try {
                        const res = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`
                        );
                        const data = await res.json();
                        const city = data.address?.city || data.address?.town || data.address?.village || '';
                        const country = data.address?.country || '';
                        resolve(city ? `${city}, ${country}` : country || 'Unknown');
                    } catch {
                        resolve('Unknown');
                    }
                },
                () => resolve('Unknown'),
                { timeout: 5000 }
            );
        });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = name.trim();
        if (trimmed.length < 2) {
            setInputError('Please enter your full name.');
            return;
        }

        // ✅ Popup disappears immediately — user browses freely
        setStage('gone');

        apiDoneRef.current = false;
        holdDoneRef.current = false;

        // 60-second hold timer — reveal only after this + API are both done
        holdTimerRef.current = setTimeout(() => {
            holdDoneRef.current = true;
            revealIfReady();
        }, HOLD_DURATION_MS);

        // Get location (non-blocking)
        const location = await getLocation();

        // Log visitor silently (fire and forget)
        fetch('/api/log-visitor', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: trimmed, location }),
        }).catch(() => { });

        // Generate image in background
        try {
            const res = await fetch('/api/generate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: trimmed, location }),
            });
            apiResultRef.current = res.ok
                ? await res.json()
                : { meaning: `${trimmed} — a name written in the stars.`, imageUrl: '/Ram.png', isSpecial: false };
        } catch {
            apiResultRef.current = {
                meaning: `${trimmed} — a name written in the stars.`,
                imageUrl: '/Ram.png',
                isSpecial: false,
            };
        }

        apiDoneRef.current = true;
        revealIfReady();
    };

    const handleDownload = async () => {
        if (!result?.imageUrl) return;
        const filename = `${name.trim().replace(/\s+/g, '-')}-cosmic.png`;

        if (result.isSpecial || result.imageUrl.startsWith('/')) {
            // Local static image (special cases: Ram.png, mom.png)
            const link = document.createElement('a');
            link.href = result.imageUrl;
            link.download = filename;
            link.click();
            return;
        }

        // Use html2canvas to capture the composite (landscape + CSS text overlay)
        if (captureRef.current) {
            try {
                const canvas = await html2canvas(captureRef.current, {
                    useCORS: true,
                    allowTaint: false,
                    scale: 2, // 2x resolution for crisp download
                    backgroundColor: null,
                });
                const url = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                link.click();
            } catch {
                // Fallback: open image in new tab
                window.open(result.imageUrl, '_blank');
            }
        }
    };

    // Nothing rendered while in 'hidden' or 'gone' stages
    if (stage === 'hidden' || stage === 'gone') return null;

    return (
        <AnimatePresence>
            <motion.div
                key="backdrop"
                className="fixed inset-0 z-[200] flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ backdropFilter: 'blur(8px)', background: 'rgba(5, 5, 15, 0.75)' }}
            >
                <motion.div
                    key="card"
                    className="relative w-full max-w-md rounded-2xl overflow-hidden"
                    style={{
                        background: 'rgba(10, 10, 25, 0.92)',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        boxShadow: '0 0 60px rgba(139, 92, 246, 0.25), 0 4px 40px rgba(0,0,0,0.6)',
                    }}
                    initial={{ opacity: 0, scale: 0.88, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.88, y: 30 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                    {/* Top gradient line */}
                    <div className="absolute top-0 left-0 right-0 h-px" style={{
                        background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.8), rgba(34,211,238,0.6), transparent)',
                    }} />

                    {/* Close button */}
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 z-10 p-1.5 rounded-full transition-all"
                        style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)' }}
                        aria-label="Close"
                    >
                        <X size={16} className="text-purple-300 hover:text-white transition-colors" />
                    </button>

                    {/* ── STAGE: INPUT ── */}
                    {stage === 'input' && (
                        <div className="p-8">
                            <div className="text-center mb-8">
                                <motion.div
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                    className="text-5xl mb-4"
                                >
                                    🌌
                                </motion.div>
                                <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-cinzel)' }}>
                                    A Cosmic Gift For You
                                </h2>
                                <p className="text-sm text-purple-200/80 leading-relaxed">
                                    Enter your name, wait{' '}
                                    <span className="text-cyan-300 font-semibold">1–2 minutes</span> and receive a
                                    one-of-a-kind AI painting — the spiritual essence of your name, painted by the cosmos. ✨
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => { setName(e.target.value); setInputError(''); }}
                                        placeholder="Enter your full name…"
                                        maxLength={80}
                                        className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none transition-all placeholder:text-white/30"
                                        style={{
                                            background: 'rgba(139,92,246,0.1)',
                                            border: inputError ? '1px solid rgba(239,68,68,0.7)' : '1px solid rgba(139,92,246,0.35)',
                                        }}
                                        autoFocus
                                    />
                                    {inputError && <p className="text-red-400 text-xs mt-1.5 pl-1">{inputError}</p>}
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-3 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(139,92,246,0.9), rgba(34,211,238,0.7))',
                                        boxShadow: '0 4px 20px rgba(139,92,246,0.4)',
                                    }}
                                >
                                    <Sparkles size={16} />
                                    Unlock My Cosmic Portrait 🌌
                                </button>
                            </form>
                            <p className="text-center text-white/30 text-xs mt-5">
                                One unique portrait per visit · Powered by AI
                            </p>
                        </div>
                    )}

                    {/* ── STAGE: REVEAL ── */}
                    {stage === 'reveal' && result && (
                        <div>
                            <motion.div
                                ref={captureRef}
                                className="relative w-full aspect-square overflow-hidden"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 1 }}
                            >
                                {result.imageUrl.startsWith('/') ? (
                                    <Image
                                        src={result.imageUrl}
                                        alt="Spiritual landscape"
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 448px) 100vw, 448px"
                                    />
                                ) : (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={result.imageUrl} alt="Spiritual landscape" className="w-full h-full object-cover" crossOrigin="anonymous" />
                                )}

                                {/* CSS Text Overlay — name in calligraphy */}
                                {!result.isSpecial && (
                                    <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.1)' }}>
                                        <motion.h2
                                            className={greatVibes.className}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                            style={{
                                                fontSize: 'clamp(3.5rem, 12vw, 6rem)',
                                                color: 'rgba(255,255,255,0.92)',
                                                textShadow: '0 4px 8px rgba(0,0,0,0.7), 0 2px 4px rgba(0,0,0,0.5)',
                                                letterSpacing: '0.05em',
                                                lineHeight: 1,
                                            }}
                                        >
                                            {name.trim().split(/\s+/)[0]}
                                        </motion.h2>
                                    </div>
                                )}

                                <div className="absolute inset-0" style={{
                                    background: 'linear-gradient(to bottom, transparent 60%, rgba(10,10,25,0.95) 100%)',
                                }} />
                                <div className="absolute top-0 left-0 right-0 h-px" style={{
                                    background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.8), rgba(34,211,238,0.6), transparent)',
                                }} />
                            </motion.div>

                            <motion.div
                                className="p-6"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                            >
                                <h3 className="text-lg font-bold text-white mb-3" style={{ fontFamily: 'var(--font-cinzel)' }}>
                                    ✨ {name.trim().split(' ')[0]}, this is for you
                                </h3>
                                <p className="text-white/80 text-sm leading-relaxed mb-6">{result.meaning}</p>

                                <div className="flex gap-3">
                                    <button
                                        onClick={handleDownload}
                                        className="flex-1 py-2.5 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
                                        style={{
                                            background: 'linear-gradient(135deg, rgba(139,92,246,0.85), rgba(34,211,238,0.65))',
                                            boxShadow: '0 4px 16px rgba(139,92,246,0.35)',
                                        }}
                                    >
                                        <Download size={15} /> Download
                                    </button>
                                    <button
                                        onClick={handleClose}
                                        className="flex-1 py-2.5 rounded-xl font-medium text-white/70 text-sm transition-all hover:text-white"
                                        style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)' }}
                                    >
                                        Close
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence >
    );
}
