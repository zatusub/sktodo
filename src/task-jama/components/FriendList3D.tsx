// task-jama/components/FriendList3D.tsx

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

import { Friend } from '../../types/db'; 

// --- Props定義 ---
interface FriendList3DProps {
  friends: Friend[]; 
  onFriendSelect: (friendId: string) => void;
}

// FriendItem コンポーネント
const FriendItem: React.FC<{ 
    friend: Friend; 
    index: number; 
    onSelect: (user_id: string) => void 
}> = ({ friend, index, onSelect }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  // 前面表示用マテリアル（再生成を避ける）
  const frontMat = useMemo(() => new THREE.MeshBasicMaterial({ depthTest: false, transparent: true }), []);

  const yPos = -index * 0.8;
  const color = hovered ? '#3a3a3a' : '#2b2b2b';

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, hovered ? 0.15 : 0, 0.12);
    }
  });

  const handleClick = () => {
    if (window.confirm(`${friend.username} さんに実行しますか？`)) {
      onSelect(friend.user_id);
    }
  };

  return (
    <group position={[0, yPos, 0]}>
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onPointerMove={(e) => ((e.object.parent as any).canvas.style.cursor = 'pointer')}
      >
        <planeGeometry args={[3.2, 0.6]} />
        <meshStandardMaterial color={color} />
      </mesh>

      <Text position={[-1.3, 0, 0.20]} fontSize={0.18} color="white" anchorX="left" anchorY="middle">
        {friend.username} 
      </Text>

      <Text position={[1.1, 0, 0.25]} fontSize={0.18} color="#dc3545" anchorX="right" anchorY="middle" material={frontMat}>
        実行
      </Text>
    </group>
  );
};

// FriendList3D コンポーネント
const FriendList3D: React.FC<FriendList3DProps> = ({ friends, onFriendSelect }) => {
  
  const [scrollOffset, setScrollOffset] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const listRef = useRef<THREE.Group>(null!);

  // スクロールロジック
  useEffect(() => {
    // friends は Props から来るため、依存配列に追加
    const onWheel = (e: WheelEvent) => {
      if (!isHovering) return;
      const delta = e.deltaY * 0.01; 
      const max = Math.max(0, friends.length * 0.8 - 2.4);
      setScrollOffset(prev => Math.min(Math.max(0, prev + delta), max));
    };
    window.addEventListener('wheel', onWheel, { passive: true });
    return () => window.removeEventListener('wheel', onWheel as any);
  }, [isHovering, friends]);

  if (friends.length === 0) {
    return (
      <Text position={[0, 0, 0]} fontSize={0.2} color="#bbb">
        フレンドがいません。
      </Text>
    );
  }

  const listHeight = Math.max(2.4, friends.length * 0.8);

  return (
    <group position={[0, 1.0, 0]}> 
      <Text position={[0, 0.6, 0]} fontSize={0.28} color="white" anchorY="bottom">
        ターゲットを選んでください
      </Text>

      <group position={[0, -0.2 - scrollOffset, 0]} ref={listRef}>
        <mesh
          position={[0, -listHeight / 2 + 0.6, -0.01]}
          onPointerOver={() => setIsHovering(true)}
          onPointerOut={() => setIsHovering(false)}
        >
          <planeGeometry args={[3.6, listHeight]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>

        {friends.map((friend, index) => (
          <FriendItem 
            key={friend.user_id} 
            friend={friend} 
            index={index} 
            onSelect={onFriendSelect} 
          />
        ))}
      </group>
    </group>
  );
};

export default FriendList3D;