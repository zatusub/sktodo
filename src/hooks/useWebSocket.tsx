import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

const WS_URL = 'wss://yum4xcxupi.execute-api.ap-northeast-1.amazonaws.com/production/';

export type MessageType = 
  | 'invite' 
  | 'invitation' 
  | 'join' 
  | 'match_confirmed' 
  | 'select_todo' 
  | 'game_start' 
  | 'chat' 
  | 'result' 
  | 'jama' 
  | 'finish'; 

export interface WebSocketMessage {
  type: MessageType;
  content: any;
}

interface WebSocketContextType {
  isConnected: boolean;
  sendMessage: (type: MessageType, content: any) => void;
  // Allows components to subscribe to messages
  registerHandler: (handler: (msg: WebSocketMessage) => void) => () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // Handlers subscription
  const handlersRef = useRef<Set<(msg: WebSocketMessage) => void>>(new Set());

  // We need userId to connect, but passing it as prop to Provider is tricky if it changes.
  // We will read from localStorage inside the effect, or assume unconditional connection 
  // and handle logic via messages. 
  // However, the backend needs userId for some logic (self-registration).
  // We'll treat the connection as "always on" or retry.
  
  useEffect(() => {
    // Only connect if we have a userId? Or always?
    // Let's connect always, effectively.
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log('Connected to WebSocket');
      setIsConnected(true);
      
      // Auto-register if userId exists in storage
      const uid = localStorage.getItem('sktodo_user_id');
      if (uid) {
         ws.send(JSON.stringify({ type: 'invite', content: { targetId: 'SELF_REGISTRATION', hostId: uid } }));
      }
    };

    ws.onmessage = (event) => {
      if (event.data === 'OK') return;
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        console.log('Received:', message);
        
        // Notify all handlers
        handlersRef.current.forEach(handler => handler(message));
      } catch (error) {
        console.warn('Received non-JSON message:', event.data);
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from WebSocket');
      setIsConnected(false);
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, []);

  const sendMessage = useCallback((type: MessageType, content: any) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type, content }));
    } else {
      console.warn('WebSocket is not connected');
    }
  }, [socket]);

  const registerHandler = useCallback((handler: (msg: WebSocketMessage) => void) => {
    handlersRef.current.add(handler);
    return () => {
      handlersRef.current.delete(handler);
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ isConnected, sendMessage, registerHandler }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
