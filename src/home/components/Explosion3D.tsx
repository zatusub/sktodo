import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type Props = {
  position?: [number, number, number];
  onFinish?: () => void;
};

export default function Explosion3D({ position = [0, 0, 0], onFinish }: Props) {
  const group = useRef<THREE.Group>(null!);
  const born = useRef(performance.now());

  const particles = useMemo(() => {
    const n = 80;
    return Array.from({ length: n }).map(() => {
      const v = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 1
      ).normalize().multiplyScalar(0.6 + Math.random() * 2.2);

      return {
        vel: v,
        pos: new THREE.Vector3(0, 0, 0),
        s: 0.05 + Math.random() * 0.12,
      };
    });
  }, []);

  useFrame((_, delta) => {
    if (!group.current) return;

    const t = (performance.now() - born.current) / 1000;
    if (t > 0.9) {
      onFinish?.();
      return;
    }

    // パーティクル更新
    group.current.children.forEach((child, i) => {
      const p = particles[i];
      p.pos.addScaledVector(p.vel, delta);
      // 重力っぽく
      p.vel.y -= delta * 2.2;

      child.position.set(p.pos.x, p.pos.y, p.pos.z);
      const k = 1 - t;
      child.scale.setScalar(p.s * (0.6 + k));
    });

    group.current.position.set(position[0], position[1], position[2]);
  });

  return (
    <group ref={group}>
      {particles.map((p, i) => (
        <mesh key={i}>
          <sphereGeometry args={[1, 10, 10]} />
          <meshStandardMaterial
            color={"#ff0000"}
            emissive={"#ffff00"}
            emissiveIntensity={2.2}
            transparent
            opacity={0.95}
          />
        </mesh>
      ))}
    </group>
  );
}
