import React from 'react';
import { Text } from '@react-three/drei';

interface UserCardProps {
  username: string;
  points: number;
}

const UserCard3D: React.FC<UserCardProps> = ({ username, points }) => {
  const cardColor = '#222';
  const displayColor = points < 500 ? '#dc3545' : '#ffc107';

  return (
    <group position={[0, 3.2, 0]}>
      {/* ユーザー情報カード */}
      <mesh>
        <planeGeometry args={[3.4, 0.45]} />
        <meshStandardMaterial color={cardColor} />
      </mesh>

      {/* ユーザー名 */}
      <Text
        position={[-1.6, 0, 0.05]}
        fontSize={0.13}
        color="#fff"
        anchorX="left"
        anchorY="middle"
      >
        {username}
      </Text>

      {/* ポイント表示 */}
      <Text
        position={[1.6, 0, 0.05]}
        fontSize={0.13}
        color={displayColor}
        anchorX="right"
        anchorY="middle"
      >
        {points} P
      </Text>
    </group>
  );
};

export default UserCard3D;
