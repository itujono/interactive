'use client';

import { useEffect, useRef } from 'react';
import p5 from 'p5';
import { CloudSystem } from './systems/cloud-system';
import { ParticleSystem } from './systems/particle-system';
import { UserSystem } from './systems/user-system';
import { WindSystem } from './systems/wind-system';
import { PlantSystem } from './systems/plant-system';
import { SCENE_CONSTANTS } from './utils/constants';

export function GardenScene() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const sketch = (p: p5) => {
      let cloudSystem: CloudSystem;
      let particleSystem: ParticleSystem;
      let userSystem: UserSystem;
      let windSystem: WindSystem;
      let plantSystem: PlantSystem;
      let time = 0;
      let mouseHoldStart = 0;
      let lastMousePos = { x: 0, y: 0 };

      p.setup = () => {
        const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
        canvas.parent(canvasRef.current!);
        p.colorMode(p.HSB);
        p.background(0, 0, 100);
        p.textAlign(p.CENTER, p.CENTER);

        // Initialize systems
        cloudSystem = new CloudSystem(p, SCENE_CONSTANTS.NUM_CLOUDS);
        particleSystem = new ParticleSystem(p, SCENE_CONSTANTS.NUM_PARTICLES);
        userSystem = new UserSystem(p);
        windSystem = new WindSystem(p);
        plantSystem = new PlantSystem(p);

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

        // Mouse handlers
        canvas.mousePressed(() => {
          mouseHoldStart = p.millis();
          lastMousePos = { x: p.mouseX, y: p.mouseY };
        });

        canvas.mouseReleased(() => {
          const dx = p.mouseX - lastMousePos.x;
          const dy = p.mouseY - lastMousePos.y;
          const moveDistance = Math.sqrt(dx * dx + dy * dy);

          if (moveDistance < 10) {
            const holdTime = p.millis() - mouseHoldStart;
            plantSystem.addPlant(lastMousePos.x, lastMousePos.y, holdTime);
          }
        });

        canvas.mouseMoved(() => {
          if (p.mouseIsPressed) {
            windSystem.update(p.mouseX, p.mouseY, lastMousePos, true);
            lastMousePos = { x: p.mouseX, y: p.mouseY };
          }
        });
      };

      p.draw = () => {
        p.background(0, 0, 100);
        time += 0.02;

        // Update wind system
        windSystem.update(p.mouseX, p.mouseY, lastMousePos, p.mouseIsPressed);
        const windForce = windSystem.getWindForce();
        const windAngle = windSystem.getWindAngle();

        // Draw wind indicator
        windSystem.draw();

        // Update and draw all systems in correct order
        cloudSystem.update(windForce, windAngle);
        cloudSystem.draw();

        particleSystem.update(time, windForce, windAngle);
        particleSystem.draw();

        plantSystem.update(time, windAngle, windForce);
        plantSystem.draw(time);

        userSystem.update(time, windForce, windAngle);
        userSystem.draw(time);
      };

      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
        cloudSystem.handleResize();
        particleSystem.handleResize();
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
