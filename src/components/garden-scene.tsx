'use client';

import { useEffect, useRef } from 'react';
import p5 from 'p5';

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

export function GardenScene() {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const sketch = (p: p5) => {
      const plants: Plant[] = [];
      const particles: Particle[] = [];
      const NUM_PARTICLES = 100;
      let time = 0;
      let windForce = 0;
      let windAngle = 0;
      let targetWindAngle = 0;
      const MAX_PLANTS = 30;
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

      const createFlower = (pos: p5.Vector, plantColor: p5.Color): Flower => {
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
          const petalX = p.cos(angle) * size * 0.5;
          const petalY = p.sin(angle) * size * 0.5;
          p.push();
          p.translate(petalX, petalY);
          p.rotate(angle);
          p.ellipse(0, 0, size * 0.7, size * 0.3);
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

        // Draw leaf shape
        p.beginShape();
        for (let i = 0; i <= 10; i++) {
          const t = i / 10;
          const x = leaf.size * t;
          const y = leaf.size * 0.3 * p.sin(t * p.PI);
          p.vertex(x, y);
        }
        for (let i = 10; i >= 0; i--) {
          const t = i / 10;
          const x = leaf.size * t;
          const y = -leaf.size * 0.3 * p.sin(t * p.PI);
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
          vel: p.createVector(p.random(-0.5, 0.5), p.random(-0.5, 0.5)),
          size: type === 'light' ? p.random(2, 4) : p.random(4, 8),
          color,
          alpha: type === 'light' ? p.random(50, 100) : p.random(150, 200),
          rotationSpeed: p.random(-0.02, 0.02),
          rotation: p.random(p.TWO_PI),
          type,
        };
      };

      const updateParticle = (particle: Particle) => {
        particle.pos.add(particle.vel);
        particle.rotation += particle.rotationSpeed;

        // Add wind influence
        const windInfluence = p.map(windForce, 0, 1, 0, 0.3);
        particle.vel.x += Math.cos(windAngle) * windInfluence;
        particle.vel.y += Math.sin(windAngle) * windInfluence;

        // Add some waviness to movement
        particle.vel.x += p.sin(time + particle.pos.y * 0.01) * 0.01;
        particle.vel.y += p.cos(time + particle.pos.x * 0.01) * 0.01;

        // Apply drag to stabilize movement
        particle.vel.mult(0.99);

        // Wrap around edges
        if (particle.pos.x > p.width) particle.pos.x = 0;
        if (particle.pos.x < 0) particle.pos.x = p.width;
        if (particle.pos.y > p.height) particle.pos.y = 0;
        if (particle.pos.y < 0) particle.pos.y = p.height;
      };

      const growPlant = (plant: Plant) => {
        if (plant.growthProgress >= 1) return;

        plant.growthProgress = Math.min(1, plant.growthProgress + plant.growthSpeed);
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
            plant.flowers.push(createFlower(mainStem.end, plant.color));
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

              // Add leaves to branches
              if (plant.growthProgress > 0.6 && plant.leaves.length < numBranches * 2) {
                plant.leaves.push(
                  createLeaf(branch.end, branchAngle + p.QUARTER_PI),
                  createLeaf(branch.end, branchAngle - p.QUARTER_PI)
                );
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

        // Initialize particles
        for (let i = 0; i < NUM_PARTICLES; i++) {
          particles.push(createParticle());
        }

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
        // Plain white background, no alpha to prevent gradient buildup
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

        // Update and draw particles
        particles.forEach((particle) => {
          updateParticle(particle);
          p.push();
          p.translate(particle.pos.x, particle.pos.y);
          p.rotate(particle.rotation);
          p.noStroke();

          if (particle.type === 'light') {
            // Draw light particle with glow effect
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
              { pos: p.createVector(0, 0), size: particle.size, angle: particle.rotation, baseAngle: 0, swayOffset: 0 },
              particle.color,
              0
            );
          } else {
            p.ellipse(0, 0, particle.size, particle.size);
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
