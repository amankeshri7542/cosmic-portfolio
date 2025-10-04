'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import Starfield from './Starfield';
import NebulaCloud from './NebulaCloud';
import CosmicDust from './CosmicDust';

export default function CosmicBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{
          position: [0, 0, 10],
          fov: 75,
          near: 0.1,
          far: 1000
        }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          alpha: true,
        }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <Starfield count={5000} depth={50} speed={0.0001} />
          
          {/* Main Milky Way Galaxy - Center */}
          <NebulaCloud 
            count={3000}
            color="#a78bfa"
            position={[0, 0, -20]}
            speed={0.0002}
            shape="milkyway"
          />
          
          {/* Mini Spiral Galaxy - Top Right */}
          <NebulaCloud 
            count={1500}
            color="#3b82f6"
            position={[10, 8, -25]}
            speed={0.00025}
            shape="milkyway"
          />
          
          {/* Small Nebula Cloud - Bottom Left */}
          <NebulaCloud 
            count={800}
            color="#06b6d4"
            position={[-8, -6, -22]}
            speed={0.0003}
            shape="sphere"
          />
          
          <CosmicDust count={400} speed={0.8} />
        </Suspense>
        
        <ambientLight intensity={0.5} />
      </Canvas>
    </div>
  );
}