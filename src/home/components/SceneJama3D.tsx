// src/home/components/SceneJama3D.tsx
import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type Props = {
  intensity?: number; // 0〜1
};

export default function SceneJama3D({ intensity = 0.3 }: Props) {
  const group = useRef<THREE.Group>(null);

  const count = 120;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 4 + Math.random() * 6;
      const t = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 6;
      arr[i * 3 + 0] = Math.cos(t) * r;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = Math.sin(t) * r;
    }
    return arr;
  }, []);

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * (0.15 + intensity * 0.6);
    group.current.rotation.x += delta * (0.03 + intensity * 0.2);
  });

  return (
    <group ref={group}>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={positions}
            count={positions.length / 3}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.06 + intensity * 0.12} />
      </points>
    </group>
  );
}
