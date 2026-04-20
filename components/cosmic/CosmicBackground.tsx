'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import Starfield from './Starfield';
import NebulaCloud from './NebulaCloud';
import SatelliteModel from './SatelliteModel';

export default function CosmicBackground() {
  return (
    <div className="fixed inset-0 -z-[5] pointer-events-none">
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
          <Starfield count={5000} depth={50} speed={0.00011} />

          {/* Main Milky Way Galaxy - Center */}
          <NebulaCloud
            count={3000}
            color="#a78bfa"
            position={[0, 0, -20]}
            speed={0.00022}
            shape="milkyway"
          />

          {/* Mini Spiral Galaxy - Top Right */}
          <NebulaCloud
            count={1500}
            color="#3b82f6"
            position={[10, 8, -25]}
            speed={0.000275}
            shape="milkyway"
          />

          {/* Small Nebula Cloud - Bottom Left */}
          <NebulaCloud
            count={800}
            color="#06b6d4"
            position={[-8, -6, -22]}
            speed={0.00033}
            shape="sphere"
          />

          {/* 3D Satellite - scroll-reactive */}
          <SatelliteModel />
        </Suspense>

        <ambientLight intensity={0.6} />
        <pointLight position={[5, 5, 5]} intensity={1.2} color="#a78bfa" />
        <pointLight position={[-3, -2, 3]} intensity={0.6} color="#06b6d4" />
      </Canvas>
    </div>
  );
}