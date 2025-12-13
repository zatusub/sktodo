// task-jama/components/AddFriend3D.tsx

import React, { useState, memo } from 'react'; 
import { Text, Html } from '@react-three/drei';

interface AddFriend3DProps {
  onBack: () => void;
}

const InputForm3D = memo<{ 
  inputEmail: string, 
  setInputEmail: (email: string) => void,
  onBack: () => void,
  setViewState: (state: 'INPUT' | 'SUCCESS') => void,
  message: string,
  setMessage: (msg: string) => void
}>(({ inputEmail, setInputEmail, onBack, setViewState, message, setMessage }) => {
    const [isHovering, setIsHovering] = useState(false);

    const handleSubmit = () => {
      if (!inputEmail || !inputEmail.includes('@')) {
        setMessage('有効なメールアドレスを入力してください。');
        return;
      }
      setMessage('リクエスト送信中...');
      
      setTimeout(() => {
        setViewState('SUCCESS');
        setInputEmail(''); // 成功したらクリア
      }, 1000);
    };
    
    const handleKeySubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleSubmit();
      }
    };

    return (
      <group position={[0, 0, 0]}>
        <Text position={[0, 1.5, 0]} fontSize={0.3} color="white">
          友達のアドレスを入力
        </Text>

        {/* 戻るボタンの位置調整 */}
        <group position={[1, 2.8, 0]}> 
        <mesh onClick={onBack} onPointerMove={(e: any) => { ((e.object.parent as any).canvas.style.cursor = 'pointer'); }}>
          <planeGeometry args={[0.8, 0.4]} /> {/* サイズ統一 */}
          <meshStandardMaterial color="#555" /> {/* カラー統一 */}
        </mesh>
        <Text position={[0, 0, 0.01]} fontSize={0.14} color="white" anchorX="center" anchorY="middle"> {/* テキストサイズ統一 */}
          戻る
        </Text>
        </group>
        
        {/* HTML入力フィールド*/}
        <Html 
          position={[0, 0.5, -5]} 
          transform 
          occlude 
          style={{ width: '200px' }} // 200px に縮小
        >
          <input
            type="email"
            placeholder="メールアドレス"
            value={inputEmail}
            onChange={(e) => { setInputEmail(e.target.value); setMessage(''); }}
            onKeyDown={handleKeySubmit}
            style={{ 
              width: '85%', 
              padding: '5px', // パディングをさらに縮小
              border: '2px solid #2b8a3e', 
              borderRadius: '8px', 
              backgroundColor: '#333', 
              color: 'white',
              fontSize: '14px' 
            }}
          />
        </Html>
        
        {/* メッセージ表示 */}
        {message && (
          <Text position={[0, -1.5, 0]} fontSize={0.15} color="#dc3545">
            {message}
          </Text>
        )}

        {/* 送信ボタン */}
        <mesh 
          position={[0, -2, 0]} 
          onClick={handleSubmit}
          onPointerOver={() => setIsHovering(true)}
          onPointerOut={() => setIsHovering(false)}
          onPointerMove={(e: any) => { ((e.object.parent as any).canvas.style.cursor = 'pointer'); }}
        >
          <boxGeometry args={[3, 0.6, 0.2]} />
          <meshStandardMaterial color={isHovering ? '#36c05a' : '#2b8a3e'} />
          <Text position={[0, 0, 0.11]} fontSize={0.2} color="white">
            リクエストを送信
          </Text>
        </mesh>
      </group>
    );
});


const AddFriend3D: React.FC<AddFriend3DProps> = ({ onBack }) => {
  const [viewState, setViewState] = useState<'INPUT' | 'SUCCESS'>('INPUT');
  const [inputEmail, setInputEmail] = useState(''); 
  const [message, setMessage] = useState(''); 

  const SuccessModal: React.FC = () => { 
    const [isHovering, setIsHovering] = useState(false); 

    const handleOk = () => { onBack(); };
    return (
      <group position={[0, 0, 1]}>
        <mesh> {/* ...略... */ } </mesh>
        <Text position={[0, 0.5, 1.01]} fontSize={0.3} color="white">リクエスト！</Text>
        <Text position={[0, 0.1, 1.01]} fontSize={0.15} color="#bbb">リクエストを送信しました</Text>
        <mesh 
          position={[0, -0.6, 1.01]} 
          onClick={handleOk} 
          onPointerOver={() => setIsHovering(true)} 
          onPointerOut={() => setIsHovering(false)} 
          onPointerMove={(e: any) => { ((e.object.parent as any).canvas.style.cursor = 'pointer'); }}
        >
          <boxGeometry args={[1.5, 0.5, 0.1]} />
          <meshStandardMaterial color={isHovering ? '#36c05a' : '#2b8a3e'} />
          <Text position={[0, 0, 0.06]} fontSize={0.2} color="white">OK</Text>
        </mesh>
      </group>
    );
  };


  return (
    <group>
      {viewState === 'INPUT' && (
        <InputForm3D 
          inputEmail={inputEmail}
          setInputEmail={setInputEmail}
          onBack={onBack}
          setViewState={setViewState}
          message={message}
          setMessage={setMessage}
        />
      )}
      {viewState === 'SUCCESS' && <SuccessModal />}
    </group>
  );
};

export default AddFriend3D;