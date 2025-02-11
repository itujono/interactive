'use client';

import { useEffect, useRef } from 'react';
import p5 from 'p5';
import { countries } from './select-with-flag';

interface Plant {
  x: number;
  y: number;
  segments: Branch[];
  flowers: Flower[];
  leaves: Leaf[];
  maxHeight: number;
  growthProgress: number;
  growthSpeed: number;
  swayOffset: number;
  color: p5.Color;
  type: 'flower' | 'grass' | 'tree';
}

interface Branch {
  start: p5.Vector;
  end: p5.Vector;
  thickness: number;
  angle: number;
  length: number;
  children: Branch[];
}

interface Flower {
  pos: p5.Vector;
  size: number;
  color: p5.Color;
  petalCount: number;
  rotation: number;
  bloomProgress: number;
}

interface Leaf {
  pos: p5.Vector;
  size: number;
  angle: number;
  baseAngle: number;
  swayOffset: number;
}

interface Particle {
  pos: p5.Vector;
  vel: p5.Vector;
  size: number;
  color: p5.Color;
  alpha: number;
  rotationSpeed: number;
  rotation: number;
  type: 'petal' | 'leaf' | 'light';
}

interface UserDetailsParticle {
  pos: p5.Vector;
  vel: p5.Vector;
  acc: p5.Vector;
  maxSpeed: number;
  color: p5.Color;
  alpha: number;
  name: string;
  country: string;
  flag: string;
  glowPhase: number;
  glowSpeed: number;
  curveOffset: number;
  curveScale: number;
}

interface Cloud {
  pos: p5.Vector;
  vel: p5.Vector;
  width: number;
  height: number;
  alpha: number;
  segments: number;
}

