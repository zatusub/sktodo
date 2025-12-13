import React from 'react';
import { Text } from '@react-three/drei';
import type { Todo } from '../../api/models';

interface TodoCard3DProps {
  todo: Todo;
  index: number;
  onComplete: (todoId: string) => void;
}

const TodoCard3D: React.FC<TodoCard3DProps> = ({ todo, index, onComplete }) => {
  const y = 0.3 - index * 0.6;
  const cardColor = todo.completed ? '#2a3a2a' : '#333';
  const textColor = todo.completed ? '#888' : '#fff';

  return (
    <group position={[0, y, 0]}>
      {/* ToDoカード背景 */}
      <mesh
        onClick={() => !todo.completed && onComplete(todo.todo_id)}
        onPointerOver={(e) => {
          if (!todo.completed) {
            (e.object.parent as any).cursor = 'pointer';
          }
        }}
      >
        <planeGeometry args={[3.0, 0.5]} />
        <meshStandardMaterial color={cardColor} />
      </mesh>

      {/* ToDoタイトル */}
      <Text
        position={[-1.4, 0.05, 0.05]}
        fontSize={0.13}
        color={textColor}
        anchorX="left"
        anchorY="middle"
        maxWidth={2.5}
      >
        {todo.title}
      </Text>

      {/* 完了チェック表示 */}
      {todo.completed && (
        <Text
          position={[1.4, 0.05, 0.05]}
          fontSize={0.18}
          color="#4caf50"
          anchorX="right"
          anchorY="middle"
        >
          ✓
        </Text>
      )}
    </group>
  );
};

export default TodoCard3D;
