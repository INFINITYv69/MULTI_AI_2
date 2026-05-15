import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial, Float } from "@react-three/drei";
import * as THREE from "three";

import { Landmark, Banknote, Mic, Users, TrendingUp, CreditCard, Coins, CircleDollarSign, Percent, Calculator } from "lucide-react";
import { Html } from "@react-three/drei";

function FloatingAbstractFinancials() {
  const icons = [
    { Icon: Banknote, position: [-4, 2, -2], color: "text-emerald-400", shadow: "shadow-emerald-500/20" },
    { Icon: Landmark, position: [4, 1.5, -3], color: "text-blue-400", shadow: "shadow-blue-500/20" },
    { Icon: Mic, position: [-3.5, -1.5, -1], color: "text-purple-400", shadow: "shadow-purple-500/20" },
    { Icon: Users, position: [3.5, -1, -2], color: "text-pink-400", shadow: "shadow-pink-500/20" },
    { Icon: TrendingUp, position: [0, 2.5, -4], color: "text-amber-400", shadow: "shadow-amber-500/20" },
    { Icon: CreditCard, position: [2, -2.5, -1.5], color: "text-indigo-400", shadow: "shadow-indigo-500/20" },
    { Icon: Coins, position: [-2, 3, -2.5], color: "text-yellow-400", shadow: "shadow-yellow-500/20" },
    { Icon: CircleDollarSign, position: [1.5, 3.5, -3], color: "text-green-400", shadow: "shadow-green-500/20" },
    { Icon: Percent, position: [-4.5, -0.5, -1.5], color: "text-rose-400", shadow: "shadow-rose-500/20" },
    { Icon: Calculator, position: [4.5, 0, -2], color: "text-cyan-400", shadow: "shadow-cyan-500/20" },
  ];

  return (
    <>
      {icons.map((item, index) => (
        <Float 
          key={index}
          speed={2 + Math.random()} 
          rotationIntensity={0.8} 
          floatIntensity={2} 
          position={item.position as [number, number, number]}
        >
          <Html 
            transform 
            distanceFactor={5} 
            zIndexRange={[100, 0]}
            className="pointer-events-none"
          >
            <div className={`flex items-center justify-center w-16 h-16 rounded-full bg-slate-950/40 border border-white/10 backdrop-blur-xl ${item.shadow} shadow-2xl transition-all duration-500`}>
              <item.Icon className={`w-8 h-8 ${item.color} drop-shadow-md`} />
            </div>
          </Html>
        </Float>
      ))}
      
      {/* Add some soft background glowing orbs to enhance the 3D depth */}
      <Float speed={1} rotationIntensity={1} floatIntensity={1} position={[-2, 1, -5]}>
        <mesh>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshBasicMaterial color="#a855f7" transparent opacity={0.1} />
        </mesh>
      </Float>
      <Float speed={1.5} rotationIntensity={1} floatIntensity={1} position={[3, -1, -6]}>
        <mesh>
          <sphereGeometry args={[0.8, 32, 32]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.1} />
        </mesh>
      </Float>
    </>
  );
}

function AnimatedSphere() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = clock.elapsedTime * 0.12;
      meshRef.current.rotation.y = clock.elapsedTime * 0.16;
    }
  });

  return (
    <Sphere ref={meshRef} args={[1, 32, 32]} scale={1.5}>
      <MeshDistortMaterial
        color="#e9d5ff"
        attach="material"
        distort={0.1}
        speed={0.5}
        roughness={0.3}
        metalness={0.5}
        transparent
        opacity={0.4}
      />
    </Sphere>
  );
}

function Particles() {
  const ref = useRef<THREE.Points>(null);
  const count = 200;
  const positions = useMemo(() => {
    const data = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      data[i * 3] = (Math.random() - 0.5) * 8;
      data[i * 3 + 1] = (Math.random() - 0.5) * 8;
      data[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return data;
  }, [count]);
  const velocities = useMemo(() => {
    const data = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      data[i * 3] = (Math.random() - 0.5) * 0.08;
      data[i * 3 + 1] = (Math.random() - 0.5) * 0.08;
      data[i * 3 + 2] = (Math.random() - 0.5) * 0.08;
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

        if (positions[i * 3] > 4) positions[i * 3] = -4;
        if (positions[i * 3] < -4) positions[i * 3] = 4;
        if (positions[i * 3 + 1] > 4) positions[i * 3 + 1] = -4;
        if (positions[i * 3 + 1] < -4) positions[i * 3 + 1] = 4;
        if (positions[i * 3 + 2] > 4) positions[i * 3 + 2] = -4;
        if (positions[i * 3 + 2] < -4) positions[i * 3 + 2] = 4;
      }
      ref.current.geometry.attributes.position.needsUpdate = true;
      ref.current.geometry.computeBoundingSphere();
      ref.current.rotation.y = clock.elapsedTime * 0.12;
      ref.current.rotation.x = Math.sin(clock.elapsedTime * 0.08) * 0.05;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.015} color="#e9d5ff" transparent opacity={0.45} sizeAttenuation />
    </points>
  );
}

interface HeroSceneProps {
  className?: string;
}

export default function HeroScene({ className = "absolute inset-0 -z-10" }: HeroSceneProps) {
  return (
    <div className={className}>
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <ambientLight intensity={0.15} />
        <directionalLight position={[3, 3, 3]} intensity={0.5} color="#e9d5ff" />
        <pointLight position={[-2, -2, -2]} color="#f3e8ff" intensity={0.3} />
        <AnimatedSphere />
        <Particles />
        <FloatingAbstractFinancials />
      </Canvas>
    </div>
  );
}
