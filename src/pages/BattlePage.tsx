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
    <div style={{ 
      height: '100vh', 
      width: '100vw',
      display: 'flex', 
      flexDirection: 'column', 
      backgroundColor: '#0a0a0a', 
      color: '#f0f0f0', 
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      
      {/* Background Ambience */}
      <div style={{
        position: 'absolute',
        top: '-20%',
        left: '-10%',
        width: '50vw',
        height: '50vw',
        background: 'radial-gradient(circle, rgba(0, 255, 255, 0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-20%',
        right: '-10%',
        width: '50vw',
        height: '50vw',
        background: 'radial-gradient(circle, rgba(255, 0, 0, 0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Jama Overlay */}
      {isJamaActive && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(20, 0, 0, 0.85)', 
          backdropFilter: 'blur(8px)',
          zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center',
          flexDirection: 'column',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <h1 style={{ 
            fontSize: '5em', 
            color: '#ff0033', 
            textShadow: '0 0 20px rgba(255,0,51,0.5)',
            letterSpacing: '0.1em',
            marginBottom: '20px',
            textTransform: 'uppercase'
          }}>⚠️ Malfunction ⚠️</h1>
          <h2 style={{ 
            fontSize: '2em', 
            background: '#ff0033', 
            color: 'black',
            padding: '10px 40px',
            transform: 'skew(-10deg)',
            boxShadow: '0 0 30px rgba(255,0,51,0.3)'
          }}>{jamaMessage}</h2>
        </div>
      )}

      {/* Header */}
      <header style={{ 
        padding: '20px 40px', 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10,
        background: 'linear-gradient(to bottom, rgba(10,10,10,0.8) 0%, transparent 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '10px', height: '10px', background: '#00ffff', borderRadius: '50%', boxShadow: '0 0 10px #00ffff' }} />
          <span style={{ fontSize: '1.2em', fontWeight: 600, letterSpacing: '0.05em' }}>BATTLE MODE</span>
        </div>
        <div style={{ 
          fontSize: '1em', 
          color: phase === 'BATTLE' ? (timeLeft <= 10 ? '#ff4444' : '#fff') : '#888',
          fontVariantNumeric: 'tabular-nums',
          fontWeight: 'bold'
        }}>
          {phase === 'BATTLE' ? `TIME: ${timeLeft.toString().padStart(2, '0')}s` : phase}
        </div>
      </header>

      {/* Phase: Preparation */}
      {phase === 'PREP' && (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', zIndex: 1 }}>
          <div style={{ maxWidth: '600px', width: '100%', textAlign: 'center' }}>
            <h2 style={{ fontSize: '3em', fontWeight: 300, marginBottom: '40px', background: 'linear-gradient(45deg, #fff, #888)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Defend Your Task
            </h2>
            <div style={{ position: 'relative', marginBottom: '40px' }}>
              <input 
                value={myTodo} 
                onChange={e => setMyTodo(e.target.value)} 
                style={{ 
                  width: '100%', 
                  padding: '20px', 
                  fontSize: '1.5em', 
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid #333',
                  borderBottom: '2px solid #00ffff',
                  color: '#fff',
                  outline: 'none',
                  textAlign: 'center',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                  transition: 'all 0.3s ease'
                }}
                placeholder="What is your mission?"
                onFocus={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.boxShadow = '0 0 30px rgba(0, 255, 255, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
            <button 
              onClick={handleSubmitTodo} 
              disabled={!myTodo || isWaiting}
              style={{ 
                padding: '15px 60px', 
                fontSize: '1.1em',
                background: isWaiting ? '#333' : '#00ffff',
                color: isWaiting ? '#888' : '#000',
                border: 'none',
                borderRadius: '30px',
                cursor: isWaiting ? 'not-allowed' : 'pointer', 
                fontWeight: 'bold',
                letterSpacing: '0.1em',
                transition: 'all 0.3s ease',
                boxShadow: isWaiting ? 'none' : '0 0 20px rgba(0, 255, 255, 0.4)',
                transform: isWaiting ? 'none' : 'scale(1)'
              }}
              onMouseEnter={e => !isWaiting && (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={e => !isWaiting && (e.currentTarget.style.transform = 'scale(1)')}
            >
              {isWaiting ? 'WAITING FOR OPPONENT...' : 'READY TO FIGHT'}
            </button>
          </div>
        </div>
      )}

      {/* Phase: Battle */}
      {phase === 'BATTLE' && (
        <div style={{ flex: 1, display: 'flex', zIndex: 1, padding: '0 40px 40px 40px', gap: '40px' }}>
          
          {/* Left: My Side */}
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            background: 'rgba(10, 10, 10, 0.6)', 
            border: '1px solid #222',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 0 50px rgba(0, 255, 255, 0.05)'
          }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #222', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0, 255, 255, 0.05)' }}>
              <span style={{ color: '#00ffff', fontWeight: 'bold', letterSpacing: '0.1em' }}>YOU</span>
              <div style={{ fontSize: '1.2em', fontWeight: 500 }}>{isJamaActive ? createMojibakeText(myTodo) : myTodo}</div>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {chats.filter(c => c.sender === 'me').map((c, i) => (
                <div key={i} style={{ alignSelf: 'flex-end', maxWidth: '80%' }}>
                   <div style={{ 
                     background: '#00ffff', 
                     color: '#000', 
                     padding: '12px 18px', 
                     borderRadius: '18px 18px 0 18px',
                     fontSize: '1em',
                     boxShadow: '0 2px 10px rgba(0, 255, 255, 0.2)'
                   }}>
                     {c.text}
                   </div>
                </div>
              ))}
            </div>
            
            <form onSubmit={handleSendChat} style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid #222' }}>
              <div style={{ display: 'flex', gap: '10px', position: 'relative' }}>
                <input 
                  value={chatInput} 
                  onChange={e => setChatInput(e.target.value)}
                  style={{ 
                    flex: 1, 
                    padding: '15px 20px', 
                    background: '#111', 
                    border: '1px solid #333', 
                    borderRadius: '30px',
                    color: '#fff',
                    outline: 'none',
                    fontSize: '1em',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = '#00ffff'}
                  onBlur={e => e.currentTarget.style.borderColor = '#333'}
                  placeholder="Type your argument..."
                />
                <button type="submit" style={{ 
                  padding: '0 25px', 
                  borderRadius: '30px', 
                  background: '#00ffff', 
                  border: 'none', 
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}>➜</button>
              </div>
            </form>
          </div>

          {/* Right: Opponent Side */}
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            background: 'rgba(10, 10, 10, 0.6)', 
            border: '1px solid #222',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 0 50px rgba(255, 0, 50, 0.05)'
          }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #222', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255, 0, 50, 0.05)' }}>
              <span style={{ color: '#ff0033', fontWeight: 'bold', letterSpacing: '0.1em' }}>OPPONENT</span>
              <div style={{ fontSize: '1.2em', fontWeight: 500, color: '#aaa' }}>{opponentTodo?.title || 'Unknown Task'}</div>
            </div>
             
             <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {chats.filter(c => c.sender === 'opponent').map((c, i) => (
                <div key={i} style={{ alignSelf: 'flex-start', maxWidth: '80%' }}>
                   <div style={{ 
                     background: 'rgba(255, 0, 50, 0.2)', 
                     color: '#fff', 
                     border: '1px solid rgba(255, 0, 50, 0.4)',
                     padding: '12px 18px', 
                     borderRadius: '18px 18px 18px 0',
                     fontSize: '1em'
                   }}>
                     {c.text}
                   </div>
                </div>
              ))}
            </div>
            
            {/* Opponent input area placeholder for visual balance */}
            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid #222', opacity: 0.3 }}>
               <div style={{ width: '100%', height: '46px', background: '#111', borderRadius: '30px', display: 'flex', alignItems: 'center', padding: '0 20px' }}>
                 <div style={{ width: '8px', height: '8px', background: '#ff0033', borderRadius: '50%', animation: 'pulse 1s infinite' }} />
                 <span style={{ marginLeft: '10px', fontSize: '0.8em' }}>Opponent is thinking...</span>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Phase: Result */}
      {phase === 'RESULT' && result && (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', zIndex: 10, backdropFilter: 'blur(5px)' }}>
          <h1 style={{ 
              fontSize: '8em', 
              margin: 0, 
              fontWeight: 900,
              fontStyle: 'italic',
              background: result.winner === userId 
                  ? 'linear-gradient(to right, #00ffff, #0088ff)' 
                  : 'linear-gradient(to right, #ff0033, #880000)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.5))'
          }}>
            {result.winner === userId ? 'VICTORY' : 'DEFEAT'}
          </h1>
          
          <div style={{ 
              display: 'flex', 
              gap: '80px', 
              marginTop: '60px',
              padding: '40px',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '24px',
              border: '1px solid rgba(255,255,255,0.1)'
          }}>
              <div style={{ textAlign: 'center' }}>
                  <h3 style={{ margin: '0 0 10px 0', color: '#00ffff', fontSize: '1.2em', letterSpacing: '0.1em' }}>YOUR SCORE</h3>
                  <div style={{ fontSize: '5em', fontWeight: 700, lineHeight: 1 }}>{result[userId!]?.score || 0}</div>
              </div>
              <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} />
              <div style={{ textAlign: 'center' }}>
                  <h3 style={{ margin: '0 0 10px 0', color: '#ff0033', fontSize: '1.2em', letterSpacing: '0.1em' }}>OPPONENT</h3>
                  <div style={{ fontSize: '5em', fontWeight: 700, lineHeight: 1, color: '#aaa' }}>{result[opponentId]?.score || 0}</div>
              </div>
          </div>
          
          <p style={{ marginTop: '40px', color: '#888', maxWidth: '600px', textAlign: 'center', lineHeight: '1.6' }}>
            {result.reason}
          </p>
          
          <button 
            onClick={() => navigate('/')} 
            style={{ 
                marginTop: '60px', 
                padding: '15px 40px', 
                background: 'transparent',
                border: '1px solid #fff',
                color: '#fff',
                borderRadius: '30px',
                cursor: 'pointer',
                fontSize: '0.9em',
                letterSpacing: '0.2em',
                transition: 'all 0.2s'
            }}
            onMouseEnter={e => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.color = 'black';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'white';
            }}
          >
            RETURN TO BASE
          </button>
        </div>
      )}

      {/* Animation Styles */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pulse { 0% { opacity: 0.4; } 50% { opacity: 1; } 100% { opacity: 0.4; } }
      `}</style>
    </div>
  );
};
