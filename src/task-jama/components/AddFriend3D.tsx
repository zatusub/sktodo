// task-jama/components/AddFriend3D.tsx

import { useState, memo, useCallback } from 'react';
import { Text, Html } from '@react-three/drei';

import { supabase } from '../../lib/supabaseClient';

// --- サブコンポーネント: 成功メッセージ ---
const SuccessModal: React.FC<{ onBack: () => void }> = ({ onBack }) => (
    <Html position={[0, 0, 0]} transform>
        <div style={{
            background: 'rgba(0, 255, 0, 0.9)', 
            padding: '20px',
            borderRadius: '10px', 
            textAlign: 'center', 
            color: 'white'
        }}>
            <h3>リクエストを送信しました！</h3>
            <p>相手の承認をお待ちください。</p>
            <button 
                onClick={onBack} 
                style={{ marginTop: '10px', padding: '10px 20px', cursor: 'pointer' }}
            >
                戻る
            </button>
        </div>
    </Html>
);

// --- サブコンポーネント: フォーム ---
const InputForm3D = memo(({ 
    inputEmail, 
    setInputEmail, 
    setViewState, 
    message, 
    setMessage,
    currentUserId
}: {
    inputEmail: string,
    setInputEmail: (email: string) => void,
    onBack: () => void, 
    setViewState: (state: 'INPUT' | 'SUCCESS') => void,
    message: string,
    setMessage: (msg: string) => void,
    currentUserId: string
}) => {
    
    // HTML Inputフィールドの変更を処理
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setInputEmail(e.target.value);
    }, [setInputEmail]);

    // Enterキー押下を処理
    const handleKeySubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };
    
    // handleSubmit 関数 (Supabase 接続ロジック)
    const handleSubmit = async () => {
        setMessage(''); // メッセージをクリア

        if (!inputEmail || !inputEmail.includes('@')) {
            setMessage('有効なメールアドレスを入力してください。');
            return;
        }

        // 1. リクエスト送信中ステータス
        setMessage('リクエスト送信中...');
        
        try {
            // 2. メールアドレスで相手ユーザーを検索
        const { data: targetUser, error: userSearchError } = await supabase
          .from('users')
          .select('user_id')
          .eq('email', inputEmail)
          .maybeSingle();

        if (userSearchError) {
             console.error('User search error:', userSearchError);
             setMessage('ユーザー検索中にエラーが発生しました。');
             return;
        }

        if (!targetUser) {
          setMessage('指定されたメールアドレスのユーザーは見つかりませんでした。');
          return;
        }

            const targetUserId = targetUser.user_id;

            if (targetUserId === currentUserId) {
                setMessage('自分自身にフレンドリクエストは送信できません。');
                return;
            }

            // 3. 既存のフレンドシップがないか確認（重複リクエスト防止）
            const { data: existingFriendship } = await supabase
                .from('friendships')
                .select('*')
                .or(`and(user_id_1.eq.${currentUserId},user_id_2.eq.${targetUserId}),and(user_id_1.eq.${targetUserId},user_id_2.eq.${currentUserId})`);

            if (existingFriendship && existingFriendship.length > 0) {
                // 既にフレンドシップが存在する
                const status = existingFriendship[0].status;
                if (status === 'ACCEPTED') {
                    setMessage('このユーザーとは既にフレンドです。');
                } else if (status === 'PENDING') {
                    setMessage('既にリクエストを送信済みか、相手からリクエストが来ています。');
                } else if (status === 'REJECTED') {
                    setMessage('リクエストは拒否されました。しばらく経ってから再度お試しください。');
                }
                return;
            }

            // 4. フレンドリクエストの挿入
            const [id1, id2] = currentUserId < targetUserId 
                ? [currentUserId, targetUserId] 
                : [targetUserId, currentUserId];

            const { error: insertError } = await supabase
                .from('friendships')
                .insert({
                    user_id_1: id1, 
                    user_id_2: id2,   
                    status: 'PENDING',
                    requester_id: currentUserId,
                    created_at: new Date().toISOString()
                });

            if (insertError) {
                throw insertError; 
            }

            // 5. 成功
            setViewState('SUCCESS');
            setInputEmail(''); 

        } catch (error) {
            console.error('フレンドリクエスト送信中にエラー:', error);
            setMessage('リクエスト送信中に予期せぬエラーが発生しました。');
        }
    };

    return (
        <Html position={[0, -0.5, -5]} transform>
            <div style={{
                background: 'rgba(50, 50, 50, 0)',
                padding: '10px', 
                borderRadius: '10px', 
                color: 'white', 
                width: '185px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                <input
                    type="email"
                    value={inputEmail}
                    onChange={handleInputChange}
                    onKeyDown={handleKeySubmit}
                    placeholder="フレンドのメールアドレス"
                    style={{ 
                        width: '100%', 
                        padding: '10px', 
                        margin: '0 0 10px 0',
                        borderRadius: '5px', 
                        border: 'none',
                        boxSizing: 'border-box'
                    }}
                />
                <button 
                    onClick={handleSubmit} 
                    style={{ 
                        width: '100%', 
                        padding: '10px 20px', 
                        backgroundColor: '#007bff',
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '5px', 
                        cursor: 'pointer', 
                        margin: '0',
                        boxSizing: 'border-box'
                    }}
                >
                    リクエスト送信
                </button>

                {message && (
                    <p style={{ color: message.includes('成功') ? 'lightgreen' : 'red', marginTop: '10px', fontSize: '14px' }}>
                        {message}
                    </p>
                )}
            </div>
        </Html>
    );
});


// --- メインコンポーネント: AddFriend3D ---
interface AddFriend3DProps {
    onBack: () => void;
    currentUserId: string;
}

const AddFriend3D: React.FC<AddFriend3DProps> = ({ onBack, currentUserId }) => {
    const [inputEmail, setInputEmail] = useState('');
    const [viewState, setViewState] = useState<'INPUT' | 'SUCCESS'>('INPUT');
    const [message, setMessage] = useState('');

    const handleBackWrapper = () => {
        setInputEmail('');
        setViewState('INPUT');
        setMessage('');
        onBack();
    };

    return (
        <group position={[0, 0, 0]}>

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

            {viewState === 'INPUT' ? (
                <InputForm3D
                    inputEmail={inputEmail}
                    setInputEmail={setInputEmail}
                    onBack={handleBackWrapper}
                    setViewState={setViewState}
                    message={message}
                    setMessage={setMessage}
                    currentUserId={currentUserId}
                />
            ) : (
                <SuccessModal onBack={handleBackWrapper} />
            )}
        </group>
    );
};

export default AddFriend3D;