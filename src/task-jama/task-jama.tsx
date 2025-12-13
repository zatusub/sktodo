// task-jama/TaskJama.tsx

import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html, OrbitControls, Text } from '@react-three/drei';

// コンポーネントのインポート
import PointsDisplay3D from './components/PointsDisplay3D';
import JamaButton3D from './components/JamaButton3D';
import FriendList3D from './components/FriendList3D';
import FriendTodo3D from './components/FriendTodo3D';
import AddFriend3D from './components/AddFriend3D';
import PendingRequests3D from './components/PendingRequests3D';

// Supabase と型をインポート
import { supabase } from '../lib/supabaseClient';
import { DbUser, Friend, PendingRequest } from '../types/db';

interface TaskJamaProps {
    userId: string;
}

type Step = 'TASK_CLEAR' | 'ACCUMULATE_POINT' | 'JAMA_BUTTON_VIEW' | 'SELECT_FRIEND' | 'SELECT_JAMA_TODO' | 'ADD_FRIEND_VIEW' | 'PENDING_VIEW';

const JAMA_COST = 50;
const TASK_GAIN = 10; // タスク完了時の獲得ポイント

const TaskJama: React.FC<TaskJamaProps> = ({ userId }) => {
  const [currentStep, setCurrentStep] = useState<Step>('JAMA_BUTTON_VIEW');
  const [userPoint, setUserPoint] = useState(0); 
  const [targetFriendId, setTargetFriendId] = useState<string | null>(null);
  const [scale, setScale] = useState<number>(1);
  const [currentUser, setCurrentUser] = useState<DbUser | null>(null);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]); 
  const [friends, setFriends] = useState<Friend[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingRequest, setIsProcessingRequest] = useState(false);

  // ----------------------------------------------------
  // 1. 初期データ取得 (DB接続)
  // ----------------------------------------------------

  // データをフェッチする共通関数を定義
  const fetchInitialData = async () => {
    setIsLoading(true);
    
    if (!userId) { 
      console.error("userId が設定されていません。");
      setIsLoading(false);
      return;
    }

    // ユーザー情報の取得とポイント更新
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (userError || !userData) {
      console.error('ユーザー情報取得エラー:', userError);
      setIsLoading(false); 
      return; 
    } else {
      setCurrentUser(userData as DbUser);
      setUserPoint(userData.points); 
    }

    // フレンドシップと承認待ちリクエストの取得
    const { data: fsData, error: fsError } = await supabase
      .from('friendships')
      .select(`
        friendship_id, 
        status, 
        user_id_1, 
        user_id_2, 
        requester_id,
        user1:user_id_1 (user_id, username, email),
        user2:user_id_2 (user_id, username, email)
      `)
      .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`);

    if (fsData && !fsError) {
      const acceptedFriends: Friend[] = [];
      const pending: PendingRequest[] = [];
      
      fsData.forEach((fs: any) => {
          const counterParty = fs.user_id_1 === userId ? fs.user2 : fs.user1;
          const requesterInfo = fs.requester_id === fs.user_id_1 ? fs.user1 : fs.user2;

          if (fs.status === 'ACCEPTED') {
              acceptedFriends.push({ user_id: counterParty.user_id, username: counterParty.username });
          } 
          else if (fs.status === 'PENDING' && fs.requester_id !== userId) {
              pending.push({ 
                  friendship_id: fs.friendship_id, 
                  requester_id: requesterInfo.user_id, 
                  username: requesterInfo.username, 
                  email: requesterInfo.email 
              });
          }
      });
      setFriends(acceptedFriends);
      setPendingRequests(pending);
    } else if (fsError) {
      console.error('フレンドシップ情報取得エラー:', fsError);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchInitialData();
  }, [userId]); 
  
  // レスポンシブ用スケール
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

  // ----------------------------------------------------
  // 2. 関数定義 (DB連携ロジックを含む)
  // ----------------------------------------------------

  // ポイント獲得時にDBを更新するロジック
  const handlePointGain = async (gain: number = TASK_GAIN) => {
    if (!currentUser) {
      return;
    }
    
    const newPoints = currentUser.points + gain;

    const { error: userUpdateError } = await supabase
      .from('users')
      .update({ 
          points: newPoints,
          updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
      
    if (userUpdateError) {
      console.error('ポイント獲得更新エラー:', userUpdateError);
      alert('ポイント獲得の記録に失敗しました。');
    } else {
      // State を更新
      setUserPoint(newPoints);
      setCurrentUser(prev => prev ? { ...prev, points: newPoints } : null);
      setCurrentStep('JAMA_BUTTON_VIEW'); // 完了後、メイン画面に戻る
    }
  }; 

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
  
  // 妨害完了時の処理
  const handleJamaComplete = async (targetTodoId: string) => {
    if (!currentUser || currentUser.points < JAMA_COST) {
      alert("処理エラー: ユーザー情報が見つからないか、ポイントが不足しています。");
      setCurrentStep('JAMA_BUTTON_VIEW');
      return;
    }

    try {
      // 1. ユーザーのポイントを更新 (ポイント消費)
      const newPoints = currentUser.points - JAMA_COST; // JAMA_COST は 50
      
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({ 
              points: newPoints,
              updated_at: new Date().toISOString() 
          })
        .eq('user_id', userId);
        
      if (userUpdateError) {
        throw new Error(`ポイント更新エラー: ${userUpdateError.message}`);
      }
      
      // 2. disruptions テーブルに妨害レコードを挿入
      const { error: disruptInsertError } = await supabase
        .from('disruptions')
        .insert({
          disruptor_id: userId,
          target_todo_id: targetTodoId,
          points_spent: JAMA_COST,
          disruption_type: 'mojibake',
        });

      if (disruptInsertError) {
        throw new Error(`妨害挿入エラー: ${disruptInsertError.message}`);
      }

      // 3. フロントエンドのStateを更新し、画面遷移 (成功時のみ)
      setUserPoint(newPoints);
      setCurrentUser(prev => prev ? { ...prev, points: newPoints } : null);
      setTargetFriendId(null);
      setCurrentStep('JAMA_BUTTON_VIEW');
      alert('妨害に成功しました！'); // 成功通知
      
    } catch (error) {
      console.error('妨害完了処理中にエラーが発生:', error);
      alert(`妨害処理に失敗しました。詳細: ${error instanceof Error ? error.message : '不明なエラー'}`);
      // エラー発生時もメイン画面に戻る
      setTargetFriendId(null);
      setCurrentStep('JAMA_BUTTON_VIEW');
    }
  };

  const handleBack = () => {
    setCurrentStep('JAMA_BUTTON_VIEW');
  };

// リクエスト承認/拒否の処理
const handleProcessRequest = async (friendshipId: string, action: 'ACCEPT' | 'REJECT') => {
    // 1. ロックのチェック
    if (isProcessingRequest) return; // 処理中は無視
    setIsProcessingRequest(true); // ロック

    const newStatus = action === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED';

    try {
      // 1. Supabase の friendships テーブルの status を更新
      const { error } = await supabase
        .from('friendships')
        .update({ 
              status: newStatus,
              responded_at: new Date().toISOString(),
          })
        .eq('friendship_id', friendshipId);
      
      if (error) {
        throw new Error(`DB更新エラー: ${error.message}`);
      }
      
      // 2. フロントエンドの State を更新
      const requestToMove = pendingRequests.find(req => req.friendship_id === friendshipId);
      
      if (requestToMove && action === 'ACCEPT') {
        // 承認の場合、フレンドリストに追加
        setFriends(prev => [...prev, { user_id: requestToMove.requester_id, username: requestToMove.username }]);
      }
      
      // 承認/拒否されたリクエストをリストから削除
      setPendingRequests(prev => prev.filter(req => req.friendship_id !== friendshipId));
      
      alert(action === 'ACCEPT' ? 'フレンドを承認しました。' : 'リクエストを拒否しました。');
      
    } catch (error) {
      console.error('リクエスト処理中にエラーが発生:', error);
      alert(`リクエストの処理に失敗しました。詳細: ${error instanceof Error ? error.message : '不明なエラー'}`);
    } finally {
      setIsProcessingRequest(false); // アンロック
    }
  };
  
  // ----------------------------------------------------
  // 3. JSXレンダリング
  // ----------------------------------------------------

  if (isLoading) {
    return (
      <div style={{ width: '100vw', height: '100vh', backgroundColor: '#000', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <h1>Loading now...</h1>
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#000' }}> 
        <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
            <color attach="background" args={["#000"]} />
            <ambientLight intensity={1} />
            <pointLight position={[5, 5, 5]} intensity={1} />
            <OrbitControls makeDefault />
            
            {/* ポイント表示 (位置を調整: 左上) */}
            <PointsDisplay3D currentPoint={userPoint} position={[-1.5, 2.9, 0]} />
            
            {/* 戻るボタン (FriendList/FriendTodo 用) */}
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
            
            <group scale={[scale, scale, scale]}>
              {currentStep === 'JAMA_BUTTON_VIEW' && (
                <group position={[0, -0.5, 0]}>
                <JamaButton3D 
                  currentPoint={userPoint} 
                  costPoint={JAMA_COST}
                  onJamaStart={handleJamaStart} 
                />

                {/* 友達追加ボタン */}
                <mesh 
                  position={[1, 3.3, 0]} 
                  onClick={() => setCurrentStep('ADD_FRIEND_VIEW')}
                  onPointerMove={(e: any) => { 
                    try {
                      ((e.object.parent as any).canvas.style.cursor = 'pointer'); 
                    } catch (error) {
                      // カーソル設定に失敗しても、アプリの動作は止めない
                    }
                  }}
                >
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
                  onPointerMove={(e: any) => { ((e.object.parent as any).canvas.style.cursor = 'pointer'); }}
                >
                  <boxGeometry args={[1, 0.4, 0.1]} />
                  <meshStandardMaterial color={pendingRequests.length > 0 ? "#dc3545" : "#ffc107"} /> 
                  <Text position={[0, 0, 0.06]} fontSize={0.15} color="black">
                    承認待ち ({pendingRequests.length})
                  </Text>
                </mesh>
                </group>
              )}
              
              {currentStep === 'SELECT_FRIEND' && (
                <FriendList3D 
                  friends={friends} 
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
                // タスク完了によるポイント獲得テスト用の UI
                <Html position={[0, 0, 0]} transform style={{ width: '400px', backgroundColor: 'rgba(0,0,0,0.8)', padding: '20px', borderRadius: '8px', color: 'white' }}>
                  <div> 
                    <h2>タスクを実行中...</h2>
                    <p>現在のポイント: {userPoint} P</p>
                    <button 
                      style={{ padding: '10px', margin: '5px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                      onClick={() => { handlePointGain(TASK_GAIN); }}
                    >
                      タスクを完了してポイント獲得！ (+{TASK_GAIN}P)
                    </button>
                  </div>
                </Html>
              )}
              {currentStep === 'ADD_FRIEND_VIEW' && (
                <AddFriend3D 
                    currentUserId={userId}
                    onBack={() => setCurrentStep('JAMA_BUTTON_VIEW')} 
                />
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