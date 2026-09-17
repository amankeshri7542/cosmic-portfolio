"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  Lightformer,
  MeshReflectorMaterial,
  useGLTF,
  useTexture,
} from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

type Props = {
  onReady: () => void;
  onError: () => void;
  inspect: boolean;
  angle: number;
};
const cameraStops = [
  { position: [9, 6.2, 17], target: [-2.9, 3.1, 0] },
  { position: [7, 4.8, 13], target: [-3.0, 1.7, 0] },
  { position: [4, 4.1, 9.8], target: [-2.5, 3.4, 0] },
  { position: [-5, 5.6, 14], target: [1.6, 2.5, 0] },
  { position: [-8, 9, 16], target: [0, 1.8, 0] },
  { position: [8, 4.3, 15], target: [-2.8, 2.2, 0] },
];

function Scene({
  onReady,
  onError,
  inspect,
  angle,
  mobile,
}: { mobile: boolean } & Props) {
  const { scene: asset } = useGLTF(
    "/sanctuary/quiet-engine.glb",
    "/sanctuary/draco/",
  );
  const inscription = useTexture("/sanctuary/inscription.png");
  const lettering = useRef<THREE.MeshBasicMaterial>(null);
  const { camera, gl, invalidate, setDpr } = useThree();
  const group = useRef<THREE.Group>(null);
  const sun = useRef<THREE.DirectionalLight>(null);
  const fill = useRef<THREE.HemisphereLight>(null);
  const worldScene = useThree((state) => state.scene);
  const scroll = useRef(0);
  const points = useRef<number[]>([]);
  const pointer = useRef({ x: 0, y: 0 });
  const look = useRef(new THREE.Vector3(-2.9, 3.1, 0));
  const position = useMemo(() => new THREE.Vector3(), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  const a = useMemo(() => new THREE.Vector3(), []);
  const b = useMemo(() => new THREE.Vector3(), []);
  const night = useMemo(() => new THREE.Color("#111a19"), []);
  const day = useMemo(() => new THREE.Color("#8a9d8b"), []);
  const frameStats = useRef({ count: 0, total: 0, slow: 0, lowered: false });
  const materialCopies = useMemo(() => {
    const copy = asset.clone(true);
    copy.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.castShadow = true;
        object.receiveShadow = true;
        const material = (
          object.material as THREE.MeshStandardMaterial
        ).clone();
        object.material = material;
        if (material.name.startsWith("Basalt")) {
          material.bumpMap = material.map;
          material.bumpScale = 0.025;
          material.roughness = 0.91;
        }
        if (material.name.startsWith("Fern")) {
          material.side = THREE.DoubleSide;
          object.castShadow = false;
        }
      }
    });
    return copy;
  }, [asset]);
  const opticalRings = useMemo(() => {
    const rings: THREE.Object3D[] = [];
    materialCopies.traverse((object) => {
      if (object.name.startsWith("Optical")) rings.push(object);
    });
    return rings;
  }, [materialCopies]);
  useEffect(() => {
    const update = () => {
      scroll.current = window.scrollY;
      invalidate();
    };
    const measure = () => {
      points.current = Array.from(
        document.querySelectorAll("[data-chapter]"),
      ).map((element) => element.getBoundingClientRect().top + window.scrollY);
      update();
    };
    const move = (event: PointerEvent) => {
      if (!mobile) {
        pointer.current = {
          x: event.clientX / window.innerWidth - 0.5,
          y: event.clientY / window.innerHeight - 0.5,
        };
        invalidate();
      }
    };
    const lost = (event: Event) => {
      event.preventDefault();
      onError();
    };
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", measure);
    window.addEventListener("pointermove", move, { passive: true });
    gl.domElement.addEventListener("webglcontextlost", lost);
    document.addEventListener("visibilitychange", update);
    measure();
    onReady();
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", measure);
      window.removeEventListener("pointermove", move);
      gl.domElement.removeEventListener("webglcontextlost", lost);
      document.removeEventListener("visibilitychange", update);
    };
  }, [gl, invalidate, mobile, onError, onReady]);
  useEffect(
    () => () => {
      materialCopies.traverse((object) => {
        if (object instanceof THREE.Mesh)
          (object.material as THREE.Material).dispose();
      });
    },
    [materialCopies],
  );
  useEffect(() => {
    invalidate();
  }, [inspect, angle, invalidate]);
  useFrame((_, delta) => {
    if (document.hidden) return;
    const stops = points.current;
    const y = scroll.current + window.innerHeight * 0.1;
    let index = 0;
    while (index < stops.length - 1 && y >= stops[index + 1]) index++;
    index = Math.min(index, 4);
    const raw = THREE.MathUtils.clamp(
      (y - (stops[index] || 0)) /
        Math.max(1, (stops[index + 1] || 1) - (stops[index] || 0)),
      0,
      1,
    );
    const t = raw * raw * (3 - 2 * raw);
    const from = cameraStops[index],
      to = cameraStops[index + 1];
    position.fromArray(from.position).lerp(a.fromArray(to.position), t);
    target.fromArray(from.target).lerp(b.fromArray(to.target), t);
    if (mobile) {
      position.set(7, 5.8, 20);
      target.set(0, 3.2, 0);
    }
    if (inspect) {
      position.set(9, 6.2, 17);
      target.set(0, 3.1, 0);
    } else if (!mobile) {
      position.x += pointer.current.x * 0.3;
      position.y -= pointer.current.y * 0.2;
    }
    const damping = 1 - Math.exp(-delta * 4);
    camera.position.lerp(position, damping);
    look.current.lerp(target, damping);
    camera.lookAt(look.current);
    if (group.current)
      group.current.rotation.y = THREE.MathUtils.damp(
        group.current.rotation.y,
        inspect ? (angle * Math.PI) / 180 : 0,
        5,
        delta,
      );
    const progress = index + t;
    opticalRings.forEach((ring, i) => {
      ring.rotation.y = Math.sin(progress * 0.85 + i * 0.8) * 0.42;
    });
    if (lettering.current)
      lettering.current.opacity =
        THREE.MathUtils.smoothstep(progress, 4.25, 4.8) * 0.8;
    const daylight =
      THREE.MathUtils.smoothstep(progress, 2.8, 4) *
      (1 - THREE.MathUtils.smoothstep(progress, 4.2, 5) * 0.8);
    if (sun.current) sun.current.intensity = 2.8 + daylight * 1.6;
    if (fill.current) fill.current.intensity = 0.85 + daylight * 0.8;
    if (worldScene.fog instanceof THREE.Fog) {
      worldScene.fog.color.copy(night).lerp(day, daylight);
      if (worldScene.background instanceof THREE.Color)
        worldScene.background.copy(worldScene.fog.color);
    }
    const stats = frameStats.current;
    if (delta < 0.15) {
      stats.count++;
      stats.total += delta;
      if (delta > 0.035) stats.slow++;
    }
    if (stats.count === 90 && !stats.lowered && stats.slow > 45) {
      setDpr(1);
      stats.lowered = true;
    }
    // Finite settling: ordinary scroll, pointer and input events wake the renderer.
    if (
      camera.position.distanceToSquared(position) > 0.00001 ||
      look.current.distanceToSquared(target) > 0.00001 ||
      (group.current &&
        Math.abs(
          group.current.rotation.y - (inspect ? (angle * Math.PI) / 180 : 0),
        ) > 0.001)
    )
      invalidate();
    gl.domElement.dataset.drawCalls = String(gl.info.render.calls);
    gl.domElement.dataset.triangles = String(gl.info.render.triangles);
    gl.domElement.dataset.quality = stats.lowered
      ? "adaptive-low"
      : mobile
        ? "mobile"
        : "standard";
    gl.info.reset();
  });
  return (
    <>
      <color attach="background" args={["#111a19"]} />
      <fog attach="fog" args={["#111a19", 14, 42]} />
      <hemisphereLight ref={fill} args={["#becdc2", "#18251e", 0.85]} />
      <directionalLight
        ref={sun}
        position={[-4, 9, 7]}
        intensity={2.8}
        color="#dddcc8"
        castShadow={!mobile}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={11}
        shadow-camera-bottom={-5}
        shadow-normalBias={0.04}
      />
      <directionalLight position={[5, 6, -3]} intensity={3.5} color="#b8a078" />
      <Environment resolution={128} frames={1}>
        <Lightformer
          position={[-5, 7, 5]}
          scale={[12, 8, 1]}
          intensity={2}
          color="#b8c9c0"
        />
        <Lightformer
          position={[5, 5, -4]}
          rotation-y={Math.PI}
          scale={[6, 10, 1]}
          intensity={3}
          color="#c4a571"
        />
      </Environment>
      <group ref={group}>
        <primitive object={materialCopies} />
      </group>
      <mesh position={[0, 0.43, 0.52]}>
        <planeGeometry args={[0.8, 0.28]} />
        <meshBasicMaterial
          ref={lettering}
          map={inscription}
          transparent
          opacity={0}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, -1.25, 0]} receiveShadow>
        <planeGeometry args={[500, 500]} />
        <MeshReflectorMaterial
          resolution={mobile ? 128 : 256}
          mirror={0.7}
          mixStrength={0.8}
          envMapIntensity={0}
          mixBlur={0}
          blur={[0, 0]}
          roughness={0.28}
          metalness={0.15}
          color="#14221d"
          depthScale={0.15}
          minDepthThreshold={0.3}
          maxDepthThreshold={1.4}
        />
      </mesh>
    </>
  );
}

export default function SanctuaryWorld(props: Props) {
  const [mobile, setMobile] = useState(
    () =>
      window.matchMedia("(max-width: 760px)").matches ||
      navigator.hardwareConcurrency < 4,
  );
  useEffect(() => {
    const media = window.matchMedia("(max-width: 760px)");
    const update = () =>
      setMobile(media.matches || navigator.hardwareConcurrency < 4);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return (
    <div className="sanctuary-canvas">
      <Canvas
        shadows={!mobile}
        frameloop="demand"
        dpr={mobile ? 1 : [1, 1.5]}
        camera={{ position: [9, 6.2, 17], fov: 39, near: 0.1, far: 120 }}
        gl={{ antialias: !mobile, alpha: true, powerPreference: "low-power" }}
        fallback={null}
        onCreated={({ gl }) => {
          gl.info.autoReset = false;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
          gl.setClearColor("#111a19", 0);
        }}
      >
        <Suspense fallback={null}>
          <Scene {...props} mobile={mobile} />
        </Suspense>
      </Canvas>
    </div>
  );
}
