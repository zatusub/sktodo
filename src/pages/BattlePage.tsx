import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useWebSocket, WebSocketMessage } from '../hooks/useWebSocket';
import { createMojibakeText } from '../task-jama/components/todo-mojibake';

interface BattlePageProps {
  userId: string | null;
}

interface Todo {
  title: string;
  description?: string;
}

export const BattlePage = ({ userId: propUserId }: BattlePageProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { opponentId } = location.state || {}; // Passed from MatchingPage
  
  const userId = propUserId || localStorage.getItem('sktodo_user_id');
  const { sendMessage, registerHandler } = useWebSocket();

  // States
  const [phase, setPhase] = useState<'PREP' | 'BATTLE' | 'RESULT'>('PREP');
  const [myTodo, setMyTodo] = useState('');
  const [opponentTodo, setOpponentTodo] = useState<Todo | null>(null);
  const [chats, setChats] = useState<{ sender: 'me' | 'opponent', text: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const [result, setResult] = useState<any>(null);
  const [isJamaActive, setIsJamaActive] = useState(false);
  const [jamaMessage, setJamaMessage] = useState('');

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!userId) {
      navigate('/');
      return;
    }

    const unregister = registerHandler((msg: WebSocketMessage) => {
      switch (msg.type) {
        case 'game_start':
          // { opponentTodo: {...}, startTime: number }
          setOpponentTodo(msg.content.opponentTodo);
          setPhase('BATTLE');
          startTimer();
          break;
        case 'chat':
          setChats(prev => [...prev, { sender: 'opponent', text: msg.content }]);
          break;
        case 'result':
          setResult(msg.content);
          setPhase('RESULT');
          if (timerRef.current) clearInterval(timerRef.current);
          break;
        case 'jama':
          setIsJamaActive(true);
          setJamaMessage(msg.content || 'PENALTY ACTIVATED!');
          triggerMojibakeEffect();
          break;
      }
    });

    return () => {
        unregister();
        if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [userId, registerHandler, navigate]);

  const startTimer = () => {
    setTimeLeft(30);
    timerRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeUp = () => {
    // Ideally user sends 'finish' or server handles timeout
    sendMessage('finish', {});
  };

  const [isWaiting, setIsWaiting] = useState(false);

  const handleSubmitTodo = () => {
    if (!myTodo.trim()) return;
    setIsWaiting(true);
    sendMessage('select_todo', { title: myTodo, todoId: Date.now().toString() });
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendMessage('chat', chatInput);
    setChats(prev => [...prev, { sender: 'me', text: chatInput }]);
    setChatInput('');
  };

  const triggerMojibakeEffect = () => {
    // Simple visual corruption effect on DOM
    document.body.style.filter = 'hue-rotate(90deg) contrast(200%)';
    setTimeout(() => {
        document.body.style.filter = '';
    }, 5000);
  };

  if (!userId) return null;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#111', color: '#fff', position: 'relative' }}>
      
      {/* Jama Overlay */}
      {isJamaActive && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(255, 0, 0, 0.6)', 
          zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center',
          flexDirection: 'column'
        }}>
          <h1 style={{ fontSize: '4em', color: 'yellow', textShadow: '4px 4px #000' }}>⚠️ WARNING ⚠️</h1>
          <h2 style={{ fontSize: '2em', background: 'black', padding: '10px' }}>{jamaMessage}</h2>
        </div>
      )}

      {/* Header */}
      <div style={{ padding: '10px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between' }}>
        <span>Battle Mode</span>
        <span>{phase === 'BATTLE' ? `Time: ${timeLeft}s` : phase}</span>
      </div>

      {phase === 'PREP' && (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
          <h2>Prepare for Battle</h2>
          <p>Enter your task description to defend:</p>
          <input 
            value={myTodo} 
            onChange={e => setMyTodo(e.target.value)} 
            style={{ padding: '10px', width: '300px', fontSize: '1.2em' }}
            placeholder="e.g. Clean the room"
          />
          <button 
            onClick={handleSubmitTodo} 
            disabled={!myTodo || isWaiting}
            style={{ marginTop: '20px', padding: '10px 30px', cursor: isWaiting ? 'not-allowed' : 'pointer', opacity: isWaiting ? 0.6 : 1 }}
          >
            {isWaiting ? 'Waiting for Opponent...' : 'Ready'}
          </button>
        </div>
      )}

      {phase === 'BATTLE' && (
        <div style={{ flex: 1, display: 'flex' }}>
          {/* Left: My Side */}
          <div style={{ flex: 1, borderRight: '1px solid #333', padding: '10px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ borderBottom: '2px solid cyan', paddingBottom: '5px' }}>ME</h3>
            <div style={{ fontSize: '1.5em', margin: '10px 0' }}>{isJamaActive ? createMojibakeText(myTodo) : myTodo}</div>
            
            <div style={{ flex: 1, overflowY: 'auto', background: '#222', padding: '10px' }}>
              {chats.filter(c => c.sender === 'me').map((c, i) => (
                <div key={i} style={{ textAlign: 'right', margin: '5px 0' }}>
                   <span style={{ background: 'cyan', color: 'black', padding: '5px 10px', borderRadius: '10px' }}>{c.text}</span>
                </div>
              ))}
            </div>
            
            <form onSubmit={handleSendChat} style={{ display: 'flex', marginTop: '10px' }}>
              <input 
                value={chatInput} 
                onChange={e => setChatInput(e.target.value)}
                style={{ flex: 1, padding: '10px' }}
                placeholder="Argue your case!"
              />
              <button type="submit" style={{ padding: '0 20px' }}>Send</button>
            </form>
          </div>

          {/* Right: Opponent Side */}
          <div style={{ flex: 1, padding: '10px', display: 'flex', flexDirection: 'column', backgroundColor: '#1a1a1a' }}>
            <h3 style={{ borderBottom: '2px solid red', paddingBottom: '5px' }}>OPPONENT</h3>
            <div style={{ fontSize: '1.5em', margin: '10px 0' }}>{opponentTodo?.title || 'Unknown Task'}</div>
             
             <div style={{ flex: 1, overflowY: 'auto', background: '#222', padding: '10px' }}>
              {chats.filter(c => c.sender === 'opponent').map((c, i) => (
                <div key={i} style={{ textAlign: 'left', margin: '5px 0' }}>
                   <span style={{ background: 'red', color: 'white', padding: '5px 10px', borderRadius: '10px' }}>{c.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {phase === 'RESULT' && result && (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
          <h1>RESULT</h1>
          <div style={{ fontSize: '2em', margin: '20px' }}>
            Winner: <span style={{ color: result.winner === userId ? 'cyan' : 'red' }}>
                {result.winner === userId ? 'YOU' : 'OPPONENT'}
            </span>
          </div>
          
          <div style={{ display: 'flex', gap: '40px' }}>
              <div style={{ textAlign: 'center' }}>
                  <h3>My Score</h3>
                  <div style={{ fontSize: '3em' }}>{result[userId!]?.score || 0}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                  <h3>Opponent Score</h3>
                  <div style={{ fontSize: '3em' }}>{result[opponentId]?.score || 0}</div>
              </div>
          </div>
          
          <p style={{ marginTop: '20px', color: '#aaa' }}>{result.reason}</p>
          
          <div style={{ marginTop: '20px', padding: '10px', background: '#333', borderRadius: '4px', textAlign: 'left', width: '80%' }}>
            <h4>Debug Info:</h4>
            <p>My UserID: {userId}</p>
            <pre style={{ overflow: 'auto' }}>{JSON.stringify(result, null, 2)}</pre>
          </div>
          
          <button onClick={() => navigate('/')} style={{ marginTop: '40px', padding: '10px 30px' }}>Back to Home</button>
        </div>
      )}

    </div>
  );
};
