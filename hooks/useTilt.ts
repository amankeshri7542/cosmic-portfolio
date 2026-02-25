import { useRef, useState, useCallback } from 'react';

interface TiltStyle {
  transform: string;
  transition: string;
}

export function useTilt(maxTilt: number = 8) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<TiltStyle>({
    transform: 'perspective(800px) rotateX(0deg) rotateY(0deg)',
    transition: 'transform 0.1s ease-out',
  });

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateY = ((x - centerX) / centerX) * maxTilt;
      const rotateX = ((centerY - y) / centerY) * maxTilt;

      setStyle({
        transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
        transition: 'transform 0.1s ease-out',
      });
    },
    [maxTilt]
  );

  const onMouseLeave = useCallback(() => {
    setStyle({
      transform: 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.4s ease-out',
    });
  }, []);

  return { ref, style, onMouseMove, onMouseLeave };
}
