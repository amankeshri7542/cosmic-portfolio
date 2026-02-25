'use client';

import { useState, useEffect } from 'react';

export default function ScrollProgress() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="fixed top-0 left-0 right-0 z-[101] h-[3px]">
            <div
                className="h-full transition-[width] duration-150 ease-out"
                style={{
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, #8b5cf6, #3b82f6, #22d3ee)',
                    boxShadow: '0 0 10px rgba(139, 92, 246, 0.6)',
                }}
            />
        </div>
    );
}
