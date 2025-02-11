'use client';

import { useEffect, useRef } from 'react';
import p5 from 'p5';
import { countries } from './select-with-flag';

interface Particle {
  pos: p5.Vector;
  vel: p5.Vector;
  acc: p5.Vector;
  maxSpeed: number;
  color: p5.Color;
  alpha: number;
}

interface UserDetailsParticle extends Particle {
  name: string;
  country: string;
  flag: string;
}

interface MouseForce {
  pos: p5.Vector;
  strength: number;
  maxStrength: number;
}

export function FlowField() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const sketch = (p: p5) => {
      const particles: (Particle | UserDetailsParticle)[] = [];
      const NUM_PARTICLES = 1000;
      let flowField: p5.Vector[][] = [];
      const FIELD_SCALE = 20; // Size of each flow field cell
      let cols: number;
      let rows: number;
      let zoff = 0;

      // Mouse interaction
      let mouseForce: MouseForce | null = null;
      const MAX_FORCE_STRENGTH = 5;
      const FORCE_GROWTH_RATE = 0.2;
      const FORCE_RADIUS = 200;

      const createFlowField = () => {
        let yoff = 0;
        for (let y = 0; y < rows; y++) {
          let xoff = 0;
          flowField[y] = [];
          for (let x = 0; x < cols; x++) {
            // Base flow field from noise
            const angle = p.noise(xoff, yoff, zoff) * p.TWO_PI * 4;
            const v = p5.Vector.fromAngle(angle);
            v.setMag(1);

            // Add mouse force influence if active
            if (mouseForce) {
              const cellPos = p.createVector(x * FIELD_SCALE, y * FIELD_SCALE);
              const distToMouse = p5.Vector.dist(cellPos, mouseForce.pos);

              if (distToMouse < FORCE_RADIUS) {
                // Create force vector pointing away from mouse
                const forceDir = p5.Vector.sub(cellPos, mouseForce.pos);
                const forceMag = p.map(distToMouse, 0, FORCE_RADIUS, mouseForce.strength, 0);
                forceDir.setMag(forceMag);
                v.add(forceDir);
              }
            }

            flowField[y][x] = v;
            xoff += 0.1;
          }
          yoff += 0.1;
        }
        zoff += 0.001; // Slowly change flow field over time
      };

      const initParticles = () => {
        for (let i = 0; i < NUM_PARTICLES; i++) {
          particles.push({
            pos: p.createVector(p.random(p.width), p.random(p.height)),
            vel: p.createVector(0, 0),
            acc: p.createVector(0, 0),
            maxSpeed: p.random(2, 4),
            color: p.color(p.random(360), 80, 100, 0.5),
            alpha: p.random(20, 50),
          });
        }
      };

      const updateParticle = (particle: Particle) => {
        const x = p.floor(particle.pos.x / FIELD_SCALE);
        const y = p.floor(particle.pos.y / FIELD_SCALE);

        if (x >= 0 && x < cols && y >= 0 && y < rows) {
          const force = flowField[y][x];
          particle.acc.add(force);

          // Additional acceleration away from mouse force
          if (mouseForce) {
            const distToMouse = p5.Vector.dist(particle.pos, mouseForce.pos);
            if (distToMouse < FORCE_RADIUS) {
              const repel = p5.Vector.sub(particle.pos, mouseForce.pos);
              repel.setMag(mouseForce.strength * p.map(distToMouse, 0, FORCE_RADIUS, 1, 0));
              particle.acc.add(repel);
            }
          }
        }

        particle.vel.add(particle.acc);
        particle.vel.limit(particle.maxSpeed);
        particle.pos.add(particle.vel);
        particle.acc.mult(0);

        // Wrap around edges
        if (particle.pos.x > p.width) particle.pos.x = 0;
        if (particle.pos.x < 0) particle.pos.x = p.width;
        if (particle.pos.y > p.height) particle.pos.y = 0;
        if (particle.pos.y < 0) particle.pos.y = p.height;
      };

      const createUserDetailsParticle = (name: string, country: string): UserDetailsParticle => {
        // Find the flag from our predefined countries
        const flag =
          countries
            .flatMap((group) => group.items)
            .find((item: { value: string; flag: string }) => item.value === country)?.flag || '🌍';

        return {
          pos: p.createVector(p.random(p.width), p.random(p.height)),
          vel: p.createVector(0, 0),
          acc: p.createVector(0, 0),
          maxSpeed: p.random(1, 2), // Slightly slower than regular particles
          color: p.color(p.random(360), 80, 100, 0.5),
          alpha: p.random(200, 255),
          name,
          country,
          flag,
        };
      };

      p.setup = () => {
        const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
        canvas.parent(canvasRef.current!);
        p.colorMode(p.HSB);
        p.background(0);
        p.textAlign(p.CENTER, p.CENTER);

        cols = p.floor(p.width / FIELD_SCALE);
        rows = p.floor(p.height / FIELD_SCALE);
        flowField = new Array(rows);

        initParticles();

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
              // Add new user details particle
              particles.push(createUserDetailsParticle(name, country));
              // Remove oldest user details particle if there are too many
              const userDetailsCount = particles.filter((p): p is UserDetailsParticle => 'name' in p).length;
              if (userDetailsCount > 5) {
                const index = particles.findIndex((p): p is UserDetailsParticle => 'name' in p);
                if (index !== -1) {
                  particles.splice(index, 1);
                }
              }
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
            maxStrength: MAX_FORCE_STRENGTH * p.random(0.8, 1.2), // Slight randomness
          };
        });

        canvas.mouseReleased(() => {
          mouseForce = null;
        });
      };

      p.draw = () => {
        // Clear background completely for text
        p.background(0);

        // Draw semi-transparent background for particle trails only
        p.push();
        p.noStroke();
        p.fill(0, 0.9); // Slightly more opaque to reduce trails
        p.rect(0, 0, p.width, p.height);
        p.pop();

        // Update mouse force
        if (mouseForce) {
          mouseForce.pos.set(p.mouseX, p.mouseY);
          mouseForce.strength = p.min(mouseForce.strength + FORCE_GROWTH_RATE, mouseForce.maxStrength);

          // Visualize force field (optional)
          p.noFill();
          p.stroke(0, 0, 100, 0.1);
          p.circle(mouseForce.pos.x, mouseForce.pos.y, FORCE_RADIUS * 2);
        }

        createFlowField();

        // First draw all regular particles
        particles.forEach((particle) => {
          updateParticle(particle);

          if (!('name' in particle)) {
            // Draw regular particle
            p.stroke(p.hue(particle.color), p.saturation(particle.color), p.brightness(particle.color), particle.alpha);
            p.strokeWeight(1);
            const prevX = particle.pos.x - particle.vel.x;
            const prevY = particle.pos.y - particle.vel.y;
            p.line(prevX, prevY, particle.pos.x, particle.pos.y);
          }
        });

        // Then draw all text particles on top
        particles.forEach((particle) => {
          if ('name' in particle) {
            p.push();
            p.translate(particle.pos.x, particle.pos.y);

            // Draw text
            p.fill(255);
            p.noStroke();
            p.textSize(14);
            p.text(particle.name, 0, -8);
            p.textSize(10);
            const combinedText = `${particle.flag} ${particle.country}`;
            p.text(combinedText, 0, 8);

            p.pop();
          }
        });
      };

      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
        cols = p.floor(p.width / FIELD_SCALE);
        rows = p.floor(p.height / FIELD_SCALE);
        flowField = new Array(rows);
        particles.length = 0;
        initParticles();
        p.background(0);
      };
    };

    new p5(sketch);

    return () => {
      if (canvasRef.current?.childNodes[0]) {
        canvasRef.current.childNodes[0].remove();
      }
    };
  }, []);

  return <div ref={canvasRef} className="fixed inset-0" />;
}
