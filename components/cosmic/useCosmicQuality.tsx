'use client';

import { useState, useEffect } from 'react';

interface QualitySettings {
  starCount: number;
  nebulaCount: number;
  dustCount: number;
  enablePostProcessing: boolean;
}

export function useCosmicQuality() {
  const [quality, setQuality] = useState<QualitySettings>({
    starCount: 5000,
    nebulaCount: 1000,
    dustCount: 300,
    enablePostProcessing: true,
  });

  useEffect(() => {
    // Detect device capabilities
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isLowEnd = navigator.hardwareConcurrency ? navigator.hardwareConcurrency < 4 : false;
    
    // Adjust quality based on device
    if (isMobile || isLowEnd) {
      setQuality({
        starCount: 2000,
        nebulaCount: 500,
        dustCount: 150,
        enablePostProcessing: false,
      });
    } else {
      // Check for GPU capabilities
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (gl && 'getExtension' in gl) {
        const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const renderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          
          // If it's an integrated GPU, reduce quality slightly
          if (renderer && /Intel/i.test(renderer)) {
            setQuality({
              starCount: 3500,
              nebulaCount: 700,
              dustCount: 200,
              enablePostProcessing: true,
            });
          }
        }
      }
    }
  }, []);

  return quality;
}