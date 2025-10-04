'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface StarfieldProps {
  count?: number;
  depth?: number;
  speed?: number;
}

export default function Starfield({ 
  count = 5000, 
  depth = 50,
  speed = 0.0001 
}: StarfieldProps) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  
  // Generate random positions for stars
  // We're using useMemo here to ensure these positions are only calculated once
  // Otherwise, they'd regenerate on every render, causing stars to jump around
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      // Spread stars in a 3D box around the camera
      const x = (Math.random() - 0.5) * depth;
      const y = (Math.random() - 0.5) * depth;
      const z = (Math.random() - 0.5) * depth;
      
      // Random size variation for stars (some appear brighter/larger)
      const scale = Math.random() * 0.5 + 0.5;
      
      temp.push({ x, y, z, scale });
    }
    return temp;
  }, [count, depth]);

  // Create the dummy object that we'll use to set each instance's transform
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Initialize star positions when component mounts
  // This runs once to set up all star positions
  useMemo(() => {
    if (!mesh.current) return;
    
    particles.forEach((particle, i) => {
      dummy.position.set(particle.x, particle.y, particle.z);
      dummy.scale.setScalar(particle.scale);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  }, [particles, dummy]);

  // Animate stars - this runs every frame (60 times per second)
  // We're rotating the entire starfield slowly to create gentle motion
  useFrame((state) => {
    if (!mesh.current) return;
    
    // Gentle rotation on Y axis for subtle movement
    mesh.current.rotation.y += speed;
    
    // Optional: Add parallax based on mouse position
    // This creates an interactive feel where stars shift as you move your mouse
    const { mouse } = state;
    mesh.current.rotation.x = mouse.y * 0.02;
    mesh.current.rotation.y += mouse.x * 0.02;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      {/* SphereGeometry creates the basic star shape - a tiny sphere */}
      <sphereGeometry args={[0.02, 8, 8]} />
      
      {/* MeshBasicMaterial doesn't require lighting, perfect for stars */}
      {/* We use white color with some transparency for a twinkling effect */}
      <meshBasicMaterial 
        color="#ffffff" 
        transparent 
        opacity={0.8}
      />
    </instancedMesh>
  );
}