export function GardenScene() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const sketch = (p: p5) => {
      const plants: Plant[] = [];
      const particles: (Particle | UserDetailsParticle)[] = [];
      const clouds: Cloud[] = [];
      const NUM_PARTICLES = 50;
      const NUM_CLOUDS = 5;
      let time = 0;
      let windForce = 0;
      let windAngle = 0;
      let targetWindAngle = 0;
      const MAX_PLANTS = 20;
      let mouseHoldStart = 0;
      let lastMousePos = { x: 0, y: 0 };

      const createBranch = (start: p5.Vector, angle: number, length: number, thickness: number): Branch => {
        const end = p5.Vector.add(start, p5.Vector.fromAngle(angle, length));
        return {
          start,
          end,
          thickness,
          angle,
          length,
          children: [],
        };
      };

      const getRandomPlantColor = (type: Plant['type']): p5.Color => {
        if (type === 'grass') {
          // Green variations for grass
          return p.color(p.random(80, 120), p.random(60, 80), p.random(70, 90));
        } else if (type === 'flower') {
          // Keep stems naturally green
          return p.color(p.random(80, 120), p.random(60, 80), p.random(70, 90));
        } else {
          // Brown-green variations for trees
          return p.color(p.random(20, 40), p.random(50, 70), p.random(60, 80));
        }
      };

      const createFlower = (pos: p5.Vector): Flower => {
        // Vibrant colors for flower petals
        const flowerColors = [
          [320, 340], // Pink
          [40, 60], // Yellow
          [20, 35], // Orange
          [270, 290], // Purple
          [350, 360], // Red
          [180, 220], // Blue
        ];
        const [hueMin, hueMax] = flowerColors[p.floor(p.random(flowerColors.length))];
        return {
          pos,
          size: p.random(15, 25),
          color: p.color(p.random(hueMin, hueMax), p.random(70, 90), p.random(85, 95)),
          petalCount: p.floor(p.random(5, 9)),
          rotation: p.random(p.TWO_PI),
          bloomProgress: 0,
        };
      };

      const createLeaf = (pos: p5.Vector, baseAngle: number): Leaf => ({
        pos,
        size: p.random(10, 20),
        angle: baseAngle,
        baseAngle,
        swayOffset: p.random(p.TWO_PI),
      });

      const drawFlower = (flower: Flower, sway: number) => {
        p.push();
        p.translate(flower.pos.x, flower.pos.y);
        p.rotate(flower.rotation + sway);

        const size = flower.size * flower.bloomProgress;
        const innerSize = size * 0.3;

        // Draw petals
        p.noStroke();
        p.fill(flower.color);
        for (let i = 0; i < flower.petalCount; i++) {
          const angle = (i / flower.petalCount) * p.TWO_PI;
          // Adjust petal positioning to be more natural
          const petalOffset = size * 0.3; // Distance from center
          const petalX = p.cos(angle) * petalOffset;
          const petalY = p.sin(angle) * petalOffset;

          p.push();
          p.translate(petalX, petalY);
          p.rotate(angle);
          // Make petals slightly more elongated and natural looking
          p.ellipse(0, 0, size * 0.8, size * 0.35);
          p.pop();
        }

        // Draw center
        p.fill(p.hue(flower.color), p.saturation(flower.color) * 0.7, p.brightness(flower.color) * 0.8);
        p.ellipse(0, 0, innerSize, innerSize);
        p.pop();
      };

      const drawLeaf = (leaf: Leaf, plantColor: p5.Color, sway: number) => {
        p.push();
        p.translate(leaf.pos.x, leaf.pos.y);
        p.rotate(leaf.angle + sway);

        p.noStroke();
        p.fill(p.hue(plantColor), p.saturation(plantColor) * 1.2, p.brightness(plantColor) * 1.1);

        // Simpler, more natural leaf shape
        p.beginShape();
        const leafWidth = leaf.size * 0.4;
        const points = 12;

        for (let i = 0; i <= points; i++) {
          const t = i / points;
          const x = leaf.size * t;
          const y = leafWidth * p.sin(t * p.PI);
          p.vertex(x, y);
        }
        for (let i = points; i >= 0; i--) {
          const t = i / points;
          const x = leaf.size * t;
          const y = -leafWidth * p.sin(t * p.PI);
          p.vertex(x, y);
        }
        p.endShape(p.CLOSE);
        p.pop();
      };

      const createParticle = () => {
        const types: Particle['type'][] = ['petal', 'leaf', 'light'];
        const type = types[p.floor(p.random(types.length))];
        const pos = p.createVector(p.random(p.width), p.random(p.height));

        let color;
        if (type === 'petal') {
          color = p.color(p.random(320, 360), p.random(60, 80), p.random(80, 100));
        } else if (type === 'leaf') {
          color = p.color(p.random(80, 120), p.random(70, 90), p.random(60, 80));
        } else {
          color = p.color(50, 30, 100);
        }

        return {
          pos,
          vel: p.createVector(p.random(-0.3, 0.3), p.random(-0.3, 0.3)),
          size: type === 'light' ? p.random(2, 3) : p.random(3, 6),
          color,
          alpha: type === 'light' ? p.random(40, 80) : p.random(120, 160),
          rotationSpeed: p.random(-0.01, 0.01),
          rotation: p.random(p.TWO_PI),
          type,
        };
      };

      const createUserDetailsParticle = (name: string, country: string): UserDetailsParticle => {
        // Find the flag from our predefined countries
        const flag = countries.flatMap((group) => group.items).find((item) => item.value === country)?.flag || '🌍';

        return {
          pos: p.createVector(p.random(p.width), p.random(p.height)),
          vel: p.createVector(0, 0),
          acc: p.createVector(0, 0),
          maxSpeed: p.random(0.8, 1.2), // Gentle movement
          color: p.color(60, 100, 100), // Warm yellow for firefly glow
          alpha: p.random(200, 255),
          name,
          country,
          flag,
          glowPhase: p.random(p.TWO_PI), // For pulsing effect
          glowSpeed: p.random(0.02, 0.04), // How fast it pulses
          curveOffset: p.random(p.TWO_PI), // For curved movement
          curveScale: p.random(30, 50), // Size of curved movement
        };
      };

      const createCloud = (): Cloud => {
        return {
          // Position clouds in the upper 20% of the viewport
          pos: p.createVector(p.random(p.width), p.random(p.height * 0.05, p.height * 0.2)),
          vel: p.createVector(p.random(0.2, 0.4) * (Math.random() > 0.5 ? 1 : -1), 0),
          width: p.random(100, 200),
          height: p.random(40, 60),
          alpha: p.random(100, 150),
          segments: p.floor(p.random(3, 6)),
        };
      };

      const updateParticle = (particle: Particle | UserDetailsParticle) => {
        particle.pos.add(particle.vel);

        // Handle rotation only for regular particles
        if (!('name' in particle)) {
          particle.rotation += particle.rotationSpeed;
        }

        // Add wind influence
        const windInfluence = p.map(windForce, 0, 1, 0, 0.3);
        particle.vel.x += Math.cos(windAngle) * windInfluence;
        particle.vel.y += Math.sin(windAngle) * windInfluence;

        // Add some waviness to movement
        particle.vel.x += p.sin(time + particle.pos.y * 0.01) * 0.01;
        particle.vel.y += p.cos(time + particle.pos.x * 0.01) * 0.01;

        // Apply drag to stabilize movement
        particle.vel.mult(0.99);

        // Wrap around edges with different behavior for user details
        if ('name' in particle) {
          // Reset to top when reaching bottom for user details
          if (particle.pos.y > p.height + 50) {
            particle.pos.y = -50;
            particle.pos.x = p.random(p.width);
          }
          // Bounce off sides
          if (particle.pos.x > p.width) {
            particle.pos.x = p.width;
            particle.vel.x *= -1;
          }
          if (particle.pos.x < 0) {
            particle.pos.x = 0;
            particle.vel.x *= -1;
          }
        } else {
          // Original wrapping behavior for normal particles
          if (particle.pos.x > p.width) particle.pos.x = 0;
          if (particle.pos.x < 0) particle.pos.x = p.width;
          if (particle.pos.y > p.height) particle.pos.y = 0;
          if (particle.pos.y < 0) particle.pos.y = p.height;
        }
      };

      const updateCloud = (cloud: Cloud) => {
        // Add wind influence (horizontal only)
        const windInfluence = p.map(windForce, 0, 1, 0, 0.5);
        cloud.vel.x = p.lerp(cloud.vel.x, Math.cos(windAngle) * windInfluence + (cloud.vel.x > 0 ? 0.2 : -0.2), 0.1);

        // Update position
        cloud.pos.add(cloud.vel);

        // Wrap around horizontally while maintaining height
        if (cloud.pos.x > p.width + cloud.width) {
          cloud.pos.x = -cloud.width;
          // Reset height within the desired range when wrapping
          cloud.pos.y = p.random(p.height * 0.05, p.height * 0.2);
        } else if (cloud.pos.x < -cloud.width) {
          cloud.pos.x = p.width + cloud.width;
          // Reset height within the desired range when wrapping
          cloud.pos.y = p.random(p.height * 0.05, p.height * 0.2);
        }

        // Ensure clouds stay within vertical bounds
        if (cloud.pos.y < p.height * 0.05) cloud.pos.y = p.height * 0.05;
        if (cloud.pos.y > p.height * 0.2) cloud.pos.y = p.height * 0.2;
      };

      const drawCloud = (cloud: Cloud) => {
        p.push();
        p.translate(cloud.pos.x, cloud.pos.y);
        p.noStroke();

        // Draw multiple overlapping circles for cloud shape
        const baseSize = cloud.height;

        // First pass - larger base circles
        for (let i = 0; i < cloud.segments; i++) {
          const t = i / (cloud.segments - 1);
          // Reduce spacing between segments by multiplying width by 0.7
          const x = p.lerp(-cloud.width * 0.35, cloud.width * 0.35, t);
          // Add slight vertical variation
          const y = p.sin(t * p.PI) * (cloud.height * 0.15);
          // Vary segment size more naturally
          const segmentSize = baseSize * (0.8 + p.sin(t * p.PI) * 0.3);

          // Base cloud color (blueish white)
          p.fill(210, 30, 100, cloud.alpha * 0.7);
          p.ellipse(x, y, segmentSize, segmentSize);

          // Highlight
          p.fill(210, 20, 100, cloud.alpha * 0.3);
          p.ellipse(x, y - segmentSize * 0.2, segmentSize * 0.8, segmentSize * 0.7);
        }

        // Second pass - smaller detail circles for better connection
        for (let i = 0; i < cloud.segments - 1; i++) {
          const t = (i + 0.5) / (cloud.segments - 1);
          const x = p.lerp(-cloud.width * 0.35, cloud.width * 0.35, t);
          const y = p.sin((t + 0.5) * p.PI) * (cloud.height * 0.15);
          const segmentSize = baseSize * 0.7;

          p.fill(210, 30, 100, cloud.alpha * 0.5);
          p.ellipse(x, y, segmentSize, segmentSize);
        }

        p.pop();
      };

      const growPlant = (plant: Plant) => {
        if (plant.growthProgress >= 1) return;

        // Increase growth speed
        const growthMultiplier = plant.type === 'tree' ? 2 : 3;
        plant.growthProgress = Math.min(1, plant.growthProgress + plant.growthSpeed * growthMultiplier);
        const currentHeight = plant.maxHeight * plant.growthProgress;

        // Clear existing segments
        plant.segments = [];

        const baseAngle = -p.HALF_PI;
        // Make sway respond to wind direction
        const windInfluence = Math.cos(plant.swayOffset - windAngle);
        const sway = windInfluence * windForce * 0.3;

        if (plant.type === 'flower') {
          // Create main stem
          const mainStem = createBranch(
            p.createVector(plant.x, plant.y),
            baseAngle + sway * 0.5,
            currentHeight,
            3 * plant.growthProgress
          );
          plant.segments.push(mainStem);

          // Update or create flower
          if (plant.growthProgress > 0.7 && plant.flowers.length === 0) {
            // Calculate the flower position at the end of the stem
            const flowerPos = p.createVector(
              mainStem.end.x,
              // Offset the Y position slightly up to center the flower on the stem
              mainStem.end.y - 5
            );
            plant.flowers.push(createFlower(flowerPos));
          }
          plant.flowers.forEach((flower) => {
            flower.bloomProgress = p.map(plant.growthProgress, 0.7, 1, 0, 1, true);
          });

          // Add leaves
          if (plant.growthProgress > 0.3 && plant.leaves.length < 2) {
            const leafHeight = currentHeight * 0.5;
            const leafPos = p.createVector(
              p.lerp(mainStem.start.x, mainStem.end.x, 0.5),
              p.lerp(mainStem.start.y, mainStem.end.y, 0.5)
            );
            plant.leaves.push(
              createLeaf(leafPos, baseAngle + p.QUARTER_PI),
              createLeaf(leafPos, baseAngle - p.QUARTER_PI)
            );
          }
        } else if (plant.type === 'grass') {
          // Create multiple grass blades
          const numBlades = 3;
          for (let i = 0; i < numBlades; i++) {
            const offset = p.map(i, 0, numBlades - 1, -10, 10);
            const blade = createBranch(
              p.createVector(plant.x + offset, plant.y),
              baseAngle + sway + p.random(-0.2, 0.2),
              currentHeight * p.random(0.8, 1),
              2 * plant.growthProgress
            );
            plant.segments.push(blade);
          }
        } else {
          // Tree type
          const mainStem = createBranch(
            p.createVector(plant.x, plant.y),
            baseAngle + sway * 0.3,
            currentHeight,
            5 * plant.growthProgress
          );
          plant.segments.push(mainStem);

          if (plant.growthProgress > 0.3) {
            const numBranches = p.floor(p.map(plant.growthProgress, 0.3, 1, 2, 5));
            for (let i = 0; i < numBranches; i++) {
              const t = p.map(i, 0, numBranches - 1, 0.3, 0.8);
              const branchStart = p.createVector(
                p.lerp(mainStem.start.x, mainStem.end.x, t),
                p.lerp(mainStem.start.y, mainStem.end.y, t)
              );
              const branchAngle = baseAngle + (i % 2 === 0 ? 0.7 : -0.7) + sway * 0.5;
              const branch = createBranch(branchStart, branchAngle, currentHeight * 0.4, 3 * plant.growthProgress);
              plant.segments.push(branch);

              // Simplified leaf positioning
              if (plant.growthProgress > 0.6 && plant.leaves.length < numBranches * 2) {
                // Add leaf at the end of each branch
                const leafPos = p.createVector(branch.end.x, branch.end.y);

                // Align leaf with branch angle but with slight variation
                const leafAngle = branchAngle + (i % 2 === 0 ? 0.2 : -0.2);
                plant.leaves.push(createLeaf(leafPos, leafAngle));
              }
            }
          }
        }
      };

      const drawPlant = (plant: Plant) => {
        const sway = p.sin(time + plant.swayOffset) * 0.1 * windForce;

        // Draw segments
        plant.segments.forEach((segment) => {
          p.stroke(p.hue(plant.color), p.saturation(plant.color), p.brightness(plant.color));
          p.strokeWeight(segment.thickness);
          p.line(segment.start.x, segment.start.y, segment.end.x, segment.end.y);
        });

        // Draw leaves
        plant.leaves.forEach((leaf) => {
          const leafSway = sway + p.sin(time + leaf.swayOffset) * 0.05 * windForce;
          drawLeaf(leaf, plant.color, leafSway);
        });

        // Draw flowers
        plant.flowers.forEach((flower) => {
          drawFlower(flower, sway);
        });
      };

      p.setup = () => {
        const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
        canvas.parent(canvasRef.current!);
        p.colorMode(p.HSB);
        p.background(0, 0, 100);
        p.textAlign(p.CENTER, p.CENTER);

        // Initialize particles
        for (let i = 0; i < NUM_PARTICLES; i++) {
          particles.push(createParticle());
        }

        // Initialize clouds
        for (let i = 0; i < NUM_CLOUDS; i++) {
          clouds.push(createCloud());
        }

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
              const userDetailsCount = particles.filter((p) => 'name' in p).length;
              if (userDetailsCount > 5) {
                const index = particles.findIndex((p) => 'name' in p);
                if (index !== -1) {
                  particles.splice(index, 1);
                }
              }
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

          // Only create plant if we haven't moved much from the click position
          if (moveDistance < 10 && plants.length < MAX_PLANTS) {
            const holdTime = p.millis() - mouseHoldStart;
            let type: Plant['type'] = 'grass';

            if (holdTime > 1000) {
              type = 'tree';
            } else if (holdTime > 500) {
              type = 'flower';
            }

            plants.push({
              x: lastMousePos.x,
              y: lastMousePos.y,
              segments: [],
              flowers: [],
              leaves: [],
              maxHeight: type === 'tree' ? p.random(150, 250) : p.random(50, 100),
              growthProgress: 0,
              growthSpeed: type === 'tree' ? 0.003 : 0.01,
              swayOffset: p.random(p.TWO_PI),
              color: getRandomPlantColor(type),
              type,
            });
          }
        });

        canvas.mouseMoved(() => {
          if (p.mouseIsPressed) {
            const dx = p.mouseX - lastMousePos.x;
            const dy = p.mouseY - lastMousePos.y;
            const moveSpeed = Math.sqrt(dx * dx + dy * dy);

            // Update wind force based on mouse movement speed
            windForce = p.lerp(windForce, p.min(moveSpeed * 0.1, 1), 0.2);

            // Update wind angle based on mouse movement direction
            if (moveSpeed > 1) {
              targetWindAngle = Math.atan2(dy, dx);
            }

            lastMousePos = { x: p.mouseX, y: p.mouseY };
          }
        });
      };

      p.draw = () => {
        p.background(0, 0, 100);
        time += 0.02;

        // Smoothly interpolate wind angle
        const angleDiff = ((targetWindAngle - windAngle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
        windAngle += angleDiff * 0.1;

        // Draw wind indicator (optional visual feedback)
        if (windForce > 0.1) {
          p.push();
          p.translate(50, 50);
          p.stroke(0, 0, 50, windForce * 0.3);
          p.noFill();
          const arrowLength = 20 * windForce;
          p.line(0, 0, Math.cos(windAngle) * arrowLength, Math.sin(windAngle) * arrowLength);
          p.pop();
        }

        // Decay wind force more gradually
        windForce *= 0.99;

        // Update and draw clouds first (behind everything)
        clouds.forEach((cloud) => {
          updateCloud(cloud);
          drawCloud(cloud);
        });

        // Update and draw particles
        particles.forEach((particle) => {
          updateParticle(particle);
          p.push();

          if ('name' in particle) {
            // Add gentle curved movement
            const curveX = Math.cos(time + particle.curveOffset) * particle.curveScale;
            const curveY = Math.sin(time * 0.5 + particle.curveOffset) * (particle.curveScale * 0.5);

            p.translate(particle.pos.x + curveX, particle.pos.y + curveY);

            // Draw text
            p.noStroke();
            p.fill(0); // Black text
            p.textSize(14);
            p.text(particle.name, 0, -8);
            p.textSize(10);
            const combinedText = `${particle.flag} ${particle.country}`;
            p.text(combinedText, 0, 8);
          } else {
            // Regular particle drawing
            p.translate(particle.pos.x, particle.pos.y);
            p.rotate(particle.rotation);
            p.noStroke();

            if (particle.type === 'light') {
              const glowSize = particle.size * 2;
              p.fill(
                p.hue(particle.color),
                p.saturation(particle.color),
                p.brightness(particle.color),
                particle.alpha * 0.3
              );
              p.ellipse(0, 0, glowSize, glowSize);
            }

            p.fill(p.hue(particle.color), p.saturation(particle.color), p.brightness(particle.color), particle.alpha);
            if (particle.type === 'petal') {
              p.ellipse(0, 0, particle.size, particle.size * 0.5);
            } else if (particle.type === 'leaf') {
              drawLeaf(
                {
                  pos: p.createVector(0, 0),
                  size: particle.size,
                  angle: particle.rotation,
                  baseAngle: 0,
                  swayOffset: 0,
                },
                particle.color,
                0
              );
            } else {
              p.ellipse(0, 0, particle.size, particle.size);
            }
          }
          p.pop();
        });

        // Update and draw plants
        plants.forEach((plant) => {
          growPlant(plant);
          drawPlant(plant);
        });

        // Draw hold indicator only if we haven't moved much from the click position
        if (p.mouseIsPressed && plants.length < MAX_PLANTS) {
          const dx = p.mouseX - lastMousePos.x;
          const dy = p.mouseY - lastMousePos.y;
          const moveDistance = Math.sqrt(dx * dx + dy * dy);

          if (moveDistance < 10) {
            const holdTime = p.millis() - mouseHoldStart;
            const radius = p.map(holdTime, 0, 1000, 10, 30);
            p.noFill();
            p.stroke(0, 0, 50, 0.2);
            p.circle(p.mouseX, p.mouseY, radius * 2);
          }
        }
      };

      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
        // Adjust cloud positions on resize
        clouds.forEach((cloud) => {
          if (cloud.pos.y > p.height * 0.3) {
            cloud.pos.y = p.random(p.height * 0.1, p.height * 0.3);
          }
        });
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
