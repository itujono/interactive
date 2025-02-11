import p5 from 'p5';
import { UserDetailsParticle, MouseForce } from '../types';
import { SCENE_CONSTANTS } from '../utils/constants';
import { countries } from '../../../components/select-with-flag';

export class UserSystem {
  private particles: UserDetailsParticle[] = [];
  private p: p5;

  constructor(p: p5) {
    this.p = p;
  }

  public addUser(name: string, country: string) {
    this.particles.push(this.createUserDetailsParticle(name, country));
    if (this.particles.length > SCENE_CONSTANTS.MAX_USERS) {
      this.particles.shift();
    }
  }

  private createUserDetailsParticle(name: string, country: string): UserDetailsParticle {
    const flag = countries.flatMap((group) => group.items).find((item) => item.value === country)?.flag || '🌍';

    return {
      pos: this.p.createVector(this.p.random(this.p.width), this.p.random(this.p.height)),
      vel: this.p.createVector(0, 0),
      acc: this.p.createVector(0, 0),
      maxSpeed: this.p.random(SCENE_CONSTANTS.USER.SPEED.MIN, SCENE_CONSTANTS.USER.SPEED.MAX),
      color: this.p.color(
        this.p.random(SCENE_CONSTANTS.USER.COLOR.HUE.MIN, SCENE_CONSTANTS.USER.COLOR.HUE.MAX),
        this.p.random(SCENE_CONSTANTS.USER.COLOR.SATURATION.MIN, SCENE_CONSTANTS.USER.COLOR.SATURATION.MAX),
        this.p.random(SCENE_CONSTANTS.USER.COLOR.BRIGHTNESS.MIN, SCENE_CONSTANTS.USER.COLOR.BRIGHTNESS.MAX)
      ),
      alpha: this.p.random(SCENE_CONSTANTS.USER.ALPHA.MIN, SCENE_CONSTANTS.USER.ALPHA.MAX),
      name,
      country,
      flag,
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
      this.p.push();
      this.p.translate(particle.pos.x, particle.pos.y);

      // Draw text
      this.p.fill(255);
      this.p.noStroke();
      this.p.textSize(SCENE_CONSTANTS.USER.TEXT.NAME_SIZE);
      this.p.text(particle.name, 0, -SCENE_CONSTANTS.USER.TEXT.SPACING);
      this.p.textSize(SCENE_CONSTANTS.USER.TEXT.DETAILS_SIZE);
      const combinedText = `${particle.flag} ${particle.country}`;
      this.p.text(combinedText, 0, SCENE_CONSTANTS.USER.TEXT.SPACING);

      this.p.pop();
    });
  }

  public handleResize() {
    // Reset particles within new bounds if needed
    this.particles.forEach((particle) => {
      if (particle.pos.x > this.p.width || particle.pos.y > this.p.height) {
        particle.pos.set(this.p.random(this.p.width), this.p.random(this.p.height));
      }
    });
  }
}
