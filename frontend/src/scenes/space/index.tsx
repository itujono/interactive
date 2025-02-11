'use client';

import { useEffect, useRef } from 'react';
import p5 from 'p5';
import { StarSystem } from './systems/star-system';
import { PlanetSystem } from './systems/planet-system';
import { UserSystem } from './systems/user-system';
import { CameraSystem } from './systems/camera-system';
import { SCENE_CONSTANTS } from './utils/constants';

export function SpaceScene() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const sketch = (p: p5) => {
      let starSystem: StarSystem;
      let planetSystem: PlanetSystem;
      let userSystem: UserSystem;
      let cameraSystem: CameraSystem;

      p.setup = () => {
        const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
        canvas.parent(canvasRef.current!);
        p.colorMode(p.HSB);
        p.background(0);
        p.textAlign(p.CENTER, p.CENTER);

        // Initialize systems
        starSystem = new StarSystem(p);
        planetSystem = new PlanetSystem(p);
        userSystem = new UserSystem(p);
        cameraSystem = new CameraSystem(p);

        // Setup WebSocket connection
        const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_BACKEND_URL || 'ws://localhost:3002');
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('Display WebSocket Connected');
          const registerMessage = {
            type: 'SCENE_STATUS',
            clientType: 'display',
            status: 'ready',
          };
          ws.send(JSON.stringify(registerMessage));
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            if (message.type === 'CONTROL_INPUT' && message.payload?.userDetails) {
              const { name, country } = message.payload.userDetails;
              userSystem.addUser(name, country);
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        // Mouse event handlers
        canvas.mousePressed(() => {
          cameraSystem.startDrag(p.mouseX, p.mouseY);
        });

        canvas.mouseReleased(() => {
          cameraSystem.endDrag();
        });
      };

      p.draw = () => {
        p.background(0);

        // Update camera
        cameraSystem.update(p.mouseX, p.mouseY);
        const { x: cameraX, y: cameraY } = cameraSystem.getPosition();

        // Update and draw all systems in correct order
        starSystem.draw(p.frameCount, cameraX, cameraY);
        planetSystem.update();
        planetSystem.draw(cameraX, cameraY);
        userSystem.update();
        userSystem.draw(cameraX, cameraY);
      };

      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
        starSystem.handleResize();
        planetSystem.handleResize();
        userSystem.handleResize();
      };
    };

    new p5(sketch);

    return () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
      if (canvasRef.current?.childNodes[0]) {
        canvasRef.current.childNodes[0].remove();
      }
    };
  }, []);

  return <div ref={canvasRef} className="fixed inset-0" />;
}
