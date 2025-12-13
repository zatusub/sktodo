import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Text, OrbitControls } from '@react-three/drei';
import {
  fetchCurrentUser,
  fetchTodosByUser,
  fetchLatestCriticism,
  completeTodo,
} from '../api/todoApi';
import type { User, Todo, Criticism } from '../api/models';
import UserCard3D from './components/UserCard3D';
import CriticismCard3D from './components/CriticismCard3D';
import TodoCard3D from './components/TodoCard3D';
import NavigationArrows3D from './components/NavigationArrows3D';

type HomePageProps = {
  onNextScreen: () => void;
};

type HomeScreenProps = {
  user: User | null;
  todos: Todo[];
  criticism: Criticism | null;
  loading: boolean;
  error: string | null;
  onNextScreen: () => void;
  onCompleteTodo: (todoId: string) => void;
};

const HomeScreen3D: React.FC<HomeScreenProps> = ({
  user,
  todos,
  criticism,
  loading,
  error,
  onNextScreen,
  onCompleteTodo,
}) => {
  // レスポンシブスケール
  const [scale, setScale] = useState(1);

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

  // 完了していないToDoのカウント
  const activeTodoCount = todos.filter(t => !t.completed).length;

  return (
    <group scale={[scale, scale, scale]} position={[0, -0.2, 0]}>
      {/* ユーザー情報カード（上部） */}
      {user && <UserCard3D username={user.username} points={user.points} />}

      {/* 批判・煽りカード */}
      <CriticismCard3D criticism={criticism} />

      {/* ToDo一覧セクション */}
      <group position={[0, -0.2, 0]}>
        {/* ToDoタイトルカード */}
        <group position={[0, 1.0, 0]}>
          <mesh>
            <planeGeometry args={[3.4, 0.45]} />
            <meshStandardMaterial color="#222" />
          </mesh>
          <Text
            position={[-1.6, 0, 0.05]}
            fontSize={0.15}
            color="#fff"
            anchorX="left"
            anchorY="middle"
          >
            やることリスト
          </Text>
          <Text
            position={[1.6, 0, 0.05]}
            fontSize={0.12}
            color="#aaa"
            anchorX="right"
            anchorY="middle"
          >
            {activeTodoCount}/{todos.length}
          </Text>
        </group>

        {/* ローディング状態 */}
        {loading && (
          <Text
            position={[0, 0.2, 0.05]}
            fontSize={0.13}
            color="#bbb"
            anchorX="center"
          >
            読み込み中...
          </Text>
        )}

        {/* エラー状態 */}
        {error && !loading && (
          <Text
            position={[0, 0.2, 0.05]}
            fontSize={0.13}
            color="#ff6b6b"
            anchorX="center"
          >
            {error}
          </Text>
        )}

        {/* ToDoなし */}
        {!loading && !error && todos.length === 0 && (
          <Text
            position={[0, 0.2, 0.05]}
            fontSize={0.13}
            color="#4caf50"
            anchorX="center"
          >
            タスクがありません！
          </Text>
        )}

        {/* ToDoカードリスト（スクロール風） */}
        {!loading &&
          !error &&
          todos.slice(0, 4).map((todo, index) => (
            <TodoCard3D
              key={todo.todo_id}
              todo={todo}
              index={index}
              onComplete={onCompleteTodo}
            />
          ))}
      </group>

      {/* ナビゲーション矢印 */}
      <NavigationArrows3D
        onLeft={() => {}}
        onRight={onNextScreen}
        disableLeft={true}
        disableRight={false}
      />
    </group>
  );
};

const HomePage: React.FC<HomePageProps> = ({ onNextScreen }) => {
  const [user, setUser] = useState<User | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [criticism, setCriticism] = useState<Criticism | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const u = await fetchCurrentUser();
        setUser(u);

        const ts = await fetchTodosByUser(u.user_id);
        setTodos(ts);

        const crit = await fetchLatestCriticism();
        setCriticism(crit);
      } catch (e) {
        console.error(e);
        setError('データ読み込みエラー');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleCompleteTodo = async (todoId: string) => {
    try {
      await completeTodo(todoId);
      setTodos(todos =>
        todos.map(t =>
          t.todo_id === todoId ? { ...t, completed: true } : t
        )
      );
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
        {/* シーンの背景を黒に設定（TaskJama と統一） */}
        <color attach="background" args={["#000"]} />
        <ambientLight intensity={1} />
        <pointLight position={[5, 5, 5]} intensity={1} />
        <OrbitControls makeDefault enablePan={false} enableZoom={true} />

        <HomeScreen3D
          user={user}
          todos={todos}
          criticism={criticism}
          loading={loading}
          error={error}
          onNextScreen={onNextScreen}
          onCompleteTodo={handleCompleteTodo}
        />
      </Canvas>
    </div>
  );
};

export default HomePage;
