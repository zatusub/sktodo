import React from 'react';
import { Text } from '@react-three/drei';

interface NavigationArrowsProps {
  onLeft: () => void;
  onRight: () => void;
  disableLeft?: boolean;
  disableRight?: boolean;
}

const NavigationArrows3D: React.FC<NavigationArrowsProps> = ({
  onLeft,
  onRight,
  disableLeft = false,
  disableRight = false,
}) => {
  return (
    <group position={[0, -3.1, 0]}>
      {/* 左矢印 */}
      <group
        position={[-1.5, 0, 0]}
        onClick={!disableLeft ? onLeft : undefined}
        onPointerOver={(e) => {
          if (!disableLeft) {
            (e.object.parent as any).cursor = 'pointer';
          }
        }}
      >
        <mesh>
          <planeGeometry args={[0.6, 0.6]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
        <Text
          position={[0, 0, 0.05]}
          fontSize={0.25}
          color={disableLeft ? '#333' : '#f8f8f8'}
          anchorX="center"
          anchorY="middle"
        >
          ←
        </Text>
      </group>

      {/* 右矢印 */}
      <group
        position={[1.5, 0, 0]}
        onClick={!disableRight ? onRight : undefined}
        onPointerOver={(e) => {
          if (!disableRight) {
            (e.object.parent as any).cursor = 'pointer';
          }
        }}
      >
        <mesh>
          <planeGeometry args={[0.6, 0.6]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
        <Text
          position={[0, 0, 0.05]}
          fontSize={0.25}
          color={disableRight ? '#333' : '#f8f8f8'}
          anchorX="center"
          anchorY="middle"
        >
          →
        </Text>
      </group>
    </group>
  );
};

export default NavigationArrows3D;
