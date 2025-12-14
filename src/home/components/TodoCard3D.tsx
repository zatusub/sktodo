// src/home/components/TodoCard3D.tsx
import { Text } from "@react-three/drei";
import type { Todo } from "../../api/models";

interface TodoCard3DProps {
  todo: Todo;
  index: number;
  onComplete: (todoId: string) => void;
}

export default function TodoCard3D({ todo, index, onComplete }: TodoCard3DProps) {
  const y = 0.3 - index * 0.6;
  const cardColor = todo.is_completed ? "#2a3a2a" : "#333";
  const textColor = todo.is_completed ? "#888" : "#fff";

  return (
    <group position={[0, y, 0]}>
      <mesh
        onClick={() => !todo.is_completed && onComplete(todo.todo_id)}
        onPointerOver={(e) => {
          if (!todo.is_completed) {
            (e.object.parent as any).cursor = "pointer";
          }
        }}
      >
        <planeGeometry args={[3.0, 0.5]} />
        <meshStandardMaterial color={cardColor} />
      </mesh>

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

      {todo.is_completed && (
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
}
