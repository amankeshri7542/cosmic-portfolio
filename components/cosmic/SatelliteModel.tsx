'use client';

import { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export default function SatelliteModel() {
    const groupRef = useRef<THREE.Group>(null);
    const scrollRef = useRef(0);
    const [visible, setVisible] = useState(false);
    const { viewport } = useThree();

    // Load the compressed GLB
    const { scene } = useGLTF('/satellite.glb');

    // Track scroll position
    useEffect(() => {
        const handleScroll = () => {
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            scrollRef.current = maxScroll > 0 ? window.scrollY / maxScroll : 0;
        };

        // Fade in after a short delay to avoid layout shift
        const timer = setTimeout(() => setVisible(true), 800);
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(timer);
        };
    }, []);

    // Animate rotation based on scroll
    useFrame((_, delta) => {
        if (!groupRef.current) return;

        const scroll = scrollRef.current;

        // Scroll-driven rotation: full 360° Y rotation + gentle X tilt as user scrolls
        const targetRotationY = scroll * Math.PI * 2;
        const targetRotationX = Math.sin(scroll * Math.PI) * 0.4;

        // Smooth interpolation
        groupRef.current.rotation.y = THREE.MathUtils.lerp(
            groupRef.current.rotation.y,
            targetRotationY,
            delta * 3
        );
        groupRef.current.rotation.x = THREE.MathUtils.lerp(
            groupRef.current.rotation.x,
            targetRotationX,
            delta * 3
        );

        // Constant slow spin for life-like feel
        groupRef.current.rotation.z += delta * 0.05;

        // Gentle floating bob
        groupRef.current.position.y = Math.sin(Date.now() * 0.0008) * 0.15;

        // Fade-in opacity via material traversal
        if (visible) {
            groupRef.current.traverse((child) => {
                if ((child as THREE.Mesh).isMesh) {
                    const mesh = child as THREE.Mesh;
                    const material = mesh.material as THREE.MeshStandardMaterial;
                    if (material.opacity < 1) {
                        material.transparent = true;
                        material.opacity = Math.min(material.opacity + delta * 0.5, 1);
                    }
                }
            });
        }
    });

    // Calculate scale based on viewport — kept small so it doesn't cover content
    const scale = viewport.width < 8 ? 0.25 : 0.35;

    return (
        <group
            ref={groupRef}
            position={[viewport.width < 8 ? 4 : 6, 0.5, -8]}
            scale={scale}
        >
            <primitive
                object={scene}
            />
        </group>
    );
}

// Preload the model
useGLTF.preload('/satellite.glb');
