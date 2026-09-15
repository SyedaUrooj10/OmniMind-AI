"use client";

import { Canvas } from "@react-three/fiber";
import { Float, OrbitControls } from "@react-three/drei";
import AIOrb from "./AIOrb";

export default function Scene() {
  return (
    <Canvas camera={{ position: [0, 0, 4] }}>
      <ambientLight intensity={2} />

      <pointLight
        position={[3, 3, 3]}
        intensity={25}
        color="#60A5FA"
      />

      <Float
        speed={2}
        rotationIntensity={1}
        floatIntensity={2}
      >
        <AIOrb />
      </Float>

      <OrbitControls
        enableZoom={false}
        autoRotate
        autoRotateSpeed={2}
      />
    </Canvas>
  );
}