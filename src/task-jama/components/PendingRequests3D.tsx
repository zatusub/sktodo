// task-jama/components/PendingRequests3D.tsx

import React, { useState } from 'react';
import { Text } from '@react-three/drei';

import { PendingRequest } from '../../types/db'; 

// --- Props定義 ---
interface PendingRequests3DProps {
  pendingRequests: PendingRequest[];
  onProcessRequest: (friendshipId: string, action: 'ACCEPT' | 'REJECT') => void;
  onBack: () => void;
}

const PendingRequests3D: React.FC<PendingRequests3DProps> = ({ pendingRequests, onProcessRequest, onBack }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const LIST_START_Y = 1.0;
  const ITEM_SPACING = 0.6;

  return (
    <group position={[0, 0, 0]}>
      {/* タイトル */}
      <Text position={[0, 1.8, 0]} fontSize={0.3} color="white">
        フレンドリクエスト一覧
      </Text>

      {/* 戻るボタン */}
      <group position={[1, 2.8, 0]}> 
        <mesh onClick={onBack} onPointerMove={(e: any) => { ((e.object.parent as any).canvas.style.cursor = 'pointer'); }}>
          <planeGeometry args={[0.8, 0.4]} /> 
          <meshStandardMaterial color="#555" /> 
        </mesh>
        <Text position={[0, 0, 0.01]} fontSize={0.14} color="white" anchorX="center" anchorY="middle"> 
          戻る
        </Text>
      </group>
      
      {/* リクエストリストの表示 */}
      {pendingRequests.length === 0 ? (
        <Text position={[0, 0, 0]} fontSize={0.2} color="#bbb">
          新しいリクエストはありません
        </Text>
      ) : (
        pendingRequests.map((request, index) => {
          const yPos = LIST_START_Y - index * ITEM_SPACING;
          const isHovered = hoveredId === request.friendship_id; 

          return (
            <group 
              key={request.friendship_id} 
              position={[0, yPos, 0]}
              onPointerOver={() => setHoveredId(request.friendship_id)}
              onPointerOut={() => setHoveredId(null)}
            >
              {/* リストアイテムの背景 */}
              <mesh>
                <planeGeometry args={[3.5, 0.5]} />
                <meshStandardMaterial color={isHovered ? '#333' : '#111'} transparent opacity={0.8} />
              </mesh>

              {/* ユーザー名 */}
              <Text position={[-1.5, 0, 0.01]} fontSize={0.2} color="white" anchorX="left">
                {request.username}
              </Text>

              {/* 承認ボタン */}
              <mesh 
                position={[0.7, 0, 0.01]} 
                onClick={() => onProcessRequest(request.friendship_id, 'ACCEPT')}
                onPointerMove={(e: any) => { ((e.object.parent as any).canvas.style.cursor = 'pointer'); }}
              >
                <boxGeometry args={[0.5, 0.4, 0.1]} />
                <meshStandardMaterial color="#28a745" /> {/* 緑色 */}
                <Text position={[0, 0, 0.06]} fontSize={0.15} color="white">
                  承認
                </Text>
              </mesh>

              {/* 拒否ボタン */}
              <mesh 
                position={[1.3, 0, 0.01]} 
                onClick={() => onProcessRequest(request.friendship_id, 'REJECT')}
                onPointerMove={(e: any) => { ((e.object.parent as any).canvas.style.cursor = 'pointer'); }}
              >
                <boxGeometry args={[0.5, 0.4, 0.1]} />
                <meshStandardMaterial color="#dc3545" /> {/* 赤色 */}
                <Text position={[0, 0, 0.06]} fontSize={0.15} color="white">
                  拒否
                </Text>
              </mesh>

            </group>
          );
        })
      )}
    </group>
  );
};

export default PendingRequests3D;