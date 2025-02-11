'use client';

import { useEffect, useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import type { SceneKey, SceneMessage } from '../../types/scenes';

// Lazy load scene components
const GardenScene = dynamic(() => import('../../components/garden-scene').then((mod) => mod.GardenScene), {
  loading: () => <div className="flex min-h-screen items-center justify-center">Loading Garden Scene...</div>,
  ssr: false,
});

const SpaceScene = dynamic(() => import('../../components/space-scene').then((mod) => mod.SpaceScene), {
  loading: () => <div className="flex min-h-screen items-center justify-center">Loading Space Scene...</div>,
  ssr: false,
});

const FlowField = dynamic(() => import('../../components/flow-field').then((mod) => mod.FlowField), {
  loading: () => <div className="flex min-h-screen items-center justify-center">Loading Flow Field...</div>,
  ssr: false,
});

export default function DisplayPage() {
  const [currentScene, setCurrentScene] = useState<SceneKey>('space');
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3002');

    ws.onopen = () => {
      console.log('Display WebSocket Connected');
      // Register as display client
      const message: SceneMessage = {
        type: 'SCENE_STATUS',
        clientType: 'display',
        status: 'ready',
      };
      ws.send(JSON.stringify(message));
      setStatus('ready');
    };

    ws.onmessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data) as SceneMessage;
        if (message.type === 'SCENE_CHANGE' && message.scene) {
          setCurrentScene(message.scene);
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
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  const renderScene = () => {
    switch (currentScene) {
      case 'garden':
        return (
          <Suspense
            fallback={<div className="flex min-h-screen items-center justify-center">Loading Garden Scene...</div>}
          >
            <GardenScene />
          </Suspense>
        );
      case 'space':
        return (
          <Suspense
            fallback={<div className="flex min-h-screen items-center justify-center">Loading Space Scene...</div>}
          >
            <SpaceScene />
          </Suspense>
        );
      case 'flow-field':
        return (
          <Suspense
            fallback={<div className="flex min-h-screen items-center justify-center">Loading Flow Field...</div>}
          >
            <FlowField />
          </Suspense>
        );
      default:
        return null;
    }
  };

  if (status === 'loading') {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (status === 'error') {
    return <div className="flex min-h-screen items-center justify-center">Connection Error</div>;
  }

  return <main className="relative min-h-screen w-full overflow-hidden bg-[#f4f1ea]">{renderScene()}</main>;
}
