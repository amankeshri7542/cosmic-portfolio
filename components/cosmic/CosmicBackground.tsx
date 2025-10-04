'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import Starfield from './Starfield';
import NebulaCloud from './NebulaCloud';
import CosmicDust from './CosmicDust';

export default function CosmicBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      {/* Canvas is the R3F component that creates the WebGL context */}
      <Canvas
        camera={{
          position: [0, 0, 10],
          fov: 75,
          near: 0.1,
          far: 1000
        }}
        gl={{
          // Enable antialiasing for smoother edges
          antialias: true,
          // Use high performance mode
          powerPreference: 'high-performance',
          // Enable alpha for transparency
          alpha: true,
        }}
        dpr={[1, 2]} // Device pixel ratio: min 1, max 2 for retina displays
      >
        {/* Suspense handles loading states for 3D components */}
        <Suspense fallback={null}>
          {/* Layer 1: Distant starfield (slowest movement) */}
          <Starfield count={5000} depth={50} speed={0.0001} />
          
          {/* Layer 2: Multiple nebula clouds at different positions */}
          {/* Purple nebula - left side */}
          <NebulaCloud 
            count={1000}
            color="#8b5cf6"
            position={[-8, 3, -15]}
            speed={0.0003}
          />
          
          {/* Blue nebula - right side */}
          <NebulaCloud 
            count={800}
            color="#3b82f6"
            position={[8, -2, -18]}
            speed={0.0002}
          />
          
          {/* Teal nebula - center, further back */}
          <NebulaCloud 
            count={600}
            color="#06b6d4"
            position={[0, -5, -25]}
            speed={0.00015}
          />
          
          {/* Orange accent nebula - adds warmth */}
          <NebulaCloud 
            count={400}
            color="#f97316"
            position={[-5, 8, -20]}
            speed={0.00025}
          />
          
          {/* Layer 3: Foreground cosmic dust (fastest movement) */}
          <CosmicDust count={300} speed={0.5} />
        </Suspense>
        
        {/* Ambient light to subtly illuminate everything */}
        <ambientLight intensity={0.5} />
      </Canvas>
    </div>
  );
}