import { createContext, useContext, useEffect, useRef, ReactNode, useState } from 'react';
import { useAuth } from './AuthContext';

interface WebSocketContextType {
  connected: boolean;
  lastMessage: any | null;
}

const WebSocketContext = createContext<WebSocketContextType>({ connected: false, lastMessage: null });

const WS_URL = import.meta.env.VITE_WS_URL || `ws://${window.location.hostname}:8000/ws`;

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const reconnectRef = useRef<number>();
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;

    const connect = () => {
      try {
        const ws = new WebSocket(`${WS_URL}?token=${token}`);

        ws.onopen = () => {
          setConnected(true);
          console.log('[WS] Connected');
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            setLastMessage(data);
          } catch { /* ignore */}
        };

        ws.onclose = () => {
          setConnected(false);
          console.log('[WS] Disconnected, reconnecting in 5s...');
          reconnectRef.current = window.setTimeout(connect, 5000);
        };

        ws.onerror = () => ws.close();
        wsRef.current = ws;
      } catch {
        reconnectRef.current = window.setTimeout(connect, 5000);
      }
    };

    connect();

    return () => {
      clearTimeout(reconnectRef.current);
      wsRef.current?.close();
    };
  }, [token]);

  return (
    <WebSocketContext.Provider value={{ connected, lastMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export const useWebSocket = () => useContext(WebSocketContext);
