import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from '../hooks/useWebSocket';
// Note: In a real app, userId would likely come from context/auth
// For this implementation, we might need to pass it or retrieve it from storage if not using a global store

interface MatchingPageProps {
  userId: string | null;
}

export const MatchingPage = ({ userId: propUserId }: MatchingPageProps) => {
  const navigate = useNavigate();
  // Fallback to localStorage if prop is null
  const userId = propUserId || localStorage.getItem('sktodo_user_id');
  const { sendMessage, isConnected, registerHandler } = useWebSocket();
  
  const [targetId, setTargetId] = useState('');
  const [status, setStatus] = useState('Wait or Invite');
  const [invitation, setInvitation] = useState<{ from: string } | null>(null);

  useEffect(() => {
    if (isConnected && userId) {
      // REGISTER SELF: The backend only saves userId on 'invite'. 
      // We send a dummy invite to register our connectionId <-> userId mapping.
      console.log('Sending self-registration packet...');
      sendMessage('invite', { targetId: 'SELF_REGISTRATION', hostId: userId });
    }
  }, [isConnected, userId, sendMessage]);

  useEffect(() => {
    if (!userId) {
      // Try to get from localStorage one last time or redirect
      const stored = localStorage.getItem('sktodo_user_id');
      if (!stored) {
         navigate('/'); 
         return;
      }
    }

    const unregister = registerHandler((msg) => {
      switch (msg.type) {
        case 'invitation':
          setInvitation(msg.content);
          setStatus(`Invited by ${msg.content.from}`);
          break;
        case 'match_confirmed':
          setStatus('Match Confirmed! Moving to Battle...');
          setTimeout(() => {
            // Pass opponent info via state
            navigate('/battle', { state: { opponentId: msg.content.opponentId } });
          }, 1500);
          break;
      }
    });
    return unregister;
  }, [userId, registerHandler, navigate]);

  const handleInvite = () => {
    if (!targetId || !userId) return;
    setStatus('Sending Invite...');
    sendMessage('invite', { targetId, hostId: userId });
  };

  const handleJoin = () => {
    if (!invitation || !userId) return;
    setStatus('Joining...');
    sendMessage('join', { hostId: invitation.from });
  };

  return (
    <div style={{ padding: '20px', color: 'white', backgroundColor: '#222', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1>Matching</h1>
      <p>My ID: <span style={{ fontFamily: 'monospace', background: '#444', padding: '4px' }}>{userId}</span></p>
      <p>Status: {isConnected ? 'Connected' : 'Connecting...'}</p>
      
      <div style={{ margin: '20px 0', padding: '20px', border: '1px solid #555', borderRadius: '8px', width: '300px' }}>
        <h3>Invite Someone</h3>
        <input 
          type="text" 
          placeholder="Target User ID" 
          value={targetId}
          onChange={(e) => setTargetId(e.target.value)}
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
        />
        <button onClick={handleInvite} style={{ padding: '10px 20px', cursor: 'pointer' }}>Invite</button>
      </div>

      {invitation && (
        <div style={{ margin: '20px 0', padding: '20px', border: '1px solid #fa0', borderRadius: '8px', width: '300px', backgroundColor: '#430' }}>
          <h3>Invitation Received!</h3>
          <p>From: {invitation.from}</p>
          <button onClick={handleJoin} style={{ padding: '10px 20px', cursor: 'pointer', background: '#fa0', color: 'black', fontWeight: 'bold' }}>Join Battle</button>
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '1.2em', color: '#aaa' }}>
        {status}
      </div>
    </div>
  );
};
