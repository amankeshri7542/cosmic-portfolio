'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CosmicDustProps {
  count?: number;
  speed?: number;
}

export default function CosmicDust({ 
  count = 500,
  speed = 0.001
}: CosmicDustProps) {
  const pointsRef = useRef<THREE.Points>(null);
  
  // Generate dust particles with drift motion
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      // Spread dust particles across the viewport
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10 + 5; // Closer to camera
      
      // Random drift velocities
      velocities[i * 3] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 2] = 0;
      
      // Smaller, more subtle particles
      sizes[i] = Math.random() * 0.1 + 0.05;
    }
    
    return { positions, velocities, sizes };
  }, [count]);

  // Animate dust particles with continuous drift
  useFrame(() => {
    if (!pointsRef.current) return;
    
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    
    // Update each particle position
    for (let i = 0; i < count; i++) {
      positions[i * 3] += particles.velocities[i * 3] * speed;
      positions[i * 3 + 1] += particles.velocities[i * 3 + 1] * speed;
      
      // Wrap particles around when they drift off screen
      if (positions[i * 3] > 10) positions[i * 3] = -10;
      if (positions[i * 3] < -10) positions[i * 3] = 10;
      if (positions[i * 3 + 1] > 10) positions[i * 3 + 1] = -10;
      if (positions[i * 3 + 1] < -10) positions[i * 3 + 1] = 10;
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particles.positions, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[particles.sizes, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#60a5fa"
        size={0.1}
        transparent
        opacity={0.4}
        sizeAttenuation={true}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}