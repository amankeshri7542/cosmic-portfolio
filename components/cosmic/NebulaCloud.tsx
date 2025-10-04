'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface NebulaCloudProps {
  count?: number;
  color?: string;
  position?: [number, number, number];
  speed?: number;
  shape?: 'sphere' | 'milkyway';
}

export default function NebulaCloud({ 
  count = 1000,
  color = '#8b5cf6',
  position = [0, 0, -10],
  speed = 0.0005,
  shape = 'sphere'
}: NebulaCloudProps) {
  const pointsRef = useRef<THREE.Points>(null);
  
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    const baseColor = new THREE.Color(color);
    
    for (let i = 0; i < count; i++) {
      if (shape === 'milkyway') {
        // Milky Way spiral pattern
        const angle = (i / count) * Math.PI * 4;
        const radius = (i / count) * 15 + Math.random() * 2;
        const height = (Math.random() - 0.5) * 2;
        
        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = height;
        positions[i * 3 + 2] = Math.sin(angle) * radius - 10;
        
        // Core is brighter
        const distanceFromCore = radius / 15;
        const brightness = 1.2 - distanceFromCore * 0.5;
        colors[i * 3] = baseColor.r * brightness;
        colors[i * 3 + 1] = baseColor.g * brightness;
        colors[i * 3 + 2] = baseColor.b * brightness;
      } else {
        // Spherical cloud
        const radius = Math.random() * 5;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi);
        
        const colorVariation = 0.8 + Math.random() * 0.2;
        colors[i * 3] = baseColor.r * colorVariation;
        colors[i * 3 + 1] = baseColor.g * colorVariation;
        colors[i * 3 + 2] = baseColor.b * colorVariation;
      }
      
      sizes[i] = Math.random() * 0.5 + 0.2;
    }
    
    return { positions, colors, sizes };
  }, [count, color, shape]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    
    pointsRef.current.rotation.y += speed;
    pointsRef.current.rotation.z += speed * 0.5;
    
    // Gentle pulsing for milkyway core
    if (shape === 'milkyway') {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
      pointsRef.current.scale.setScalar(scale);
    }
  });

  return (
    <points ref={pointsRef} position={position}>
      <bufferGeometry>
  <bufferAttribute
    attach="attributes-position"
    args={[particles.positions, 3]}
  />
  <bufferAttribute
    attach="attributes-color"
    args={[particles.colors, 3]}
  />
  <bufferAttribute
    attach="attributes-size"
    args={[particles.sizes, 1]}
  />
</bufferGeometry>
      <pointsMaterial
        size={0.3}
        vertexColors
        transparent
        opacity={0.7}
        sizeAttenuation={true}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}