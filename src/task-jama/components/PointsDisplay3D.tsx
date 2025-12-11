// task-jama/components/PointsDisplay3D.tsx

import React from 'react';
import { Text } from '@react-three/drei';

interface PointsDisplay3DProps {
  currentPoint: number;
  position?: [number, number, number];
}

const PointsDisplay3D: React.FC<PointsDisplay3DProps> = ({ currentPoint, position = [0, 0, 0] }) => {
  const displayColor = currentPoint < 50 ? '#dc3545' : '#ffc107';

  return (
    <group position={position}>
      {/* ポイント数値の表示 */}
      <Text
        fontSize={0.3}
        color={displayColor}
        anchorX="left"
        anchorY="middle"
      >
        {currentPoint} P
      </Text>
      
      {/* 説明テキスト */}
      <Text
        fontSize={0.1}
        color="#bbb"
        position={[0, -0.2, 0]}
        anchorX="left"
      >
        Points
      </Text>
    </group>
  );
};

export default PointsDisplay3D;