'use client';

import { SparklesIcon, TvIcon, SunIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Tabs } from '@/components/tabs';
import type { SceneKey, SceneMessage, SceneMap } from '@/types/scenes';
import { toast } from 'sonner';

const SCENE_LABELS: SceneMap = {
  space: 'Space',
  'flow-field': 'Flow Field',
  garden: 'Garden',
};

export default function TabSwitcher() {
  const [scene, setScene] = useState<SceneKey | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    // Create WebSocket connection
    const websocket = new WebSocket('ws://localhost:3002');

    websocket.onopen = () => {
      console.log('WebSocket Connected');
      // Request current scene status
      const message: SceneMessage = {
        type: 'SCENE_STATUS',
        clientType: 'control',
        status: 'ready',
      };
      websocket.send(JSON.stringify(message));
    };

    websocket.onmessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data) as SceneMessage;

        // Handle both scene changes and status updates
        if (message.type === 'SCENE_CHANGE' && message.scene) {
          const newScene = message.scene;
          setScene((prevScene) => {
            // Only show toast for updates, not initial scene
            if (prevScene !== null) {
              toast.info(`Scene synced to ${SCENE_LABELS[newScene]}`);
            }
            return newScene;
          });
        }
        // Handle initial scene status
        else if (message.type === 'SCENE_STATUS' && message.scene) {
          setScene(message.scene);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    websocket.onerror = (event: Event) => {
      console.error('WebSocket Error:', (event as ErrorEvent).message);
    };

    websocket.onclose = (event: CloseEvent) => {
      console.log('WebSocket Disconnected:', event.code, event.reason);
      setScene(null);
    };

    setWs(websocket);

    return () => {
      if (websocket.readyState === WebSocket.OPEN) {
        websocket.close();
      }
    };
  }, []);

  const handleSceneChange = (value: string) => {
    const newScene = value as SceneKey;
    setScene(newScene);
    toast.success(`Scene changed to ${SCENE_LABELS[newScene]}`);

    if (ws?.readyState === WebSocket.OPEN) {
      const message: SceneMessage = {
        type: 'SCENE_CHANGE',
        scene: newScene,
      };
      ws.send(JSON.stringify(message));
    }
  };

  // Show loading state until we receive the initial scene
  if (scene === null) {
    return <div className="flex items-center justify-center">Loading scene status...</div>;
  }

  return (
    <Tabs
      value={scene}
      onChange={handleSceneChange}
      className="self-center flex"
      tabs={[
        { label: 'Space', value: 'space', icon: SparklesIcon },
        { label: 'Flow Field', value: 'flow-field', icon: TvIcon },
        { label: 'Garden', value: 'garden', icon: SunIcon },
      ]}
    />
  );
}
