import p5 from 'p5';
import { UserDetailsParticle } from '../types';
import { countries } from '../../../components/select-with-flag';

export class UserSystem {
  private particles: UserDetailsParticle[] = [];
  private p: p5;
  private maxUsers: number = 5;

  constructor(p: p5) {
    this.p = p;
  }

  public addUser(name: string, country: string) {
    this.particles.push(this.createUserDetailsParticle(name, country));

    // Remove oldest if we exceed max users
    if (this.particles.length > this.maxUsers) {
      this.particles.shift();
    }
  }

  private createUserDetailsParticle(name: string, country: string): UserDetailsParticle {
    const flag = countries.flatMap((group) => group.items).find((item) => item.value === country)?.flag || '🌍';

    return {
      pos: this.p.createVector(this.p.random(this.p.width), this.p.random(this.p.height)),
      vel: this.p.createVector(0, 0),
      acc: this.p.createVector(0, 0),
      maxSpeed: this.p.random(0.8, 1.2),
      color: this.p.color(60, 100, 100),
      alpha: this.p.random(200, 255),
      name,
      country,
      flag,
      glowPhase: this.p.random(this.p.TWO_PI),
      glowSpeed: this.p.random(0.02, 0.04),
      curveOffset: this.p.random(this.p.TWO_PI),
      curveScale: this.p.random(30, 50),
    };
  }

  public update(time: number, windForce: number, windAngle: number) {
    this.particles.forEach((particle) => {
      particle.pos.add(particle.vel);

      // Add wind influence
      const windInfluence = this.p.map(windForce, 0, 1, 0, 0.3);
      particle.vel.x += Math.cos(windAngle) * windInfluence;
      particle.vel.y += Math.sin(windAngle) * windInfluence;

      // Add some waviness to movement
      particle.vel.x += this.p.sin(time + particle.pos.y * 0.01) * 0.01;
      particle.vel.y += this.p.cos(time + particle.pos.x * 0.01) * 0.01;

      // Apply drag to stabilize movement
      particle.vel.mult(0.99);

      // Special wrapping behavior for user details
      if (particle.pos.y > this.p.height + 50) {
        particle.pos.y = -50;
        particle.pos.x = this.p.random(this.p.width);
      }
      // Bounce off sides
      if (particle.pos.x > this.p.width) {
        particle.pos.x = this.p.width;
        particle.vel.x *= -1;
      }
      if (particle.pos.x < 0) {
        particle.pos.x = 0;
        particle.vel.x *= -1;
      }
    });
  }

  public draw(time: number) {
    this.particles.forEach((particle) => {
      this.p.push();

      // Add gentle curved movement
      const curveX = Math.cos(time + particle.curveOffset) * particle.curveScale;
      const curveY = Math.sin(time * 0.5 + particle.curveOffset) * (particle.curveScale * 0.5);

      this.p.translate(particle.pos.x + curveX, particle.pos.y + curveY);

      // Draw text
      this.p.noStroke();
      this.p.fill(0);
      this.p.textSize(14);
      this.p.text(particle.name, 0, -8);
      this.p.textSize(10);
      const combinedText = `${particle.flag} ${particle.country}`;
      this.p.text(combinedText, 0, 8);

      this.p.pop();
    });
  }

  public handleResize() {
    // Keep particles within bounds
    this.particles.forEach((particle) => {
      if (particle.pos.x > this.p.width) particle.pos.x = this.p.random(this.p.width);
      if (particle.pos.y > this.p.height) particle.pos.y = this.p.random(this.p.height);
    });
  }
}
