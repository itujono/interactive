import p5 from 'p5';
import { UserDetailsParticle } from '../types';
import { SCENE_CONSTANTS } from '../utils/constants';
import { countries } from '../../../components/select-with-flag';

export class UserSystem {
  private particles: UserDetailsParticle[] = [];
  private p: p5;

  constructor(p: p5) {
    this.p = p;
  }

  public addUser(name: string, country: string) {
    // Add new user details particle
    this.particles.push(this.createUserDetailsParticle(name, country));
    // Remove oldest particle if there are too many
    if (this.particles.length > SCENE_CONSTANTS.MAX_USERS) {
      this.particles.shift();
    }
  }

  private createUserDetailsParticle(name: string, country: string): UserDetailsParticle {
    // Find the flag from our predefined countries
    const flag = countries.flatMap((group) => group.items).find((item) => item.value === country)?.flag || '🌍';

    // Randomly decide if particle starts from left or right
    const startFromLeft = Math.random() > 0.5;
    const x = startFromLeft ? -100 : this.p.width + 100;
    const velocityX = startFromLeft
      ? this.p.random(SCENE_CONSTANTS.USER.VELOCITY.MIN, SCENE_CONSTANTS.USER.VELOCITY.MAX)
      : this.p.random(-SCENE_CONSTANTS.USER.VELOCITY.MAX, -SCENE_CONSTANTS.USER.VELOCITY.MIN);

    // Create particle with space-themed colors
    const hue = this.p.random(200, 280); // Blue to purple range
    return {
      x,
      y: this.p.random(this.p.height * 0.2, this.p.height * 0.8), // Random height within middle 60% of screen
      name,
      country,
      flag,
      color: this.p.color(hue, this.p.random(70, 90), this.p.random(80, 100)),
      alpha: 255,
      rotation: 0,
      rotationSpeed: 0,
      size: 60,
      velocityX,
      velocityY: this.p.random(-0.05, 0.05), // Slight vertical drift
    };
  }

  public update() {
    this.particles.forEach((particle) => {
      // Update position
      particle.x += particle.velocityX;
      particle.y += particle.velocityY;

      // Add slight wave motion to vertical movement
      particle.y += Math.sin(this.p.frameCount * 0.02 + particle.x * 0.01) * 0.2;

      // Keep vertical position within bounds
      if (particle.y < this.p.height * 0.1) {
        particle.y = this.p.height * 0.1;
        particle.velocityY *= -1;
      } else if (particle.y > this.p.height * 0.9) {
        particle.y = this.p.height * 0.9;
        particle.velocityY *= -1;
      }

      // Reset to opposite side when going off screen
      if (particle.velocityX > 0 && particle.x > this.p.width + 100) {
        particle.x = -100;
        particle.y = this.p.random(this.p.height * 0.2, this.p.height * 0.8);
      } else if (particle.velocityX < 0 && particle.x < -100) {
        particle.x = this.p.width + 100;
        particle.y = this.p.random(this.p.height * 0.2, this.p.height * 0.8);
      }
    });
  }

  public draw(cameraX: number, cameraY: number) {
    this.particles.forEach((particle) => {
      const screenX = particle.x - cameraX * SCENE_CONSTANTS.USER.PARALLAX_FACTOR;
      const screenY = particle.y - cameraY * SCENE_CONSTANTS.USER.PARALLAX_FACTOR;

      this.p.push();
      this.p.translate(screenX, screenY);

      // Draw text
      this.p.fill(255);
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
      if (particle.y > this.p.height * 0.9) {
        particle.y = this.p.random(this.p.height * 0.2, this.p.height * 0.8);
      }
    });
  }
}
