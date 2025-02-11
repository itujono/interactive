'use client';

import { useEffect, useRef } from 'react';
import p5 from 'p5';
import { FlowFieldSystem } from './systems/flow-field-system';
import { ParticleSystem } from './systems/particle-system';
import { UserSystem } from './systems/user-system';
import { MouseForce } from './types';
import { SCENE_CONSTANTS } from './utils/constants';

export function FlowFieldScene() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const sketch = (p: p5) => {
      let flowFieldSystem: FlowFieldSystem;
      let particleSystem: ParticleSystem;
      let userSystem: UserSystem;
      let mouseForce: MouseForce | null = null;

      p.setup = () => {
        const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
        canvas.parent(canvasRef.current!);
        p.colorMode(p.HSB);
        p.background(SCENE_CONSTANTS.BACKGROUND.COLOR);
        p.textAlign(p.CENTER, p.CENTER);

        // Initialize systems
        flowFieldSystem = new FlowFieldSystem(p);
        particleSystem = new ParticleSystem(p);
        userSystem = new UserSystem(p);

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
          mouseForce = {
            pos: p.createVector(p.mouseX, p.mouseY),
            strength: 0,
            maxStrength: SCENE_CONSTANTS.FORCE.MAX_STRENGTH * p.random(0.8, 1.2), // Slight randomness
          };
        });

        canvas.mouseReleased(() => {
          mouseForce = null;
        });
      };

      p.draw = () => {
        // Clear background completely for text
        p.background(SCENE_CONSTANTS.BACKGROUND.COLOR);

        // Draw semi-transparent background for particle trails
        p.push();
        p.noStroke();
        p.fill(SCENE_CONSTANTS.BACKGROUND.COLOR, SCENE_CONSTANTS.BACKGROUND.OPACITY);
        p.rect(0, 0, p.width, p.height);
        p.pop();

        // Update mouse force
        if (mouseForce) {
          mouseForce.pos.set(p.mouseX, p.mouseY);
          mouseForce.strength = p.min(mouseForce.strength + SCENE_CONSTANTS.FORCE.GROWTH_RATE, mouseForce.maxStrength);
        }

        // Update and draw all systems
        flowFieldSystem.update(mouseForce);
        flowFieldSystem.visualizeField(mouseForce);

        particleSystem.update(flowFieldSystem.getFlowVector.bind(flowFieldSystem), mouseForce);
        particleSystem.draw();

        userSystem.update(flowFieldSystem.getFlowVector.bind(flowFieldSystem), mouseForce);
        userSystem.draw();
      };

      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
        flowFieldSystem.handleResize();
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
