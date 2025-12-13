// task-jama/components/JamaButton3D.tsx

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface JamaButton3DProps {
  currentPoint: number;
  costPoint: number;
  onJamaStart: () => void;
}

const JamaButton3D: React.FC<JamaButton3DProps> = ({ 
  currentPoint, 
  costPoint, 
  onJamaStart 
}) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  const isEnoughPoint = currentPoint >= costPoint;
  // ポイントが足りない場合はボタンをグレーにする
  const buttonColor = isEnoughPoint ? (hovered ? '#e8455a' : '#dc3545') : '#6c757d'; 
  // 絵文字を除去したラベル
  const textContent = isEnoughPoint ? '邪魔する' : 'ポイント不足';

  // フレームごとの処理: ホバー時に前方に少し浮き出す (position.z を滑らかに補間)
  useFrame(() => {
    if (meshRef.current) {
      const targetZ = hovered ? 0.2 : 0;
      meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, targetZ, 0.15);
    }
  });

  const handleClick = () => {
    if (isEnoughPoint) {
      // クリック時にボタンが沈むアニメーションを一時的に実行
      meshRef.current.position.z = 0.1;
      setTimeout(() => {
        meshRef.current.position.z = 0;
      }, 100);
      onJamaStart();
    } else {
      console.warn('ポイントが足りません！');
    }
  };

  return (
    // positionはメインの<group>の位置から相対的に決定される
    <group position={[0, -0.5, 0]}> 
      {/* 3Dボタン本体 (キューブ) */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={() => setHovered(isEnoughPoint)} // ポイントがある場合のみホバーを有効にする
        onPointerOut={() => setHovered(false)}
        // ポイント不足時はカーソルをデフォルトに戻す
        onPointerMove={(e) => {
            try {
              if (isEnoughPoint) {
                  (e.object.parent as any).canvas.style.cursor = 'pointer';
              } else {
                  (e.object.parent as any).canvas.style.cursor = 'default';
              }
            } catch {
              // 念のためのセーフガード
            }
        }}
      >
        <boxGeometry args={[3, 0.6, 0.2]} />
        <meshStandardMaterial color={buttonColor} />
      </mesh>

      {/* ボタンに貼り付けるテキスト */}
      <Text
        position={[0, 0, 0.21]} // ボタンの前面に少し張り付ける
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
        renderOrder={999}
      >
        {textContent}
        <meshStandardMaterial depthTest={false} />
      </Text>
      
      {/* コスト表示テキスト */}
      <Text
        position={[0, -0.4, 0]}
        fontSize={0.15}
        color={isEnoughPoint ? 'lightgreen' : 'red'}
        anchorX="center"
      >
        {`コスト: ${costPoint} P (現在: ${currentPoint} P)`}
      </Text>
    </group>
  );
};

export default JamaButton3D;