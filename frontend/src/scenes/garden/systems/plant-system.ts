import p5 from 'p5';
import { Plant, Branch, Flower, Leaf } from '../types';
import { SCENE_CONSTANTS } from '../utils/constants';

export class PlantSystem {
  private plants: Plant[] = [];
  private p: p5;

  constructor(p: p5) {
    this.p = p;
  }

  public addPlant(x: number, y: number, holdTime: number) {
    if (this.plants.length >= SCENE_CONSTANTS.MAX_PLANTS) return;

    let type: Plant['type'] = 'grass';
    if (holdTime > SCENE_CONSTANTS.PLANT.TYPES.TREE.HOLD_TIME) {
      type = 'tree';
    } else if (holdTime > SCENE_CONSTANTS.PLANT.TYPES.FLOWER.HOLD_TIME) {
      type = 'flower';
    }

    const typeConfig = SCENE_CONSTANTS.PLANT.TYPES[type.toUpperCase() as keyof typeof SCENE_CONSTANTS.PLANT.TYPES];

    this.plants.push({
      x,
      y,
      segments: [],
      flowers: [],
      leaves: [],
      maxHeight: this.p.random(typeConfig.HEIGHT.MIN, typeConfig.HEIGHT.MAX),
      growthProgress: 0,
      growthSpeed: typeConfig.GROWTH_SPEED,
      swayOffset: this.p.random(this.p.TWO_PI),
      color: this.getRandomPlantColor(type),
      type,
    });
  }

  private getRandomPlantColor(type: Plant['type']): p5.Color {
    if (type === 'grass') {
      return this.p.color(this.p.random(80, 120), this.p.random(60, 80), this.p.random(70, 90));
    } else if (type === 'flower') {
      return this.p.color(this.p.random(80, 120), this.p.random(60, 80), this.p.random(70, 90));
    } else {
      return this.p.color(this.p.random(20, 40), this.p.random(50, 70), this.p.random(60, 80));
    }
  }

  private createBranch(start: p5.Vector, angle: number, length: number, thickness: number): Branch {
    const end = p5.Vector.add(start, p5.Vector.fromAngle(angle, length));
    return {
      start,
      end,
      thickness,
      angle,
      length,
      children: [],
    };
  }

  private createFlower(pos: p5.Vector): Flower {
    const flowerColors = [
      [320, 340], // Pink
      [40, 60], // Yellow
      [20, 35], // Orange
      [270, 290], // Purple
      [350, 360], // Red
      [180, 220], // Blue
    ];
    const [hueMin, hueMax] = flowerColors[this.p.floor(this.p.random(flowerColors.length))];

    return {
      pos,
      size: this.p.random(15, 25),
      color: this.p.color(this.p.random(hueMin, hueMax), this.p.random(70, 90), this.p.random(85, 95)),
      petalCount: this.p.floor(this.p.random(5, 9)),
      rotation: this.p.random(this.p.TWO_PI),
      bloomProgress: 0,
    };
  }

  private createLeaf(pos: p5.Vector, baseAngle: number): Leaf {
    return {
      pos,
      size: this.p.random(10, 20),
      angle: baseAngle,
      baseAngle,
      swayOffset: this.p.random(this.p.TWO_PI),
    };
  }

  private drawFlower(flower: Flower, sway: number) {
    this.p.push();
    this.p.translate(flower.pos.x, flower.pos.y);
    this.p.rotate(flower.rotation + sway);

    const size = flower.size * flower.bloomProgress;
    const innerSize = size * 0.3;

    // Draw petals
    this.p.noStroke();
    this.p.fill(flower.color);
    for (let i = 0; i < flower.petalCount; i++) {
      const angle = (i / flower.petalCount) * this.p.TWO_PI;
      const petalOffset = size * 0.3;
      const petalX = this.p.cos(angle) * petalOffset;
      const petalY = this.p.sin(angle) * petalOffset;

      this.p.push();
      this.p.translate(petalX, petalY);
      this.p.rotate(angle);
      this.p.ellipse(0, 0, size * 0.8, size * 0.35);
      this.p.pop();
    }

    // Draw center
    this.p.fill(this.p.hue(flower.color), this.p.saturation(flower.color) * 0.7, this.p.brightness(flower.color) * 0.8);
    this.p.ellipse(0, 0, innerSize, innerSize);
    this.p.pop();
  }

  private drawLeaf(leaf: Leaf, plantColor: p5.Color, sway: number) {
    this.p.push();
    this.p.translate(leaf.pos.x, leaf.pos.y);
    this.p.rotate(leaf.angle + sway);

    this.p.noStroke();
    this.p.fill(this.p.hue(plantColor), this.p.saturation(plantColor) * 1.2, this.p.brightness(plantColor) * 1.1);

    this.p.beginShape();
    const leafWidth = leaf.size * 0.4;
    const points = 12;

    for (let i = 0; i <= points; i++) {
      const t = i / points;
      const x = leaf.size * t;
      const y = leafWidth * this.p.sin(t * this.p.PI);
      this.p.vertex(x, y);
    }
    for (let i = points; i >= 0; i--) {
      const t = i / points;
      const x = leaf.size * t;
      const y = -leafWidth * this.p.sin(t * this.p.PI);
      this.p.vertex(x, y);
    }
    this.p.endShape(this.p.CLOSE);
    this.p.pop();
  }

