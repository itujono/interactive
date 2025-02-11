import p5 from 'p5';
import { Cloud } from '../types';

export class CloudSystem {
  private clouds: Cloud[] = [];
  private p: p5;

  constructor(p: p5, numClouds: number) {
    this.p = p;
    this.initialize(numClouds);
  }

  private initialize(numClouds: number) {
    for (let i = 0; i < numClouds; i++) {
      this.clouds.push(this.createCloud());
    }
  }

  private createCloud(): Cloud {
    return {
      pos: this.p.createVector(this.p.random(this.p.width), this.p.random(this.p.height * 0.05, this.p.height * 0.2)),
      vel: this.p.createVector(this.p.random(0.2, 0.4) * (Math.random() > 0.5 ? 1 : -1), 0),
      width: this.p.random(100, 200),
      height: this.p.random(40, 60),
      alpha: this.p.random(100, 150),
      segments: this.p.floor(this.p.random(3, 6)),
    };
  }

  public update(windForce: number, windAngle: number) {
    this.clouds.forEach((cloud) => {
      // Add wind influence (horizontal only)
      const windInfluence = this.p.map(windForce, 0, 1, 0, 0.5);
      cloud.vel.x = this.p.lerp(cloud.vel.x, Math.cos(windAngle) * windInfluence + (cloud.vel.x > 0 ? 0.2 : -0.2), 0.1);

      // Update position
      cloud.pos.add(cloud.vel);

      // Wrap around horizontally while maintaining height
      if (cloud.pos.x > this.p.width + cloud.width) {
        cloud.pos.x = -cloud.width;
        cloud.pos.y = this.p.random(this.p.height * 0.05, this.p.height * 0.2);
      } else if (cloud.pos.x < -cloud.width) {
        cloud.pos.x = this.p.width + cloud.width;
        cloud.pos.y = this.p.random(this.p.height * 0.05, this.p.height * 0.2);
      }

      // Ensure clouds stay within vertical bounds
      if (cloud.pos.y < this.p.height * 0.05) cloud.pos.y = this.p.height * 0.05;
      if (cloud.pos.y > this.p.height * 0.2) cloud.pos.y = this.p.height * 0.2;
    });
  }

  public draw() {
    this.clouds.forEach((cloud) => {
      this.p.push();
      this.p.translate(cloud.pos.x, cloud.pos.y);
      this.p.noStroke();

      const baseSize = cloud.height;

      // First pass - larger base circles
      for (let i = 0; i < cloud.segments; i++) {
        const t = i / (cloud.segments - 1);
        const x = this.p.lerp(-cloud.width * 0.35, cloud.width * 0.35, t);
        const y = this.p.sin(t * this.p.PI) * (cloud.height * 0.15);
        const segmentSize = baseSize * (0.8 + this.p.sin(t * this.p.PI) * 0.3);

        // Base cloud color (blueish white)
        this.p.fill(210, 30, 100, cloud.alpha * 0.7);
        this.p.ellipse(x, y, segmentSize, segmentSize);

        // Highlight
        this.p.fill(210, 20, 100, cloud.alpha * 0.3);
        this.p.ellipse(x, y - segmentSize * 0.2, segmentSize * 0.8, segmentSize * 0.7);
      }

      // Second pass - smaller detail circles for better connection
      for (let i = 0; i < cloud.segments - 1; i++) {
        const t = (i + 0.5) / (cloud.segments - 1);
        const x = this.p.lerp(-cloud.width * 0.35, cloud.width * 0.35, t);
        const y = this.p.sin((t + 0.5) * this.p.PI) * (cloud.height * 0.15);
        const segmentSize = baseSize * 0.7;

        this.p.fill(210, 30, 100, cloud.alpha * 0.5);
        this.p.ellipse(x, y, segmentSize, segmentSize);
      }

      this.p.pop();
    });
  }

  public handleResize() {
    this.clouds.forEach((cloud) => {
      if (cloud.pos.y > this.p.height * 0.3) {
        cloud.pos.y = this.p.random(this.p.height * 0.1, this.p.height * 0.3);
      }
    });
  }
}
