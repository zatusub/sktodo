// task-jama/components/FriendTodo3D.tsx

import { useState, useEffect, useCallback } from 'react';
import { Text, Html } from '@react-three/drei';

import { supabase } from '../../lib/supabaseClient';
import { Todo } from '../../types/db'; // Todo の型をインポートしていると仮定

// --- Props定義 ---
interface FriendTodo3DProps {
    friendId: string;
    onJamaComplete: (targetTodoId: string) => void;
}

const ITEM_SPACING = 0.5;
const LIST_START_Y = 1.0;

const FriendTodo3D: React.FC<FriendTodo3DProps> = ({ friendId, onJamaComplete }) => {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null);
    const [friendUsername, setFriendUsername] = useState('フレンド'); // ユーザー名表示用

    // ----------------------------------------------------
    // 1. データ取得ロジック
    // ----------------------------------------------------

    const fetchFriendTodos = useCallback(async () => {
        setIsLoading(true);
        
        try {
            // ユーザー名を取得 (フレンドリストから取得済みの場合、これは省略可能)
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('username')
                .eq('user_id', friendId)
                .single();

            if (userData) {
                setFriendUsername(userData.username);
            }

            // ToDo リストを取得
            const { data: todosData, error: todosError } = await supabase
                .from('todos')
                .select('*')
                .eq('user_id', friendId)
                .eq('is_completed', false)
                .eq('is_fully_disrupted', false)
                .order('due_date', { ascending: true });

            if (todosError) {
               throw todosError;
            }
            
            setTodos(todosData as Todo[]);

        } catch (err: any) {
            console.error('ToDo取得エラー:', err.message);
            // ユーザーに通知する処理があればここに
        } finally {
            setIsLoading(false);
        }
    }, [friendId]); // friendId が変わったら再実行

    useEffect(() => {
        fetchFriendTodos();
    }, [fetchFriendTodos]);

    // ----------------------------------------------------
    // 2. イベントハンドラ
    // ----------------------------------------------------
    
    const handleSelectTodo = (todoId: string) => {
        setSelectedTodoId(todoId);
    };

    const handleCancelSelect = () => {
        setSelectedTodoId(null);
    };

    const handleConfirmJama = useCallback(async () => {
        if (selectedTodoId) {
            await onJamaComplete(selectedTodoId);
            
            await fetchFriendTodos();
            
            setSelectedTodoId(null);
        }
    }, [selectedTodoId, onJamaComplete, fetchFriendTodos]);

    // ----------------------------------------------------
    // 3. JSXレンダリング
    // ----------------------------------------------------

    if (isLoading) {
        return (
            <Text position={[0, 0, 0]} fontSize={0.3} color="white">
              Loading {friendUsername}'s Todos...
            </Text>
        );
    }

    return (
        <group position={[0, 0, 0]}>
            <Text position={[0, 1.8, 0]} fontSize={0.3} color="white">
              ToDoを選んでください
            </Text>

            {todos.length === 0 ? (
                <Text position={[0, 0, 0]} fontSize={0.2} color="#bbb">
                  妨害できるToDoはありません
                </Text>
            ) : (
                todos.map((todo, index) => {
                    const yPos = LIST_START_Y - index * ITEM_SPACING;
                    const isSelected = selectedTodoId === todo.todo_id;
                    const todoText = todo.title; // title が存在すると仮定

                    return (
                        <group 
                            key={todo.todo_id} 
                            position={[0, yPos, 0]}
                            onClick={() => handleSelectTodo(todo.todo_id)}
                            onPointerMove={(e: any) => { ((e.object.parent as any).canvas.style.cursor = 'pointer'); }}
                        >
                            {/* アイテムの背景 */}
                            <mesh>
                                <planeGeometry args={[3.5, 0.4]} />
                                <meshStandardMaterial color={isSelected ? '#8b0000' : '#222'} transparent opacity={0.8} />
                            </mesh>

                            {/* ToDo タイトル */}
                            <Text position={[-1.5, 0, 0.01]} fontSize={0.2} color="white" anchorX="left">
                                {todoText}
                            </Text>
                            
                            {/* 実行ボタン (選択されていない場合) */}
                            {!isSelected && (
                                <Text position={[1.5, 0, 0.01]} fontSize={0.2} color="#dc3545" anchorX="right">
                                    実行
                                </Text>
                            )}
                        </group>
                    );
                })
            )}

            {/* 選択後の確認モーダル */}
            {selectedTodoId && (
                <Html position={[3.5, -2.5, -10]} transform>
                    <div style={{ 
                        background: 'rgba(0, 0, 0, 0.9)', 
                        padding: '20px',
                        borderRadius: '10px', 
                        textAlign: 'center', 
                        color: 'white',
                        width: '250px',
                        position: 'relative',
                        transform: 'translate(-50%, -50%)'
                    }}>
                        <h3>妨害を実行しますか？</h3>
                        <p>（50 P 消費）</p>
                        <button 
                            onClick={handleConfirmJama} 
                            style={{ margin: '10px', padding: '10px 20px', cursor: 'pointer', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px' }}
                        >
                            実行
                        </button>
                        <button 
                            onClick={handleCancelSelect} 
                            style={{ margin: '10px', padding: '10px 20px', cursor: 'pointer', backgroundColor: '#555', color: 'white', border: 'none', borderRadius: '5px' }}
                        >
                            キャンセル
                        </button>
                    </div>
                </Html>
            )}
        </group>
    );
};

export default FriendTodo3D;