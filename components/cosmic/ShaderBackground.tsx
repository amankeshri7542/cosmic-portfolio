'use client';

import { useEffect, useRef } from 'react';

export default function ShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const canvas = canvasEl;

    const glCtx = canvas.getContext('webgl', {
      antialias: false,
      premultipliedAlpha: false,
      alpha: false,
    });
    if (!glCtx) return;
    const gl = glCtx;

    // --- Vertex shader (full-screen triangle) ---
    const VS = `
      attribute vec2 a_pos;
      void main(){ gl_Position = vec4(a_pos, 0.0, 1.0); }
    `;

    const HEAD = `
      precision highp float;
      uniform vec2  u_res;
      uniform vec2  u_mouse;
      uniform vec2  u_mouseN;
      uniform float u_time;
      uniform float u_click;
      uniform vec2  u_clickPos;
      uniform float u_shock;
    `;

    // --- Gravity Grid: deep-space starfield with comet cursor & shockwave ---
    const FS = HEAD + `
      uniform vec2 u_trail[16];
      float hash11(float n){ return fract(sin(n)*43758.5453); }
      vec2  hash22(vec2 p){
        p = vec2(dot(p, vec2(127.1,311.7)), dot(p, vec2(269.5,183.3)));
        return fract(sin(p)*43758.5453);
      }
      float sdSeg(vec2 P, vec2 A, vec2 B){
        vec2 pa = P - A, ba = B - A;
        float h = clamp(dot(pa,ba)/max(dot(ba,ba),1e-5), 0.0, 1.0);
        return length(pa - ba*h);
      }
      void main(){
        vec2 P = gl_FragCoord.xy;
        vec2 M = u_mouseN * u_res;
        vec2 C = u_clickPos * u_res;
        float screenSpan = min(u_res.x, u_res.y);

        vec3 col = vec3(0.004, 0.006, 0.012);

        // --- shockwave ---
        float shockActive = step(0.001, u_shock) * step(u_shock, 0.999);
        float shockR = u_shock * screenSpan * 1.1;
        float shockThick = screenSpan * 0.09;
        float shockEnv = sin(u_shock * 3.14159) * shockActive;

        // --- parallax starfield (4 layers) ---
        for (int L = 0; L < 4; L++){
          float fl = float(L);
          float cell = mix(9.0, 44.0, fl/3.0) * (screenSpan/900.0);
          cell = max(cell, 6.0);
          float layerBright = mix(0.35, 1.0, fl/3.0);
          float seed = fl * 37.1;

          vec2 g = floor(P / cell);
          vec2 starJitter = hash22(g + seed);
          vec2 starPos = (g + starJitter) * cell;

          // shockwave displacement
          vec2 toStar = starPos - C;
          float dStar = length(toStar) + 1.0;
          float ringOffset = dStar - shockR;
          float kick = exp(-pow(ringOffset / shockThick, 2.0)) * shockEnv;
          float kickAmp = mix(18.0, 52.0, fl/3.0) * (screenSpan/900.0);
          vec2 displaced = starPos + normalize(toStar + vec2(1e-4)) * kick * kickAmp;

          float rnd = hash11(dot(g, vec2(12.9, 78.2)) + seed);
          float radius = mix(0.7, 1.9, hash11(rnd*7.13)) * (screenSpan/900.0 + 0.6);
          float colorPick = hash11(rnd*3.71);
          vec3 starCol;
          if (colorPick < 0.04)      starCol = vec3(1.0, 0.35, 0.35);
          else if (colorPick < 0.08) starCol = vec3(0.4, 1.0, 0.45);
          else if (colorPick < 0.12) starCol = vec3(0.4, 0.55, 1.0);
          else                       starCol = vec3(1.0, 0.98, 0.95);

          float existProb = mix(0.95, 0.55, fl/3.0);
          float exists = step(1.0 - existProb, hash11(rnd*17.3));
          float tw = 0.6 + 0.4*sin(u_time*mix(0.8,2.2,rnd) + rnd*6.28);

          float sd = length(P - displaced);
          float core = smoothstep(radius, radius*0.15, sd);
          float glow = smoothstep(radius*4.0, radius, sd) * 0.35;
          float star = (core + glow) * exists * tw * layerBright;
          star *= 1.0 + kick * 1.2;

          col += starCol * star;
        }

        // --- comet trail ---
        float trailGlow = 0.0;
        float trailCore = 0.0;
        for (int i = 0; i < 15; i++){
          vec2 A = u_trail[i]     * u_res;
          vec2 B = u_trail[i + 1] * u_res;
          if (length(A) < 0.5 && length(B) < 0.5) continue;
          float d = sdSeg(P, A, B);
          float age = float(i) / 15.0;
          float thick = mix(3.5, 0.8, age) * (screenSpan/900.0 + 0.6);
          float bright = mix(1.0, 0.0, age);
          trailCore += smoothstep(thick, 0.0, d) * bright;
          trailGlow += smoothstep(thick*8.0, thick, d) * bright * 0.18;
        }
        vec3 headCol = vec3(1.0, 0.96, 0.85);
        vec3 tailCol = vec3(0.55, 0.8, 1.2);
        float dHead = length(P - M);
        float headMix = smoothstep(screenSpan*0.35, 0.0, dHead);
        vec3 trailCol = mix(tailCol, headCol, headMix);

        col += trailCol * trailCore * 1.0;
        col += trailCol * trailGlow * 0.6;

        // comet head
        float bright = exp(-dHead / (screenSpan*0.018));
        float halo   = exp(-dHead / (screenSpan*0.11)) * 0.22;
        col += headCol * bright * 1.05;
        col += trailCol * halo;

        // starburst spikes
        vec2 offH = P - M;
        float ang = atan(offH.y, offH.x);
        float spikes = pow(max(0.0, cos(ang*2.0)), 40.0) + pow(max(0.0, cos(ang*2.0 + 1.5707)), 40.0);
        col += headCol * spikes * exp(-dHead / (screenSpan*0.13)) * 0.32;

        // --- shockwave ring ---
        float dC = length(P - C);
        float ringOff = dC - shockR;
        float ring = exp(-pow(ringOff / (shockThick*0.45), 2.0)) * shockEnv;
        col += ring * vec3(0.75, 0.88, 1.15) * 0.45;
        float startFlash = smoothstep(0.1, 0.0, u_shock) * exp(-dC / (screenSpan*0.05));
        col += startFlash * vec3(1.0, 0.95, 0.8) * 0.8;

        // vignette
        vec2 uv = gl_FragCoord.xy / u_res.xy;
        float vig = smoothstep(1.3, 0.25, length(uv-0.5));
        col *= mix(0.55, 1.0, vig);

        gl_FragColor = vec4(col, 1.0);
      }
    `;

    // --- GL helpers ---
    function compile(type: number, src: string) {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error('Shader error:', gl.getShaderInfoLog(s));
      }
      return s;
    }

    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('Link error:', gl.getProgramInfoLog(prog));
    }

    const loc = {
      a_pos: gl.getAttribLocation(prog, 'a_pos'),
      u_res: gl.getUniformLocation(prog, 'u_res'),
      u_mouse: gl.getUniformLocation(prog, 'u_mouse'),
      u_mouseN: gl.getUniformLocation(prog, 'u_mouseN'),
      u_time: gl.getUniformLocation(prog, 'u_time'),
      u_click: gl.getUniformLocation(prog, 'u_click'),
      u_clickPos: gl.getUniformLocation(prog, 'u_clickPos'),
      u_shock: gl.getUniformLocation(prog, 'u_shock'),
      u_trail: gl.getUniformLocation(prog, 'u_trail[0]'),
    };

    // Full-screen triangle buffer
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

    // --- State ---
    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    const click = { value: 0, x: 0.5, y: 0.5 };
    const shock = { value: 1.0, duration: 1.2 };
    const TRAIL_LEN = 16;
    const trail = new Float32Array(TRAIL_LEN * 2);
    for (let i = 0; i < TRAIL_LEN; i++) {
      trail[i * 2] = 0.5;
      trail[i * 2 + 1] = 0.5;
    }
    const t0 = performance.now();

    // --- Resize ---
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.floor(window.innerWidth * dpr);
      const h = Math.floor(window.innerHeight * dpr);
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
    resize();
    window.addEventListener('resize', resize);

    // --- Mouse ---
    function onPointerMove(e: PointerEvent) {
      mouse.tx = e.clientX / window.innerWidth;
      mouse.ty = 1.0 - e.clientY / window.innerHeight;
    }
    function onPointerDown(e: PointerEvent) {
      // Ignore clicks on interactive elements
      if ((e.target as HTMLElement).closest('a, button, input, textarea, nav, [role="button"], .picker')) return;
      click.value = 1.0;
      click.x = e.clientX / window.innerWidth;
      click.y = 1.0 - e.clientY / window.innerHeight;
      shock.value = 0.0;
    }
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerdown', onPointerDown);

    // --- Render loop ---
    function frame() {
      const now = performance.now();
      const t = (now - t0) / 1000;

      // Smooth mouse
      mouse.x += (mouse.tx - mouse.x) * 0.12;
      mouse.y += (mouse.ty - mouse.y) * 0.12;
      // Decay click
      click.value *= 0.94;
      // Advance shock
      if (shock.value < 1.0) shock.value = Math.min(1.0, shock.value + (1 / 60) / shock.duration);
      // Shift trail
      for (let i = TRAIL_LEN - 1; i > 0; i--) {
        trail[i * 2] = trail[(i - 1) * 2];
        trail[i * 2 + 1] = trail[(i - 1) * 2 + 1];
      }
      trail[0] = mouse.x;
      trail[1] = mouse.y;

      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.enableVertexAttribArray(loc.a_pos);
      gl.vertexAttribPointer(loc.a_pos, 2, gl.FLOAT, false, 0, 0);

      gl.uniform2f(loc.u_res, canvas.width, canvas.height);
      gl.uniform2f(loc.u_mouse, mouse.x * canvas.width, mouse.y * canvas.height);
      gl.uniform2f(loc.u_mouseN, mouse.x, mouse.y);
      gl.uniform1f(loc.u_time, t);
      gl.uniform1f(loc.u_click, click.value);
      gl.uniform2f(loc.u_clickPos, click.x, click.y);
      gl.uniform1f(loc.u_shock, shock.value);
      if (loc.u_trail) gl.uniform2fv(loc.u_trail, trail);

      gl.drawArrays(gl.TRIANGLES, 0, 3);
      rafRef.current = requestAnimationFrame(frame);
    }
    rafRef.current = requestAnimationFrame(frame);

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      gl.deleteProgram(prog);
      gl.deleteBuffer(buf);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10">
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full block"
      />
      {/* Overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/25 to-black/50 pointer-events-none" />
    </div>
  );
}
