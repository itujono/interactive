import p5 from 'p5';
import { Star } from '../types';
import { SCENE_CONSTANTS } from '../utils/constants';

export class StarSystem {
  private stars: Star[] = [];
  private p: p5;

  constructor(p: p5) {
    this.p = p;
    this.initialize();
  }

  private initialize() {
    this.stars.length = 0;
    for (let i = 0; i < SCENE_CONSTANTS.NUM_STARS; i++) {
      this.stars.push(this.createStar());
    }
  }

  private createStar(): Star {
    return {
      x: this.p.random(this.p.width * 2) - this.p.width / 2,
      y: this.p.random(this.p.height * 2) - this.p.height / 2,
      size: this.p.random(SCENE_CONSTANTS.STAR.SIZE.MIN, SCENE_CONSTANTS.STAR.SIZE.MAX),
      twinkleSpeed: this.p.random(SCENE_CONSTANTS.STAR.TWINKLE.SPEED.MIN, SCENE_CONSTANTS.STAR.TWINKLE.SPEED.MAX),
      twinkleOffset: this.p.random(this.p.TWO_PI),
      brightness: this.p.random(
        SCENE_CONSTANTS.STAR.TWINKLE.BRIGHTNESS.MIN,
        SCENE_CONSTANTS.STAR.TWINKLE.BRIGHTNESS.MAX
      ),
      layer: this.p.random(SCENE_CONSTANTS.STAR.LAYERS.MIN, SCENE_CONSTANTS.STAR.LAYERS.MAX),
    };
  }

  public draw(frameCount: number, cameraX: number, cameraY: number) {
    this.stars.forEach((star) => {
      const parallaxFactor = star.layer * 0.5;
      const screenX = star.x - cameraX * parallaxFactor;
      const screenY = star.y - cameraY * parallaxFactor;

      // Wrap stars around the screen
      const wrappedX = ((screenX + this.p.width * 1.5) % (this.p.width * 2)) - this.p.width / 2;
      const wrappedY = ((screenY + this.p.height * 1.5) % (this.p.height * 2)) - this.p.height / 2;

      const twinkle = this.p.sin(frameCount * star.twinkleSpeed + star.twinkleOffset);
      const currentBrightness = this.p.map(twinkle, -1, 1, star.brightness * 0.5, star.brightness);
      const currentSize = this.p.map(twinkle, -1, 1, star.size * 0.8, star.size);

      this.p.fill(currentBrightness);
      this.p.noStroke();
      this.p.ellipse(wrappedX, wrappedY, currentSize, currentSize);
    });
  }

  public handleResize() {
    this.initialize();
  }
}
