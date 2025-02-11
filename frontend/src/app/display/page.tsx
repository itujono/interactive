'use client';

import { useEffect, useState, Suspense, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type { SceneKey, SceneMessage } from '../../types/scenes';

const GardenScene = dynamic(() => import('../../components/garden-scene').then((mod) => mod.GardenScene), {
  loading: () => (
    <div className="text-primary flex min-h-screen items-center justify-center font-bold">Loading Garden Scene...</div>
  ),
  ssr: false,
});

const SpaceScene = dynamic(() => import('../../components/space-scene').then((mod) => mod.SpaceScene), {
  loading: () => (
    <div className="text-primary flex min-h-screen items-center justify-center font-bold">Loading Space Scene...</div>
  ),
  ssr: false,
});

const FlowField = dynamic(() => import('../../components/flow-field').then((mod) => mod.FlowField), {
  loading: () => (
    <div className="text-primary flex min-h-screen items-center justify-center font-bold">Loading Flow Field...</div>
  ),
  ssr: false,
});

export default function DisplayPage() {
  const [currentScene, setCurrentScene] = useState<SceneKey | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [isTimeout, setIsTimeout] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (status === 'loading' || !currentScene) {
        setIsTimeout(true);
        setStatus('error');
      }
    }, 5000); // 5 seconds timeout

    return () => clearTimeout(timeoutId);
  }, [status, currentScene]);

  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setIsTimeout(false); // Reset timeout state on new connection
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_BACKEND_URL || 'ws://localhost:3002');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Display WebSocket Connected');
      // First register as display client
      const registerMessage: SceneMessage = {
        type: 'SCENE_STATUS',
        clientType: 'display',
        status: 'ready',
      };
      ws.send(JSON.stringify(registerMessage));

      // Then request current scene status
      const statusMessage: SceneMessage = {
        type: 'SCENE_STATUS',
        status: 'ready',
      };
      ws.send(JSON.stringify(statusMessage));
    };

    ws.onmessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data) as SceneMessage;
        console.log('Received message:', message);

        if (message.scene) {
          setCurrentScene(message.scene);
          setStatus('ready');
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (event: Event) => {
      console.error('WebSocket Error:', (event as ErrorEvent).message);
      setStatus('error');
    };

    ws.onclose = (event: CloseEvent) => {
      console.log('WebSocket Disconnected:', event.code, event.reason);
      setStatus('error');
      setCurrentScene(null);
      // Try to reconnect after a delay
      setTimeout(() => {
        console.log('Attempting to reconnect...');
        connectWebSocket();
      }, 5000);
    };
  }, []);

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, [connectWebSocket]);

  const renderScene = () => {
    if (!currentScene) return null;

    switch (currentScene) {
      case 'garden':
        return (
          <Suspense
            fallback={
              <div className="text-primary-foreground flex min-h-screen items-center justify-center font-bold">
                Loading Garden Scene...
              </div>
            }
          >
            <GardenScene />
          </Suspense>
        );
      case 'space':
        return (
          <Suspense
            fallback={
              <div className="text-primary-foreground flex min-h-screen items-center justify-center font-bold">
                Loading Space Scene...
              </div>
            }
          >
            <SpaceScene />
          </Suspense>
        );
      case 'flow-field':
        return (
          <Suspense
            fallback={
              <div className="text-primary-foreground flex min-h-screen items-center justify-center font-bold">
                Loading Flow Field...
              </div>
            }
          >
            <FlowField />
          </Suspense>
        );
      default:
        return null;
    }
  };

  if (status === 'loading' || !currentScene) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <div className="font-bold">Loading scene status...</div>
        <div className="text-muted-foreground text-sm">
          {isTimeout ? (
            <>
              Connection is taking longer than usual.
              <button
                onClick={() => {
                  setStatus('loading');
                  setIsTimeout(false);
                  connectWebSocket();
                }}
                className="ml-2 hover:underline"
              >
                Try again
              </button>
            </>
          ) : (
            'Please wait while we connect to the server...'
          )}
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <div className="text-destructive font-bold">Connection Error</div>
        <div className="text-muted-foreground text-sm">
          {isTimeout ? 'Connection timed out.' : 'Failed to connect to the server.'}{' '}
          <button
            onClick={() => {
              setStatus('loading');
              setIsTimeout(false);
              connectWebSocket();
            }}
            className="text-destructive hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return <main className="relative min-h-screen w-full overflow-hidden bg-[#f4f1ea]">{renderScene()}</main>;
}
