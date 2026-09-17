"use client";
import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { Group, MathUtils, Mesh, MeshPhysicalMaterial, Object3D, PMREMGenerator } from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

function Studio({ onFailure }: { onFailure: () => void }) {
  const { gl, scene } = useThree();
  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener("webglcontextlost", onFailure);
    // Remove before renderer disposal: scrolling offscreen is not a failure.
    return () => canvas.removeEventListener("webglcontextlost", onFailure);
  }, [gl, onFailure]);
  useEffect(() => {
    const room = new RoomEnvironment();
    const generator = new PMREMGenerator(gl);
    const target = generator.fromScene(room, .03);
    scene.environment = target.texture;
    room.dispose(); generator.dispose();
    return () => { scene.environment = null; target.dispose(); };
  }, [gl, scene]);
  return null;
}

function Model({ kind, value }: { kind: string; value: number }) {
  const { scene } = useGLTF(`/observatory/${kind}.glb`);
  const gl = useThree(state => state.gl);
  const root = useRef<Group>(null);
  const crystal = useMemo(() => new MeshPhysicalMaterial({ color: "#d6e8ed", metalness: 0, roughness: .045, transmission: .96, thickness: 1.1, ior: 1.5, envMapIntensity: 1.5, dispersion: .8 }), []);
  const copy = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse(object => { if (object instanceof Mesh && object.name.startsWith("optical_prism")) object.material = crystal; });
    return clone;
  }, [scene, crystal]);
  useEffect(() => {
    gl.domElement.dataset.objectReady = kind;
    return () => { delete gl.domElement.dataset.objectReady; crystal.dispose(); };
  }, [gl, kind, crystal]);
  const layers = useMemo(() => {
    const result: { object: Object3D; y: number; factor: number }[] = [];
    copy.traverse((object) => {
      if (object.name.startsWith("upper_") || object.name.startsWith("base_")) {
        result.push({ object, y: object.position.y, factor: object.name.startsWith("upper_") ? 1 : -1 });
      }
    });
    return result;
  }, [copy]);
  useFrame((state, delta) => {
    if (!root.current) return;
    const angle = kind === "circuit" ? -.35 : (value - 50) / 60;
    root.current.rotation.y = MathUtils.damp(root.current.rotation.y, angle, 5, delta);
    root.current.position.y = Math.sin(state.clock.elapsedTime * .6) * .035;
    for (const layer of layers) layer.object.position.y = MathUtils.damp(layer.object.position.y, layer.y + layer.factor * value / 125, 6, delta);
  });
  return <group ref={root} rotation={[.13, -.35, 0]}><primitive object={copy} /></group>;
}
export default function ObjectCanvas({ kind, value, onFailure }: { kind: string; value: number; onFailure: () => void }) {
  return <Canvas camera={{ position: [3.2, 2.8, 6], fov: kind === "satellite" ? 35 : 32 }} dpr={[1, 1.5]} gl={{ alpha: true, antialias: true, powerPreference: "low-power" }} fallback={<span>Illustrated view</span>}>
    <Studio onFailure={onFailure} />
    <ambientLight intensity={.7} />
    <directionalLight position={[3, 5, 4]} intensity={2} color="#fff1d7" />
    <directionalLight position={[-4, 1, 1]} intensity={1} color="#9ebfe3" />
    <directionalLight position={[0, 3, -5]} intensity={1.5} />
    <Suspense fallback={null}><Model kind={kind} value={value} /></Suspense>
  </Canvas>;
}
