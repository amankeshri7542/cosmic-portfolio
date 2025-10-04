'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface NebulaCloudProps {
  count?: number;
  color?: string;
  position?: [number, number, number];
  speed?: number;
}

export default function NebulaCloud({ 
  count = 1000,
  color = '#8b5cf6',
  position = [0, 0, -10],
  speed = 0.0005
}: NebulaCloudProps) {
  const pointsRef = useRef<THREE.Points>(null);
  
  // Generate positions and colors for nebula particles
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    const baseColor = new THREE.Color(color);
    
    for (let i = 0; i < count; i++) {
      // Create a spherical cloud distribution
      // We use spherical coordinates for more natural-looking clouds
      const radius = Math.random() * 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      // Convert spherical to Cartesian coordinates
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      // Color variation - some particles slightly brighter/dimmer
      const colorVariation = 0.8 + Math.random() * 0.2;
      colors[i * 3] = baseColor.r * colorVariation;
      colors[i * 3 + 1] = baseColor.g * colorVariation;
      colors[i * 3 + 2] = baseColor.b * colorVariation;
      
      // Size variation for depth
      sizes[i] = Math.random() * 0.5 + 0.2;
    }
    
    return { positions, colors, sizes };
  }, [count, color]);

  // Animate the nebula with gentle swirling motion
  useFrame((state) => {
    if (!pointsRef.current) return;
    
    // Slow rotation to create swirling effect
    pointsRef.current.rotation.y += speed;
    pointsRef.current.rotation.z += speed * 0.5;
    
    // Gentle pulsing effect using sine wave
    const scale = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    pointsRef.current.scale.setScalar(scale);
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
        opacity={0.6}
        sizeAttenuation={true}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}