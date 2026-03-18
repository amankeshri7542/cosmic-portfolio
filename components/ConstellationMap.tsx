'use client';

import { useState } from 'react';

interface Skill {
  name: string;
  x: number;
  y: number;
}

interface Constellation {
  id: string;
  label: string;
  color: string;
  glowColor: string;
  skills: Skill[];
  // Indices of connected skills (edges)
  connections: [number, number][];
}

const constellations: Constellation[] = [
  {
    id: 'cloud',
    label: 'Cloud Nakshatra',
    color: '#22d3ee',
    glowColor: 'rgba(34, 211, 238, 0.6)',
    skills: [
      { name: 'AWS Lambda', x: 80, y: 60 },
      { name: 'EC2 / S3', x: 140, y: 35 },
      { name: 'IAM', x: 160, y: 90 },
      { name: 'DynamoDB', x: 100, y: 110 },
      { name: 'Docker', x: 50, y: 120 },
      { name: 'Kubernetes', x: 30, y: 80 },
      { name: 'Terraform', x: 120, y: 145 },
    ],
    connections: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[3,6]],
  },
  {
    id: 'dev',
    label: 'Dev Nakshatra',
    color: '#a78bfa',
    glowColor: 'rgba(167, 139, 250, 0.6)',
    skills: [
      { name: 'Next.js', x: 310, y: 50 },
      { name: 'React', x: 370, y: 30 },
      { name: 'Node.js', x: 400, y: 80 },
      { name: 'Python', x: 370, y: 130 },
      { name: 'TypeScript', x: 300, y: 120 },
      { name: 'JavaScript', x: 270, y: 70 },
    ],
    connections: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[0,4]],
  },
  {
    id: 'ai',
    label: 'AI Nakshatra',
    color: '#E8A045',
    glowColor: 'rgba(232, 160, 69, 0.6)',
    skills: [
      { name: 'OpenAI API', x: 180, y: 220 },
      { name: 'LangChain', x: 250, y: 200 },
      { name: 'MongoDB', x: 320, y: 230 },
      { name: 'PostgreSQL', x: 280, y: 280 },
      { name: 'Stable Diff.', x: 200, y: 290 },
      { name: 'MoviePy', x: 140, y: 260 },
    ],
    connections: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[0,3]],
  },
];

export default function ConstellationMap() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="w-full flex flex-col items-center">
      <div
        className="w-full rounded-xl p-4 md:p-6"
        style={{
          background: 'rgba(5, 5, 15, 0.75)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(139, 92, 246, 0.1)',
        }}
      >
      <svg
        viewBox="0 0 480 330"
        width="100%"
        style={{ maxWidth: 700, display: 'block', margin: '0 auto' }}
        className="overflow-visible"
      >
        {/* Background stars */}
        {Array.from({ length: 60 }, (_, i) => (
          <circle
            key={`star-${i}`}
            cx={Math.round(((i * 137.5) % 480))}
            cy={Math.round(((i * 97.3) % 330))}
            r={(i % 4) === 0 ? 1.2 : 0.6}
            fill="white"
            opacity={0.15 + (i % 5) * 0.05}
          />
        ))}

        {constellations.map((c) => {
          const isActive = hovered === c.id || hovered === null;
          const dimmed = hovered !== null && hovered !== c.id;

          return (
            <g
              key={c.id}
              opacity={dimmed ? 0.2 : 1}
              style={{ transition: 'opacity 300ms ease' }}
              onMouseEnter={() => setHovered(c.id)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Connection lines */}
              {c.connections.map(([a, b], i) => (
                <line
                  key={`${c.id}-line-${i}`}
                  x1={c.skills[a].x}
                  y1={c.skills[a].y}
                  x2={c.skills[b].x}
                  y2={c.skills[b].y}
                  stroke={c.color}
                  strokeWidth="0.6"
                  opacity={isActive ? 0.5 : 0.15}
                  style={{ transition: 'opacity 300ms' }}
                />
              ))}

              {/* Skill stars */}
              {c.skills.map((skill, i) => (
                <g key={`${c.id}-${i}`}>
                  {/* Glow */}
                  {isActive && !dimmed && (
                    <circle
                      cx={skill.x}
                      cy={skill.y}
                      r="8"
                      fill={c.glowColor}
                      opacity="0.15"
                    />
                  )}
                  {/* Star dot */}
                  <circle
                    cx={skill.x}
                    cy={skill.y}
                    r="3"
                    fill={c.color}
                    style={{ transition: 'r 200ms' }}
                  />
                  {/* Label */}
                  <text
                    x={skill.x}
                    y={skill.y - 8}
                    textAnchor="middle"
                    fill={isActive ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.3)'}
                    fontSize="7.5"
                    fontWeight="500"
                    style={{ transition: 'fill 300ms', pointerEvents: 'none' }}
                  >
                    {skill.name}
                  </text>
                </g>
              ))}

              {/* Constellation label */}
              <text
                x={c.skills.reduce((s, sk) => s + sk.x, 0) / c.skills.length}
                y={Math.max(...c.skills.map(s => s.y)) + 22}
                textAnchor="middle"
                fill={c.color}
                fontSize="9"
                fontWeight="600"
                letterSpacing="0.1em"
                opacity={isActive ? 0.7 : 0.2}
                style={{ transition: 'opacity 300ms', textTransform: 'uppercase' as const }}
              >
                {c.label}
              </text>
            </g>
          );
        })}
      </svg>
      </div>

      <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px', marginTop: 8, letterSpacing: '0.05em' }}>
        hover a constellation to explore
      </p>
    </div>
  );
}
