// Friend list 3D component

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface Friend {
  id: string;
  name: string;
  avatarUrl: string;
}

const MOCK_FRIENDS: Friend[] = [
  { id: 'u001', name: '田中 太郎', avatarUrl: '...' },
  { id: 'u002', name: '佐藤 花子', avatarUrl: '...' },
  { id: 'u003', name: '鈴木 次郎', avatarUrl: '...' },
  { id: 'u004', name: '山田 花子', avatarUrl: '...' },
  { id: 'u005', name: '高橋 次郎', avatarUrl: '...' },
];

interface FriendList3DProps {
  onFriendSelect: (friendId: string) => void;
}

const FriendItem: React.FC<{ friend: Friend; index: number; onSelect: (id: string) => void }> = ({ friend, index, onSelect }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  // 前面表示用マテリアル（再生成を避ける）
  const frontMat = useMemo(() => new THREE.MeshBasicMaterial({ depthTest: false, transparent: true }), []);

  const yPos = -index * 0.8;
  // ベースを #2b2b2b にしてホバー時はやや明るめにする
  const color = hovered ? '#3a3a3a' : '#2b2b2b';

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, hovered ? 0.15 : 0, 0.12);
    }
  });

  const handleClick = () => {
    if (window.confirm(`${friend.name} さんに実行しますか？`)) {
      onSelect(friend.id);
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
        {friend.name}
      </Text>

      <Text position={[1.1, 0, 0.25]} fontSize={0.18} color="#dc3545" anchorX="right" anchorY="middle" material={frontMat}>
        実行
      </Text>
    </group>
  );
};

const FriendList3D: React.FC<FriendList3DProps> = ({ onFriendSelect }) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const listRef = useRef<THREE.Group>(null!);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setFriends(MOCK_FRIENDS);
      setIsLoading(false);
    }, 400);
  }, []);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (!isHovering) return;
      const delta = e.deltaY * 0.01; // 調整
      const max = Math.max(0, friends.length * 0.8 - 2.4);
      setScrollOffset(prev => Math.min(Math.max(0, prev + delta), max));
    };
    window.addEventListener('wheel', onWheel, { passive: true });
    return () => window.removeEventListener('wheel', onWheel as any);
  }, [isHovering, friends]);

  if (isLoading) {
    return (
      <Text position={[0, 0, 0]} fontSize={0.2} color="#bbb">
        友達リストを読み込み中...
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
          <FriendItem key={friend.id} friend={friend} index={index} onSelect={onFriendSelect} />
        ))}
      </group>
    </group>
  );
};

export default FriendList3D;