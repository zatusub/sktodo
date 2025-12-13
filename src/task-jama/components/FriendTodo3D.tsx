// task-jama/components/FriendTodo3D.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createMojibakeText } from './todo-mojibake'; 

import { supabase } from '../../lib/supabase'; 
import { Todo } from '../../types/db'; 

// --- データ型と定数の定義 ---
const JAMA_COST = 50; 

// --- Props定義 ---
interface FriendTodo3DProps {
  friendId: string;
  // onJamaComplete は TaskJama.tsx でポイント消費と Disruption 登録を行う
  onJamaComplete: (targetTodoId: string) => Promise<void>; 
}

// Todoアイテム個々の3D表現
const TodoItem3D: React.FC<{ 
    todo: Todo, 
    index: number, 
    onClick: (todo_id: string) => void,
    isSelected: boolean
}> = ({ todo, index, onClick, isSelected }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  const yPos = -index * 0.7;
  const baseColor = isSelected ? '#2b8a3e' : '#2b2b2b';
  const color = hovered ? (isSelected ? '#36c05a' : '#3a3a3a') : baseColor;

  // ホバー時の浮き上がりアニメーション
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.z = THREE.MathUtils.lerp(
        meshRef.current.position.z,
        hovered ? 0.18 : 0,
            0.12
      );
    }
  });

  return (
    <group position={[0, yPos, 0]}>
      {/* 3Dカードの背景 */}
      <mesh
        ref={meshRef}
        onClick={() => onClick(todo.todo_id)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onPointerMove={(e) => ((e.object.parent as any).canvas.style.cursor = 'pointer')}
      >
        <planeGeometry args={[3.2, 0.6]} />
        <meshStandardMaterial color={color} />
      </mesh>

      <Text position={[-1, 0, 0.20]} fontSize={0.18} color="white" anchorX="left" anchorY="middle">
        {todo.title}
      </Text>

    </group>
  );
};


// --- メインコンポーネント ---
const FriendTodo3D: React.FC<FriendTodo3DProps> = ({ friendId, onJamaComplete }) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null);

  // 友達のTodoリストをDBから取得
  useEffect(() => {
    const fetchFriendTodos = async () => {
      setIsLoading(true);
      
      if (!friendId) {
        setTodos([]);
        setIsLoading(false);
        return;
      }

      // 相手の未完了タスクを取得
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', friendId)
        .eq('is_completed', false) // 未完了のみ表示
        .order('created_at', { ascending: true }); // 古いものから順に表示

      if (error) {
        console.error('Todoリスト取得エラー:', error);
        setTodos([]);
      } else {
        setTodos(data as Todo[]); 
      }
      setIsLoading(false);
    };
    
    fetchFriendTodos();
  }, [friendId]);

  // 邪魔を実行するハンドラー (DB更新ロジックを含む)
  const handleJamaExecution = async (todoId: string) => {
    const targetTodo = todos.find(t => t.todo_id === todoId);
    if (!targetTodo) return;

    if (!window.confirm(`${targetTodo.title} を文字化けして邪魔しますか？ (コスト: ${JAMA_COST}P)`)) {
      return;
    }

    // 1. Todoの内容を文字化けに更新 (Disruption)
    const updatedContent = createMojibakeText(targetTodo.title);
    
    const { error: updateError } = await supabase
      .from('todos')
      .update({ 
        title: updatedContent,
        // is_disguised: true や disguised_by: CURRENT_USER_ID を設定する場合はここに追加
      })
      .eq('todo_id', todoId);

    if (updateError) {
      console.error('Todo更新エラー:', updateError);
      alert('邪魔の実行に失敗しました（Todo更新エラー）。');
      return;
    }
    
    // 2. TaskJama.tsx にポイント消費とDisruptionsテーブルへの記録を依頼
    try {
        await onJamaComplete(todoId);
        alert(`「${targetTodo.title}」を文字化けしました！ポイントが消費されます。`);
    } catch (error) {
        console.error("ポイント消費エラー:", error);
        alert("ポイント消費処理に失敗しました。");
        return;
    }

    // 3. フロントエンドのTodoリストを更新して、文字化けを反映
    setTodos(prev => prev.map(t => 
        t.todo_id === todoId ? { ...t, title: updatedContent } : t
    ));
  };
  
  const handleTodoClick = async (todoId: string) => {
      setSelectedTodoId(todoId);
      // クリック時に非同期の邪魔実行を実行
      await handleJamaExecution(todoId);
      // 実行後、選択状態をリセット
      setSelectedTodoId(null);
  };


  if (isLoading) {
    return (
        <Text 
            position={[0, 0, 0]} 
            fontSize={0.2} 
            color="#bbb"
        >
        Todoリストを読み込み中...
        </Text>
    );
  }

  return (
    <group position={[0, 0.5, 0]}>
      {/* タイトル */}
      <Text 
        position={[0, 0.6, 0]} 
        fontSize={0.3} 
        color="#fff"
        anchorY="bottom"
      >
        Todo を選んで実行
      </Text>
            
      
      {/* Todoリスト */}
      <group position={[0, -0.2, 0]}>
        {todos.length === 0 ? (
            <Text 
                position={[0, -0.5, 0]} 
                fontSize={0.2} 
                color="#bbb"
            >
            Todoがありません。
            </Text>
        ) : (
            todos.map((todo, index) => (
              <TodoItem3D 
                key={todo.todo_id}
                todo={todo} 
                index={index} 
                onClick={handleTodoClick} 
                isSelected={selectedTodoId === todo.todo_id}
              />
            ))
        )}
      </group>
    </group>
  );
};

export default FriendTodo3D;