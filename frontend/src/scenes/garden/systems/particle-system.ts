import p5 from 'p5';
import { Particle } from '../types';

export class ParticleSystem {
  private particles: Particle[] = [];
  private p: p5;

  constructor(p: p5, numParticles: number) {
    this.p = p;
    this.initialize(numParticles);
  }

  private initialize(numParticles: number) {
    for (let i = 0; i < numParticles; i++) {
      this.particles.push(this.createParticle());
    }
  }

  private createParticle(): Particle {
    const types: Particle['type'][] = ['petal', 'leaf', 'light'];
    const type = types[this.p.floor(this.p.random(types.length))];
    const pos = this.p.createVector(this.p.random(this.p.width), this.p.random(this.p.height));

    let color;
    if (type === 'petal') {
      color = this.p.color(this.p.random(320, 360), this.p.random(60, 80), this.p.random(80, 100));
    } else if (type === 'leaf') {
      color = this.p.color(this.p.random(80, 120), this.p.random(70, 90), this.p.random(60, 80));
    } else {
      color = this.p.color(50, 30, 100);
    }

    return {
      pos,
      vel: this.p.createVector(this.p.random(-0.3, 0.3), this.p.random(-0.3, 0.3)),
      size: type === 'light' ? this.p.random(2, 3) : this.p.random(3, 6),
      color,
      alpha: type === 'light' ? this.p.random(40, 80) : this.p.random(120, 160),
      rotationSpeed: this.p.random(-0.01, 0.01),
      rotation: this.p.random(this.p.TWO_PI),
      type,
    };
  }

  public update(time: number, windForce: number, windAngle: number) {
    this.particles.forEach((particle) => {
      particle.pos.add(particle.vel);
      particle.rotation += particle.rotationSpeed;

      // Add wind influence
      const windInfluence = this.p.map(windForce, 0, 1, 0, 0.3);
      particle.vel.x += Math.cos(windAngle) * windInfluence;
      particle.vel.y += Math.sin(windAngle) * windInfluence;

      // Add some waviness to movement
      particle.vel.x += this.p.sin(time + particle.pos.y * 0.01) * 0.01;
      particle.vel.y += this.p.cos(time + particle.pos.x * 0.01) * 0.01;

      // Apply drag to stabilize movement
      particle.vel.mult(0.99);

      // Wrap around edges
      if (particle.pos.x > this.p.width) particle.pos.x = 0;
      if (particle.pos.x < 0) particle.pos.x = this.p.width;
      if (particle.pos.y > this.p.height) particle.pos.y = 0;
      if (particle.pos.y < 0) particle.pos.y = this.p.height;
    });
  }

  private drawLeaf(pos: p5.Vector, size: number, angle: number, color: p5.Color) {
    this.p.push();
    this.p.translate(pos.x, pos.y);
    this.p.rotate(angle);

    this.p.noStroke();
    this.p.fill(this.p.hue(color), this.p.saturation(color), this.p.brightness(color));

    // Simple leaf shape
    this.p.beginShape();
    const leafWidth = size * 0.4;
    const points = 12;

    for (let i = 0; i <= points; i++) {
      const t = i / points;
      const x = size * t;
      const y = leafWidth * this.p.sin(t * this.p.PI);
      this.p.vertex(x, y);
    }
    for (let i = points; i >= 0; i--) {
      const t = i / points;
      const x = size * t;
      const y = -leafWidth * this.p.sin(t * this.p.PI);
      this.p.vertex(x, y);
    }
    this.p.endShape(this.p.CLOSE);
    this.p.pop();
  }

  public draw() {
    this.particles.forEach((particle) => {
      this.p.push();
      this.p.translate(particle.pos.x, particle.pos.y);
      this.p.rotate(particle.rotation);
      this.p.noStroke();

      if (particle.type === 'light') {
        const glowSize = particle.size * 2;
        this.p.fill(
          this.p.hue(particle.color),
          this.p.saturation(particle.color),
          this.p.brightness(particle.color),
          particle.alpha * 0.3
        );
        this.p.ellipse(0, 0, glowSize, glowSize);
      }

      this.p.fill(
        this.p.hue(particle.color),
        this.p.saturation(particle.color),
        this.p.brightness(particle.color),
        particle.alpha
      );

      if (particle.type === 'petal') {
        this.p.ellipse(0, 0, particle.size, particle.size * 0.5);
      } else if (particle.type === 'leaf') {
        this.drawLeaf(this.p.createVector(0, 0), particle.size, particle.rotation, particle.color);
      } else {
        this.p.ellipse(0, 0, particle.size, particle.size);
      }
      this.p.pop();
    });
  }

  public handleResize() {
    // Reset particles within new bounds if needed
    this.particles.forEach((particle) => {
      if (particle.pos.x > this.p.width) particle.pos.x = this.p.random(this.p.width);
      if (particle.pos.y > this.p.height) particle.pos.y = this.p.random(this.p.height);
    });
  }
}
