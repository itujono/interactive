import p5 from 'p5';
import { BaseParticle, MouseForce } from '../types';
import { SCENE_CONSTANTS } from '../utils/constants';

export class ParticleSystem {
  private particles: BaseParticle[] = [];
  private p: p5;

  constructor(p: p5) {
    this.p = p;
    this.initialize();
  }

  private initialize() {
    this.particles.length = 0;
    for (let i = 0; i < SCENE_CONSTANTS.NUM_PARTICLES; i++) {
      this.particles.push(this.createParticle());
    }
  }

  private createParticle(): BaseParticle {
    return {
      pos: this.p.createVector(this.p.random(this.p.width), this.p.random(this.p.height)),
      vel: this.p.createVector(0, 0),
      acc: this.p.createVector(0, 0),
      maxSpeed: this.p.random(SCENE_CONSTANTS.PARTICLE.SPEED.MIN, SCENE_CONSTANTS.PARTICLE.SPEED.MAX),
      color: this.p.color(
        this.p.random(SCENE_CONSTANTS.PARTICLE.COLOR.HUE_RANGE),
        SCENE_CONSTANTS.PARTICLE.COLOR.SATURATION,
        SCENE_CONSTANTS.PARTICLE.COLOR.BRIGHTNESS,
        SCENE_CONSTANTS.PARTICLE.COLOR.ALPHA
      ),
      alpha: this.p.random(SCENE_CONSTANTS.PARTICLE.ALPHA.MIN, SCENE_CONSTANTS.PARTICLE.ALPHA.MAX),
    };
  }

  public update(getFlowVector: (x: number, y: number) => p5.Vector | null, mouseForce: MouseForce | null) {
    this.particles.forEach((particle) => {
      const flowForce = getFlowVector(particle.pos.x, particle.pos.y);
      if (flowForce) {
        particle.acc.add(flowForce);
      }

      // Additional acceleration away from mouse force
      if (mouseForce) {
        const distToMouse = p5.Vector.dist(particle.pos, mouseForce.pos);
        if (distToMouse < SCENE_CONSTANTS.FORCE.RADIUS) {
          const repel = p5.Vector.sub(particle.pos, mouseForce.pos);
          repel.setMag(mouseForce.strength * this.p.map(distToMouse, 0, SCENE_CONSTANTS.FORCE.RADIUS, 1, 0));
          particle.acc.add(repel);
        }
      }

      particle.vel.add(particle.acc);
      particle.vel.limit(particle.maxSpeed);
      particle.pos.add(particle.vel);
      particle.acc.mult(0);

      // Wrap around edges
      if (particle.pos.x > this.p.width) particle.pos.x = 0;
      if (particle.pos.x < 0) particle.pos.x = this.p.width;
      if (particle.pos.y > this.p.height) particle.pos.y = 0;
      if (particle.pos.y < 0) particle.pos.y = this.p.height;
    });
  }

  public draw() {
    this.particles.forEach((particle) => {
      this.p.stroke(
        this.p.hue(particle.color),
        this.p.saturation(particle.color),
        this.p.brightness(particle.color),
        particle.alpha
      );
      this.p.strokeWeight(1);
      const prevX = particle.pos.x - particle.vel.x;
      const prevY = particle.pos.y - particle.vel.y;
      this.p.line(prevX, prevY, particle.pos.x, particle.pos.y);
    });
  }

  public handleResize() {
    this.initialize();
  }
}
