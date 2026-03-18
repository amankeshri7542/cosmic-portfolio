'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const planets = [
  {
    id: 'cloud',
    label: 'Cloud',
    orbitRadius: 110,
    size: 36,
    color: '#22d3ee',
    strokeColor: '#22d3ee',
    bgColor: 'rgba(6,54,68,0.9)',
    animDuration: '14s',
    animDirection: 'normal',
    startAngle: 0,
    skills: ['AWS Lambda', 'EC2 / S3', 'DynamoDB'],
    projectPath: '/work',
  },
  {
    id: 'genai',
    label: 'GenAI',
    orbitRadius: 175,
    size: 38,
    color: '#a78bfa',
    strokeColor: '#8b5cf6',
    bgColor: 'rgba(30,17,80,0.9)',
    animDuration: '20s',
    animDirection: 'reverse',
    startAngle: 60,
    skills: ['OpenAI API', 'LangChain', 'Stable Diffusion'],
    projectPath: '/work',
  },
  {
    id: 'devops',
    label: 'DevOps',
    orbitRadius: 175,
    size: 36,
    color: '#a78bfa',
    strokeColor: '#8b5cf6',
    bgColor: 'rgba(30,17,80,0.9)',
    animDuration: '20s',
    animDirection: 'reverse',
    startAngle: 240,
    skills: ['Docker', 'Kubernetes', 'Terraform'],
    projectPath: '/work',
  },
  {
    id: 'nextjs',
    label: 'Next.js',
    orbitRadius: 110,
    size: 30,
    color: '#E8A045',
    strokeColor: '#E8A045',
    bgColor: 'rgba(42,24,0,0.9)',
    animDuration: '14s',
    animDirection: 'normal',
    startAngle: 180,
    skills: ['React', 'Node.js', 'MongoDB'],
    projectPath: '/work',
  },
];

export default function BrahmaandGalaxy() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const router = useRouter();
  const cx = 240;
  const cy = 240;

  return (
    <div className="relative w-full flex flex-col items-center">
      <style>{`
        @keyframes orbit-normal {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes orbit-reverse {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-360deg); }
        }
        @keyframes pulse-core {
          0%, 100% { opacity: 0.6; r: 4; }
          50%       { opacity: 1;   r: 6; }
        }
        .planet-group:hover .planet-circle {
          filter: brightness(1.4);
        }
      `}</style>

      <svg
        viewBox="0 0 480 480"
        width="100%"
        style={{ maxWidth: 640, display: 'block' }}
      >
        {/* Orbit rings */}
        <circle cx={cx} cy={cy} r={110} fill="none" stroke="#22d3ee" strokeWidth="0.5" strokeDasharray="3 5" opacity="0.25" />
        <circle cx={cx} cy={cy} r={175} fill="none" stroke="#8b5cf6" strokeWidth="0.5" strokeDasharray="3 5" opacity="0.25" />

        {/* Center: You */}
        <circle cx={cx} cy={cy} r={38} fill="rgba(10,5,40,0.95)" stroke="#8b5cf6" strokeWidth="1.2" />
        <circle cx={cx} cy={cy} r={38} fill="none" stroke="#E8A045" strokeWidth="0.5" strokeDasharray="2 3" opacity="0.5" />
        <text x={cx} y={cy - 5} textAnchor="middle" fill="#e9d5ff" fontSize="11" fontWeight="500">YOU</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="rgba(232,160,69,0.7)" fontSize="8">🕉️</text>
        {/* Pulsing core dot */}
        <circle cx={cx} cy={cy} r={4} fill="#E8A045" style={{ animation: 'pulse-core 2s ease-in-out infinite' }} />

        {/* Planets */}
        {planets.map((planet) => {
          const isHovered = hoveredId === planet.id;
          const angle = planet.startAngle * (Math.PI / 180);
          const tx = Math.round((Math.cos(angle) * planet.orbitRadius) * 100) / 100;
          const ty = Math.round((Math.sin(angle) * planet.orbitRadius) * 100) / 100;

          return (
            <g
              key={planet.id}
              style={{
                transformOrigin: `${cx}px ${cy}px`,
                animation: `orbit-${planet.animDirection} ${planet.animDuration} linear infinite`,
                animationPlayState: isHovered ? 'paused' : 'running',
              }}
            >
              <g
                className="planet-group"
                transform={`translate(${tx}, ${ty})`}
                style={{ cursor: 'pointer' }}
                onClick={() => router.push(planet.projectPath)}
                onMouseEnter={() => setHoveredId(planet.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={planet.size / 2}
                  className="planet-circle"
                  fill={planet.bgColor}
                  stroke={planet.strokeColor}
                  strokeWidth="0.8"
                  style={{ transition: 'filter 200ms' }}
                />
                <text x={cx} y={cy + 4} textAnchor="middle" fill={planet.color} fontSize="9" fontWeight="500">
                  {planet.label}
                </text>

                {/* Tooltip — only shown on hover */}
                {isHovered && (
                  <g>
                    <rect
                      x={cx - 55}
                      y={cy - 58}
                      width={110}
                      height={50}
                      rx="6"
                      fill="rgba(5,5,20,0.95)"
                      stroke={planet.strokeColor}
                      strokeWidth="0.5"
                    />
                    {planet.skills.map((skill, i) => (
                      <text
                        key={skill}
                        x={cx}
                        y={cy - 38 + i * 14}
                        textAnchor="middle"
                        fill="rgba(255,255,255,0.85)"
                        fontSize="8"
                      >
                        {skill}
                      </text>
                    ))}
                  </g>
                )}
              </g>
            </g>
          );
        })}
      </svg>

      <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px', marginTop: 8, letterSpacing: '0.05em' }}>
        hover to explore · click to see projects
      </p>
    </div>
  );
}
