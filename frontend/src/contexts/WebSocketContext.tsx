import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface CallProgress {
  call_id: number;
  status: string;
  progress: number;
  stage: string;
}

interface WebSocketContextType {
  connected: boolean;
  callProgress: Map<number, CallProgress>;
  lastMessage: any | null;
}

const WebSocketContext = createContext<WebSocketContextType>({
  connected: false,
  callProgress: new Map(),
  lastMessage: null,
});

const WS_URL = import.meta.env.VITE_WS_URL || `ws://${window.location.hostname}:8000/ws`;

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [callProgress, setCallProgress] = useState<Map<number, CallProgress>>(new Map());
  const [lastMessage, setLastMessage] = useState<any>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { token } = useAuth();

  const handleMessage = useCallback((data: any) => {
    setLastMessage(data);

    if (data.type === 'call_progress') {
      setCallProgress((prev) => {
        const next = new Map(prev);
        if (data.status === 'analyzed' || data.status === 'failed') {
          // Keep briefly then remove — or keep for reference
          next.set(data.call_id, data);
          setTimeout(() => {
            setCallProgress((p) => {
              const n = new Map(p);
              n.delete(data.call_id);
              return n;
            });
          }, 10000);
        } else {
          next.set(data.call_id, data);
        }
        return next;
      });
    }
  }, []);

  useEffect(() => {
    if (!token) return;

    const connect = () => {
      try {
        const ws = new WebSocket(WS_URL);

        ws.onopen = () => {
          setConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            handleMessage(data);
          } catch { /* ignore */ }
        };

        ws.onclose = () => {
          setConnected(false);
          reconnectTimer.current = setTimeout(connect, 5000);
        };

        ws.onerror = () => ws.close();
        wsRef.current = ws;
      } catch {
        reconnectTimer.current = setTimeout(connect, 5000);
      }
    };

    connect();

    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [token, handleMessage]);

  return (
    <WebSocketContext.Provider value={{ connected, callProgress, lastMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export const useWebSocket = () => useContext(WebSocketContext);
