import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html, OrbitControls, Text } from '@react-three/drei';

import PointsDisplay3D from './components/PointsDisplay3D';
import JamaButton3D from './components/JamaButton3D';
import FriendList3D from './components/FriendList3D';
import FriendTodo3D from './components/FriendTodo3D';

type Step = 'TASK_CLEAR' | 'ACCUMULATE_POINT' | 'JAMA_BUTTON_VIEW' | 'SELECT_FRIEND' | 'SELECT_JAMA_TODO';

const JAMA_COST = 50;

const TaskJama: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>('JAMA_BUTTON_VIEW');
  const [userPoint, setUserPoint] = useState(100);
  const [targetFriendId, setTargetFriendId] = useState<string | null>(null);
  // レスポンシブ用スケール (基準: 390x844)
  const [scale, setScale] = useState<number>(1);

  useEffect(() => {
    const updateScale = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const s = Math.min(w / 390, h / 844);
      setScale(s);
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const handlePointConsume = (cost: number) => setUserPoint((prev: number) => prev - cost);
  const handlePointGain = (gain: number) => setUserPoint((prev: number) => prev + gain);

  const handleJamaStart = () => {
    if (userPoint >= JAMA_COST) {
      setCurrentStep('SELECT_FRIEND');
    } else {
      alert('ポイントが足りません！');
    }
  };

  const handleFriendSelect = (friendId: string) => {
    setTargetFriendId(friendId);
    setCurrentStep('SELECT_JAMA_TODO');
  };

  const handleBackFromFriendList = () => {
    setCurrentStep('JAMA_BUTTON_VIEW');
  };

  const handleBackFromTodoList = () => {
    setTargetFriendId(null);
    setCurrentStep('SELECT_FRIEND');
  };
  
  const handleJamaComplete = () => {
    handlePointConsume(JAMA_COST); 
    setTargetFriendId(null);
    setCurrentStep('JAMA_BUTTON_VIEW');
  };

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#000' }}> 
        <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
            {/* シーンの背景を黒に設定 */}
            <color attach="background" args={["#000"]} />
            
            <ambientLight intensity={1} />
            <pointLight position={[5, 5, 5]} intensity={1} />
            
            <OrbitControls makeDefault />
            
            {/* ポイント表示 */}
            <PointsDisplay3D currentPoint={userPoint} position={[-1.5, 3, 0]} />
            
            {/* 戻るボタン（右上、ポイント表示と同じ高さ） */}
            {(currentStep === 'SELECT_FRIEND' || currentStep === 'SELECT_JAMA_TODO') && (
              <group position={[1.5, 3, 0]}>
                <mesh onClick={currentStep === 'SELECT_FRIEND' ? handleBackFromFriendList : handleBackFromTodoList} onPointerMove={(e: any) => { ((e.object.parent as any).canvas.style.cursor = 'pointer'); }}>
                  <planeGeometry args={[0.8, 0.4]} />
                  <meshStandardMaterial color="#555" />
                </mesh>
                <Text position={[0, 0, 0.01]} fontSize={0.14} color="white" anchorX="center" anchorY="middle">
                  戻る
                </Text>
              </group>
            )}
            
            {/* メイン3D UI */}
            <group scale={[scale, scale, scale]}>
              {currentStep === 'JAMA_BUTTON_VIEW' && (
                <JamaButton3D 
                  currentPoint={userPoint} 
                  costPoint={JAMA_COST}
                  onJamaStart={handleJamaStart} 
                />
              )}
              
              {currentStep === 'SELECT_FRIEND' && (
                <FriendList3D onFriendSelect={handleFriendSelect} />
              )}

              {currentStep === 'SELECT_JAMA_TODO' && targetFriendId && (
                <FriendTodo3D 
                  friendId={targetFriendId} 
                  onJamaComplete={handleJamaComplete}
                />
              )}
              
              {(currentStep === 'ACCUMULATE_POINT' || currentStep === 'TASK_CLEAR') && (
                <Html position={[0, 0, 0]} transform style={{ width: '400px', backgroundColor: 'rgba(0,0,0,0.8)', padding: '20px', borderRadius: '8px', color: 'white' }}>
                  <div> 
                    <h2>タスク中...</h2>
                    <button onClick={() => { handlePointGain(10); }}>
                      タスクを完了してポイント獲得！ (+10P)
                    </button>
                  </div>
                </Html>
              )}
            </group>

        </Canvas>
    </div>
  );
};

export default TaskJama;