"use client";

import { useFrame } from "@react-three/fiber";
import { MeshDistortMaterial } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

export default function AIOrb() {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!mesh.current) return;

    mesh.current.rotation.y += 0.003;
    mesh.current.rotation.x += 0.001;

    mesh.current.position.y =
      Math.sin(state.clock.elapsedTime) * 0.2;
  });

  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[1.4, 128, 128]} />

      <MeshDistortMaterial
        color="#3B82F6"
        emissive="#2563EB"
        emissiveIntensity={2}
        distort={0.35}
        speed={2}
        roughness={0.05}
      />
    </mesh>
  );
}