import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

function MovingParticles() {
  const ref = useRef<THREE.Points>(null);
  const count = 420;
  const positions = useMemo(() => {
    const data = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      data[i * 3] = (Math.random() - 0.5) * 24;
      data[i * 3 + 1] = (Math.random() - 0.5) * 24;
      data[i * 3 + 2] = (Math.random() - 0.5) * 24;
    }
    return data;
  }, [count]);
  const velocities = useMemo(() => {
    const data = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      data[i * 3] = (Math.random() - 0.5) * 0.16;
      data[i * 3 + 1] = (Math.random() - 0.5) * 0.16;
      data[i * 3 + 2] = (Math.random() - 0.5) * 0.16;
    }
    return data;
  }, [count]);

  useFrame(({ clock }) => {
    if (ref.current) {
      const positions = ref.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        positions[i * 3] += velocities[i * 3];
        positions[i * 3 + 1] += velocities[i * 3 + 1];
        positions[i * 3 + 2] += velocities[i * 3 + 2];

        if (positions[i * 3] > 12) positions[i * 3] = -12;
        if (positions[i * 3] < -12) positions[i * 3] = 12;
        if (positions[i * 3 + 1] > 12) positions[i * 3 + 1] = -12;
        if (positions[i * 3 + 1] < -12) positions[i * 3 + 1] = 12;
        if (positions[i * 3 + 2] > 12) positions[i * 3 + 2] = -12;
        if (positions[i * 3 + 2] < -12) positions[i * 3 + 2] = 12;
      }
      ref.current.geometry.attributes.position.needsUpdate = true;
      ref.current.geometry.computeBoundingSphere();
      ref.current.rotation.y = clock.elapsedTime * 0.12;
      ref.current.rotation.x = Math.sin(clock.elapsedTime * 0.1) * 0.08;
    }
  });

  return (
    <Points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <PointMaterial size={0.34} color="#c084fc" transparent opacity={0.9} sizeAttenuation />
    </Points>
  );
}

export default function AIParticles() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 10], fov: 70 }}>
        <ambientLight intensity={0.2} />
        <directionalLight position={[1, 2, 3]} intensity={0.4} color="#c084fc" />
        <MovingParticles />
      </Canvas>
    </div>
  );
}