  public update(time: number, windAngle: number, windForce: number) {
    this.plants.forEach((plant) => {
      if (plant.growthProgress >= 1) return;

      const growthMultiplier =
        plant.type === 'tree'
          ? SCENE_CONSTANTS.PLANT.GROWTH_MULTIPLIER.TREE
          : SCENE_CONSTANTS.PLANT.GROWTH_MULTIPLIER.OTHER;

      plant.growthProgress = Math.min(1, plant.growthProgress + plant.growthSpeed * growthMultiplier);
      const currentHeight = plant.maxHeight * plant.growthProgress;

      plant.segments = [];
      const baseAngle = -this.p.HALF_PI;
      const windInfluence = Math.cos(plant.swayOffset - windAngle);
      const sway = windInfluence * windForce * 0.3;

      if (plant.type === 'flower') {
        this.updateFlowerPlant(plant, currentHeight, baseAngle, sway);
      } else if (plant.type === 'grass') {
        this.updateGrassPlant(plant, currentHeight, baseAngle, sway);
      } else {
        this.updateTreePlant(plant, currentHeight, baseAngle, sway);
      }
    });
  }

  private updateFlowerPlant(plant: Plant, currentHeight: number, baseAngle: number, sway: number) {
    const mainStem = this.createBranch(
      this.p.createVector(plant.x, plant.y),
      baseAngle + sway * 0.5,
      currentHeight,
      3 * plant.growthProgress
    );
    plant.segments.push(mainStem);

    if (plant.growthProgress > 0.7 && plant.flowers.length === 0) {
      const flowerPos = this.p.createVector(mainStem.end.x, mainStem.end.y - 5);
      plant.flowers.push(this.createFlower(flowerPos));
    }
    plant.flowers.forEach((flower) => {
      flower.bloomProgress = this.p.map(plant.growthProgress, 0.7, 1, 0, 1, true);
    });

    if (plant.growthProgress > 0.3 && plant.leaves.length < 2) {
      const leafPos = this.p.createVector(
        this.p.lerp(mainStem.start.x, mainStem.end.x, 0.5),
        this.p.lerp(mainStem.start.y, mainStem.end.y, 0.5)
      );
      plant.leaves.push(
        this.createLeaf(leafPos, baseAngle + this.p.QUARTER_PI),
        this.createLeaf(leafPos, baseAngle - this.p.QUARTER_PI)
      );
    }
  }

  private updateGrassPlant(plant: Plant, currentHeight: number, baseAngle: number, sway: number) {
    const numBlades = 3;
    for (let i = 0; i < numBlades; i++) {
      const offset = this.p.map(i, 0, numBlades - 1, -10, 10);
      const blade = this.createBranch(
        this.p.createVector(plant.x + offset, plant.y),
        baseAngle + sway + this.p.random(-0.2, 0.2),
        currentHeight * this.p.random(0.8, 1),
        2 * plant.growthProgress
      );
      plant.segments.push(blade);
    }
  }

  private updateTreePlant(plant: Plant, currentHeight: number, baseAngle: number, sway: number) {
    const mainStem = this.createBranch(
      this.p.createVector(plant.x, plant.y),
      baseAngle + sway * 0.3,
      currentHeight,
      5 * plant.growthProgress
    );
    plant.segments.push(mainStem);

    if (plant.growthProgress > 0.3) {
      const numBranches = this.p.floor(this.p.map(plant.growthProgress, 0.3, 1, 2, 5));
      for (let i = 0; i < numBranches; i++) {
        const t = this.p.map(i, 0, numBranches - 1, 0.3, 0.8);
        const branchStart = this.p.createVector(
          this.p.lerp(mainStem.start.x, mainStem.end.x, t),
          this.p.lerp(mainStem.start.y, mainStem.end.y, t)
        );
        const branchAngle = baseAngle + (i % 2 === 0 ? 0.7 : -0.7) + sway * 0.5;
        const branch = this.createBranch(branchStart, branchAngle, currentHeight * 0.4, 3 * plant.growthProgress);
        plant.segments.push(branch);

        if (plant.growthProgress > 0.6 && plant.leaves.length < numBranches * 2) {
          const leafPos = this.p.createVector(branch.end.x, branch.end.y);
          const leafAngle = branchAngle + (i % 2 === 0 ? 0.2 : -0.2);
          plant.leaves.push(this.createLeaf(leafPos, leafAngle));
        }
      }
    }
  }

  public draw(time: number) {
    this.plants.forEach((plant) => {
      const sway = this.p.sin(time + plant.swayOffset) * 0.1;

      // Draw segments
      plant.segments.forEach((segment) => {
        this.p.stroke(this.p.hue(plant.color), this.p.saturation(plant.color), this.p.brightness(plant.color));
        this.p.strokeWeight(segment.thickness);
        this.p.line(segment.start.x, segment.start.y, segment.end.x, segment.end.y);
      });

      // Draw leaves
      plant.leaves.forEach((leaf) => {
        const leafSway = sway + this.p.sin(time + leaf.swayOffset) * 0.05;
        this.drawLeaf(leaf, plant.color, leafSway);
      });

      // Draw flowers
      plant.flowers.forEach((flower) => {
        this.drawFlower(flower, sway);
      });
    });
  }
}
