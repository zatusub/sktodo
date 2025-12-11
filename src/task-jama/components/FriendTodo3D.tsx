// task-jama/components/FriendTodo3D.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createMojibakeText } from './todo-mojibake'; 

// --- データ型と定数の定義 (FriendTodo.tsxから移動) ---
interface Todo {
  id: string;
  title: string;
  isCompleted: boolean;
}
const JAMA_COST = 50; 

// --- Props定義 ---
interface FriendTodo3DProps {
  friendId: string;
  onJamaComplete: () => void;
}

// Todoアイテム個々の3D表現
const TodoItem3D: React.FC<{ 
    todo: Todo, 
    index: number, 
    onClick: (id: string) => void,
    isSelected: boolean
}> = ({ todo, index, onClick, isSelected }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  const yPos = -index * 0.7;
  // ベース色を #2b2b2b に変更、ホバー時はやや明るめにする
  const baseColor = isSelected ? '#2b8a3e' : '#2b2b2b';
  const color = hovered ? (isSelected ? '#36c05a' : '#3a3a3a') : baseColor;

  // 前面表示用のマテリアルは将来使用する可能性があるため一旦削除（未使用によるエラー回避）

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
        onClick={() => onClick(todo.id)}
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


const FriendTodo3D: React.FC<FriendTodo3DProps> = ({ friendId, onJamaComplete }) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null);

  // 友達のTodoリストを取得シミュレーション
  useEffect(() => {
    setIsLoading(true);
    const MOCK_TODOS: Record<string, Todo[]> = {
      'u001': [{ id: 't1', title: '重要なプレゼン資料作成', isCompleted: false }],
      'u002': [{ id: 't2', title: '夕食の買い物', isCompleted: false }, { id: 't3', title: '筋トレ 30分', isCompleted: false }],
      'u003': [{ id: 't4', title: '確定申告の準備', isCompleted: false }],
    };

    setTodos(MOCK_TODOS[friendId] || []);
    setIsLoading(false);
  }, [friendId]);

  // 邪魔を実行するハンドラー (ロジックは FriendTodo.tsx から移動)
  const handleJamaExecution = (todoId: string) => {
    
    const targetTodo = todos.find(t => t.id === todoId);
    if (!targetTodo) return;

    if (!window.confirm(`${targetTodo.title} を文字化けして邪魔しますか？ (コスト: ${JAMA_COST}P)`)) {
      return;
    }

    const selectedJamaType = 'mojibake';
    let updatedContent = createMojibakeText(targetTodo.title);
    
    console.log('邪魔実行ペイロード:', { friendId, todoId, jamaType: selectedJamaType, newContent: updatedContent });
    alert(`「${targetTodo.title}」を文字化けしました！ポイントが消費されます。`);
    
    onJamaComplete();
  };
  
  const handleTodoClick = (todoId: string) => {
      setSelectedTodoId(todoId);
      // クリック時に即座に実行
      handleJamaExecution(todoId);
      // 実行後（完了またはキャンセル）、選択状態をリセット
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
                key={todo.id} 
                todo={todo} 
                index={index} 
                onClick={handleTodoClick} 
                isSelected={selectedTodoId === todo.id}
              />
            ))
        )}
      </group>
    </group>
  );
};

export default FriendTodo3D;