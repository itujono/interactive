'use client';

import { useEffect, useRef } from 'react';
import p5 from 'p5';
import { countries } from './select-with-flag';

interface Star {
  x: number;
  y: number;
  size: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  brightness: number;
  layer: number; // For parallax effect
}

interface Planet {
  x: number;
  y: number;
  size: number;
  color: p5.Color;
  secondaryColor: p5.Color;
  rotationSpeed: number;
  rotation: number;
  hasRings?: boolean;
  ringColor?: p5.Color;
  ringRotation?: number;
  ringWidth?: number;
  ringTilt?: number;
}

interface UserDetailsParticle {
  x: number;
  y: number;
  name: string;
  country: string;
  flag: string;
  color: p5.Color;
  alpha: number;
  rotation: number;
  rotationSpeed: number;
  size: number;
  velocityX: number;
  velocityY: number;
}

export function SpaceScene() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const sketch = (p: p5) => {
      const stars: Star[] = [];
      const planets: Planet[] = [];
      const userParticles: UserDetailsParticle[] = [];
      const NUM_STARS = 400;
      const NUM_PLANETS = 5;

      // Camera position and movement
      let cameraX = 0;
      let cameraY = 0;
      let targetX = 0;
      let targetY = 0;
      const AUTO_PAN_SPEED = 0.2;
      let isDragging = false;
      let dragStartX = 0;
      let dragStartY = 0;
      let cameraDragStartX = 0;
      let cameraDragStartY = 0;

      // Initialize stars with random positions and properties
      const initStars = () => {
        stars.length = 0;
        for (let i = 0; i < NUM_STARS; i++) {
          stars.push({
            x: p.random(p.width * 2) - p.width / 2,
            y: p.random(p.height * 2) - p.height / 2,
            size: p.random(1, 4),
            twinkleSpeed: p.random(0.002, 0.006),
            twinkleOffset: p.random(p.TWO_PI),
            brightness: p.random(180, 255),
            layer: p.random(1, 3),
          });
        }
      };

      // Initialize planets
      const initPlanets = () => {
        planets.length = 0;
        for (let i = 0; i < NUM_PLANETS; i++) {
          // Ensure planets are well-spaced but closer together
          let validPosition = false;
          let x = 0;
          let y = 0;
          let attempts = 0;
          while (!validPosition && attempts < 100) {
            // Reduced spawn area from 3x to 2x viewport size
            x = p.random(p.width * 1.5) - p.width * 0.25;
            y = p.random(p.height * 1.5) - p.height * 0.25;
            validPosition = true;
            // Check distance from other planets (reduced from 200 to 150)
            for (const planet of planets) {
              const d = p.dist(x, y, planet.x, planet.y);
              if (d < 150) {
                validPosition = false;
                break;
              }
            }
            attempts++;
          }

          // If we couldn't find a valid position, place it anyway
          if (!validPosition) {
            x = p.random(p.width * 1.5) - p.width * 0.25;
            y = p.random(p.height * 1.5) - p.height * 0.25;
          }

          // Simplified color scheme for smoother gradients
          const hue = p.random(360);
          const saturation = p.random(40, 80);
          const brightness = p.random(70, 90);
          const mainColor = p.color(hue, saturation, brightness);
          const secondColor = p.color(hue, saturation, brightness * 0.7);

          // 20% chance for a planet to have rings
          const hasRings = i === 0 || p.random() < 0.2;
          const ringHue = (hue + p.random(-30, 30) + 360) % 360;
          const ringColor = hasRings ? p.color(ringHue, saturation * 0.8, brightness * 0.9) : undefined;

          planets.push({
            x,
            y,
            size: p.random(40, 100),
            color: mainColor,
            secondaryColor: secondColor,
            rotationSpeed: p.random(0.001, 0.003),
            rotation: p.random(p.TWO_PI),
            hasRings,
            ringColor,
            ringRotation: hasRings ? p.random(p.TWO_PI) : undefined,
            ringWidth: hasRings ? p.random(1.8, 2.2) : undefined,
            ringTilt: hasRings ? p.random(0.15, 0.3) : undefined,
          });
        }
      };

      const drawPlanetRings = (planet: Planet, isFront: boolean) => {
        if (!planet.hasRings || !planet.ringColor) return;

        p.push();
        // Apply ring tilt
        p.rotate(planet.ringTilt!);

        // Draw outer ring with gradient
        const ringSteps = 40; // Increased for smoother rings
        const innerRadius = planet.size * 0.6;
        const outerRadius = planet.size * planet.ringWidth!;

        // Draw only front or back half based on parameter
        const startAngle = isFront ? 0 : -p.PI;
        const endAngle = isFront ? p.PI : 0;

        for (let i = 0; i < ringSteps; i++) {
          const ratio = i / ringSteps;
          const radius = p.lerp(innerRadius, outerRadius, ratio);
          const alpha = p.sin(ratio * p.PI) * 200; // Reduced max alpha for better blend

          // Create ring color with alpha
          const ringColor = p.color(
            p.hue(planet.ringColor),
            p.saturation(planet.ringColor),
            p.brightness(planet.ringColor),
            alpha
          );

          p.stroke(ringColor);
          p.strokeWeight(1);
          p.noFill();

          // Draw ring as an arc instead of full ellipse
          p.arc(0, 0, radius * 2, radius * 0.5, startAngle, endAngle, p.OPEN);
        }

        // Add detail lines
        const numLines = 12; // Increased number of detail lines
        p.strokeWeight(0.5);
        for (let i = 0; i < numLines; i++) {
          const radius = p.lerp(innerRadius, outerRadius, i / (numLines - 1));
          const alpha = p.sin((i / (numLines - 1)) * p.PI) * 150;
          p.stroke(p.hue(planet.ringColor), p.saturation(planet.ringColor), p.brightness(planet.ringColor), alpha);
          p.arc(0, 0, radius * 2, radius * 0.5, startAngle, endAngle, p.OPEN);
        }

        p.pop();
      };

      const drawPlanet = (planet: Planet) => {
        p.push();
        p.translate(planet.x, planet.y);

        if (planet.hasRings) {
          // Draw back half of rings first
          drawPlanetRings(planet, false);
        }

        // Draw the planet sphere
        p.noStroke();
        const lightAngle = -p.PI / 4;
        const lightX = p.cos(lightAngle);
        const lightY = p.sin(lightAngle);

        const resolution = 50;
        for (let y = -resolution; y <= resolution; y++) {
          for (let x = -resolution; x <= resolution; x++) {
            const px = (x / resolution) * (planet.size / 2);
            const py = (y / resolution) * (planet.size / 2);
            const distFromCenter = p.sqrt(px * px + py * py) / (planet.size / 2);

            if (distFromCenter <= 1) {
              const nx = px / (planet.size / 2);
              const ny = py / (planet.size / 2);
              const nz = p.sqrt(1 - nx * nx - ny * ny);

              if (!isNaN(nz)) {
                const lightIntensity = (nx * lightX + ny * lightY + nz * 0.5) * 0.8 + 0.2;
                const planetColor = p.color(
                  p.hue(planet.color),
                  p.saturation(planet.color),
                  p.brightness(planet.color) * p.constrain(lightIntensity, 0.2, 1)
                );

                p.fill(planetColor);
                p.rect(px, py, planet.size / resolution + 1, planet.size / resolution + 1);
              }
            }
          }
        }

        if (planet.hasRings) {
          // Draw front half of rings last
          drawPlanetRings(planet, true);
        }

        p.pop();
      };

      // Create a user details particle
      const createUserDetailsParticle = (name: string, country: string) => {
        // Find the flag from our predefined countries
        const flag = countries.flatMap((group) => group.items).find((item) => item.value === country)?.flag || '🌍';

        // Randomly decide if particle starts from left or right
        const startFromLeft = Math.random() > 0.5;
        const x = startFromLeft ? -100 : p.width + 100;
        const velocityX = startFromLeft ? p.random(0.5, 1) : p.random(-1, -0.5);

        // Create particle with space-themed colors
        const hue = p.random(200, 280); // Blue to purple range
        return {
          x,
          y: p.random(p.height * 0.2, p.height * 0.8), // Random height within middle 60% of screen
          name,
          country,
          flag,
          color: p.color(hue, p.random(70, 90), p.random(80, 100)),
          alpha: 255,
          rotation: 0, // No rotation needed
          rotationSpeed: 0,
          size: 60,
          velocityX,
          velocityY: p.random(-0.05, 0.05), // Slight vertical drift
        };
      };

      // Update user details particle
      const updateUserParticle = (particle: UserDetailsParticle) => {
        // Update position
        particle.x += particle.velocityX;
        particle.y += particle.velocityY;

        // Add slight wave motion to vertical movement
        particle.y += Math.sin(p.frameCount * 0.02 + particle.x * 0.01) * 0.2;

        // Keep vertical position within bounds
        if (particle.y < p.height * 0.1) {
          particle.y = p.height * 0.1;
          particle.velocityY *= -1;
        } else if (particle.y > p.height * 0.9) {
          particle.y = p.height * 0.9;
          particle.velocityY *= -1;
        }

        // Reset to opposite side when going off screen
        if (particle.velocityX > 0 && particle.x > p.width + 100) {
          particle.x = -100;
          particle.y = p.random(p.height * 0.2, p.height * 0.8);
        } else if (particle.velocityX < 0 && particle.x < -100) {
          particle.x = p.width + 100;
          particle.y = p.random(p.height * 0.2, p.height * 0.8);
        }
      };

      // Draw user details particle
      const drawUserParticle = (particle: UserDetailsParticle, cameraX: number, cameraY: number) => {
        const screenX = particle.x - cameraX * 0.3; // Reduced parallax effect
        const screenY = particle.y - cameraY * 0.3;

        p.push();
        p.translate(screenX, screenY);

        // Draw main text
        p.fill(255);
        p.textSize(14);
        p.text(particle.name, 0, -8);
        p.textSize(10);
        const combinedText = `${particle.flag} ${particle.country}`;
        p.text(combinedText, 0, 8);

        p.pop();
      };

      p.setup = () => {
        const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
        canvas.parent(canvasRef.current!);
        p.colorMode(p.HSB);
        p.background(0);
        p.textAlign(p.CENTER, p.CENTER);
        initStars();
        initPlanets();

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
              userParticles.push(createUserDetailsParticle(name, country));
              // Remove oldest particle if there are too many
              if (userParticles.length > 5) {
                userParticles.shift();
              }
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        // Mouse event handlers
        canvas.mousePressed(() => {
          isDragging = true;
          dragStartX = p.mouseX;
          dragStartY = p.mouseY;
          cameraDragStartX = cameraX;
          cameraDragStartY = cameraY;
        });

        canvas.mouseReleased(() => {
          isDragging = false;
        });
      };

      p.draw = () => {
        p.background(0);

        // Handle manual panning
        if (isDragging) {
          cameraX = cameraDragStartX + (dragStartX - p.mouseX);
          cameraY = cameraDragStartY + (dragStartY - p.mouseY);
        } else {
          // Auto-panning when not dragging
          targetX += AUTO_PAN_SPEED;
          targetY += AUTO_PAN_SPEED * 0.5;
          cameraX += (targetX - cameraX) * 0.05;
          cameraY += (targetY - cameraY) * 0.05;
        }

        // Update and draw stars with parallax
        stars.forEach((star) => {
          const parallaxFactor = star.layer * 0.5;
          const screenX = star.x - cameraX * parallaxFactor;
          const screenY = star.y - cameraY * parallaxFactor;

          // Wrap stars around the screen
          const wrappedX = ((screenX + p.width * 1.5) % (p.width * 2)) - p.width / 2;
          const wrappedY = ((screenY + p.height * 1.5) % (p.height * 2)) - p.height / 2;

          const twinkle = p.sin(p.frameCount * star.twinkleSpeed + star.twinkleOffset);
          const currentBrightness = p.map(twinkle, -1, 1, star.brightness * 0.5, star.brightness);
          const currentSize = p.map(twinkle, -1, 1, star.size * 0.8, star.size);

          p.fill(currentBrightness);
          p.noStroke();
          p.ellipse(wrappedX, wrappedY, currentSize, currentSize);
        });

        // Update and draw user particles
        userParticles.forEach((particle) => {
          updateUserParticle(particle);
          drawUserParticle(particle, cameraX, cameraY);
        });

        // Update and draw planets
        planets.forEach((planet) => {
          planet.rotation += planet.rotationSpeed;
          const screenX = planet.x - cameraX;
          const screenY = planet.y - cameraY;

          // Only draw planets that are near the visible area
          if (
            screenX > -planet.size &&
            screenX < p.width + planet.size &&
            screenY > -planet.size &&
            screenY < p.height + planet.size
          ) {
            drawPlanet({ ...planet, x: screenX, y: screenY });
          }
        });
      };

      // Handle window resize
      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
        initStars();
        initPlanets();
      };
    };

    // Create new p5 instance
    new p5(sketch);

    // Cleanup on unmount
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
