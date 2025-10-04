'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
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
  const { mouse } = useThree();
  const [shootingStars, setShootingStars] = useState<number[]>([]);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * depth;
      const y = (Math.random() - 0.5) * depth;
      const z = (Math.random() - 0.5) * depth;
      const scale = Math.random() * 0.5 + 0.5;
      temp.push({ x, y, z, scale, originalX: x, originalY: y });
    }
    return temp;
  }, [count, depth]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

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

  // Shooting stars
  useEffect(() => {
    const interval = setInterval(() => {
      const randomStar = Math.floor(Math.random() * count);
      setShootingStars(prev => [...prev, randomStar]);
      setTimeout(() => {
        setShootingStars(prev => prev.filter(s => s !== randomStar));
      }, 1000);
    }, 3000);
    return () => clearInterval(interval);
  }, [count]);

  useFrame((state) => {
    if (!mesh.current) return;
    
    // Interactive parallax
    mesh.current.rotation.y += speed;
    mesh.current.rotation.x = mouse.y * 0.05;
    mesh.current.rotation.y += mouse.x * 0.05;

    // Shooting stars animation
    shootingStars.forEach(starIndex => {
      const particle = particles[starIndex];
      dummy.position.set(
        particle.x + state.clock.elapsedTime * 10,
        particle.y - state.clock.elapsedTime * 5,
        particle.z
      );
      dummy.scale.setScalar(particle.scale * 2);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(starIndex, dummy.matrix);
    });
    
    if (shootingStars.length > 0) {
      mesh.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.02, 8, 8]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
    </instancedMesh>
  );
}