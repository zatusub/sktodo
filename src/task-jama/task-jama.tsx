import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html, OrbitControls, Text } from '@react-three/drei';

import PointsDisplay3D from './components/PointsDisplay3D';
import JamaButton3D from './components/JamaButton3D';
import FriendList3D from './components/FriendList3D';
import FriendTodo3D from './components/FriendTodo3D';
import AddFriend3D from './components/AddFriend3D';
import PendingRequests3D from './components/PendingRequests3D';

  interface Friend {
    id: string;
    name: string;
    email?: string;
  }

type Step = 'TASK_CLEAR' | 'ACCUMULATE_POINT' | 'JAMA_BUTTON_VIEW' | 'SELECT_FRIEND' | 'SELECT_JAMA_TODO' | 'ADD_FRIEND_VIEW' | 'PENDING_VIEW';

const JAMA_COST = 50;

const TaskJama: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>('JAMA_BUTTON_VIEW');
  const [userPoint, setUserPoint] = useState(100);
  const [targetFriendId, setTargetFriendId] = useState<string | null>(null);
  // レスポンシブ用スケール (基準: 390x844)
  const [scale, setScale] = useState<number>(1);


  const initialPendingRequests: Friend[] = [
    { id: 'userA', name: '佐藤 太郎', email: 'sato@example.com' },
    { id: 'userB', name: '鈴木 花子', email: 'suzuki@example.com' },
  ];

  const initialFriends: Friend[] = [
    { id: 'friend1', name: '田中 一郎' },
    { id: 'friend2', name: '山田 次郎' },
  ];

  const [pendingRequests, setPendingRequests] = useState(initialPendingRequests);
  const [,setFriends] = useState(initialFriends);

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

  const handleBack = () => {
    setCurrentStep('JAMA_BUTTON_VIEW');
  };

const handleProcessRequest = (requestId: string, action: 'ACCEPT' | 'REJECT') => {
    const requestToMove = pendingRequests.find(req => req.id === requestId);
    
    if (requestToMove) {
      // 承認の場合
      if (action === 'ACCEPT') {
        setFriends(prev => [...prev, requestToMove]); // フレンドリストに追加
      }
      
      // リクエストリストから削除
      setPendingRequests(prev => prev.filter(req => req.id !== requestId));
    }
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
            <PointsDisplay3D currentPoint={userPoint} position={[-1.5, 2.9, 0]} />
            
            {/* 戻るボタン */}
            {(currentStep === 'SELECT_FRIEND' || currentStep === 'SELECT_JAMA_TODO') && (
              <group position={[1, 2.8, 0]}>
                <mesh onClick={currentStep === 'SELECT_FRIEND' ? handleBackFromFriendList : handleBackFromTodoList} onPointerMove={(e: any) => { ((e.object.parent as any).canvas.style.cursor = 'pointer'); }}>
                  <planeGeometry args={[0.8, 0.4]} />
                  <meshStandardMaterial color="#555" />
                </mesh>
                <Text position={[0, 0, 0.01]} fontSize={0.14} color="white" anchorX="center" anchorY="middle">
                  戻る
                </Text>
              </group>
            )}
            
            {/* 邪魔するボタン */}
            <group scale={[scale, scale, scale]}>
              {currentStep === 'JAMA_BUTTON_VIEW' && (
                <group position={[0, -0.5, 0]}>
                <JamaButton3D 
                  currentPoint={userPoint} 
                  costPoint={JAMA_COST}
                  onJamaStart={handleJamaStart} 
                />

            {/* 友達追加ボタン */}
            <mesh position={[1, 3.3, 0]} onClick={() => setCurrentStep('ADD_FRIEND_VIEW')}>
            <boxGeometry args={[1, 0.4, 0.1]} />
            <meshStandardMaterial color="#007bff" />
            <Text position={[0, 0, 0.06]} fontSize={0.15} color="white">
                友達追加
            </Text>
            </mesh>

            {/* 承認待ちボタン */}
            <mesh 
              position={[0, 3.3, 0]} 
              onClick={() => setCurrentStep('PENDING_VIEW')}
            >
              <boxGeometry args={[1, 0.4, 0.1]} />
              <meshStandardMaterial color="#ffc107" /> {/* 黄色 */}
              <Text position={[0, 0, 0.06]} fontSize={0.15} color="black">
                承認待ち
              </Text>
            </mesh>
            </group>
              )}
              
              {currentStep === 'SELECT_FRIEND' && (
                <FriendList3D 
                
                onFriendSelect={handleFriendSelect} 
                />
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
              {currentStep === 'ADD_FRIEND_VIEW' && (
                <AddFriend3D onBack={() => setCurrentStep('JAMA_BUTTON_VIEW')} />
              )}
              {currentStep === 'PENDING_VIEW' && (
                <PendingRequests3D 
                  pendingRequests={pendingRequests}
                  onProcessRequest={handleProcessRequest}
                  onBack={handleBack} 
                />
              )}
            </group>

        </Canvas>
    </div>
  );
};

export default TaskJama;