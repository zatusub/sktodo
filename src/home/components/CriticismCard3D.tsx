import React from 'react';
import { Text } from '@react-three/drei';
import type { Criticism } from '../../api/models';

interface CriticismCard3DProps {
  criticism: Criticism | null;
}

const CriticismCard3D: React.FC<CriticismCard3DProps> = ({ criticism }) => {
  const cardColor = '#222';

  return (
    <group position={[0, 2.2, 0]}>
      {/* 批判カード */}
      <mesh>
        <planeGeometry args={[3.4, 1.0]} />
        <meshStandardMaterial color={cardColor} />
      </mesh>

      {/* 「批判・煽り」タイトル */}
      <Text
        position={[-1.6, 0.35, 0.05]}
        fontSize={0.15}
        color="#ff6b6b"
        anchorX="left"
        anchorY="middle"
      >
        批判・煽り
      </Text>

      {/* 批判メッセージ */}
      {criticism ? (
        <>
          <Text
            position={[-1.6, 0.0, 0.05]}
            fontSize={0.11}
            color="#f1f1f1"
            anchorX="left"
            anchorY="top"
            maxWidth={3.0}
          >
            {criticism.message}
          </Text>

          {/* 送信者情報 */}
          <Text
            position={[-1.6, -0.35, 0.05]}
            fontSize={0.1}
            color="#aaa"
            anchorX="left"
            anchorY="middle"
          >
            from {criticism.username}
          </Text>
        </>
      ) : (
        <Text
          position={[0, 0, 0.05]}
          fontSize={0.11}
          color="#666"
          anchorX="center"
          anchorY="middle"
        >
          批判はまだありません
        </Text>
      )}
    </group>
  );
};

export default CriticismCard3D;
