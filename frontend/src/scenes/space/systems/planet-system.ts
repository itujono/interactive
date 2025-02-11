import p5 from 'p5';
import { Planet } from '../types';
import { SCENE_CONSTANTS } from '../utils/constants';

export class PlanetSystem {
  private planets: Planet[] = [];
  private p: p5;

  constructor(p: p5) {
    this.p = p;
    this.initialize();
  }

  private initialize() {
    this.planets.length = 0;
    for (let i = 0; i < SCENE_CONSTANTS.NUM_PLANETS; i++) {
      this.planets.push(this.createPlanet(i));
    }
  }

  private createPlanet(index: number): Planet {
    // Ensure planets are well-spaced
    let validPosition = false;
    let x = 0;
    let y = 0;
    let attempts = 0;

    while (!validPosition && attempts < SCENE_CONSTANTS.PLANET.SPAWN.ATTEMPTS) {
      x =
        this.p.random(this.p.width * SCENE_CONSTANTS.PLANET.SPAWN.AREA_MULTIPLIER) -
        this.p.width * SCENE_CONSTANTS.PLANET.SPAWN.OFFSET;
      y =
        this.p.random(this.p.height * SCENE_CONSTANTS.PLANET.SPAWN.AREA_MULTIPLIER) -
        this.p.height * SCENE_CONSTANTS.PLANET.SPAWN.OFFSET;

      validPosition = true;
      // Check distance from other planets
      for (const planet of this.planets) {
        const d = this.p.dist(x, y, planet.x, planet.y);
        if (d < SCENE_CONSTANTS.PLANET.SPAWN.MIN_DISTANCE) {
          validPosition = false;
          break;
        }
      }
      attempts++;
    }

    // If we couldn't find a valid position, place it anyway
    if (!validPosition) {
      x =
        this.p.random(this.p.width * SCENE_CONSTANTS.PLANET.SPAWN.AREA_MULTIPLIER) -
        this.p.width * SCENE_CONSTANTS.PLANET.SPAWN.OFFSET;
      y =
        this.p.random(this.p.height * SCENE_CONSTANTS.PLANET.SPAWN.AREA_MULTIPLIER) -
        this.p.height * SCENE_CONSTANTS.PLANET.SPAWN.OFFSET;
    }

    // Create planet colors
    const hue = this.p.random(SCENE_CONSTANTS.PLANET.COLOR.HUE_RANGE);
    const saturation = this.p.random(
      SCENE_CONSTANTS.PLANET.COLOR.SATURATION.MIN,
      SCENE_CONSTANTS.PLANET.COLOR.SATURATION.MAX
    );
    const brightness = this.p.random(
      SCENE_CONSTANTS.PLANET.COLOR.BRIGHTNESS.MIN,
      SCENE_CONSTANTS.PLANET.COLOR.BRIGHTNESS.MAX
    );
    const mainColor = this.p.color(hue, saturation, brightness);
    const secondColor = this.p.color(
      hue,
      saturation,
      brightness * SCENE_CONSTANTS.PLANET.COLOR.SECONDARY_BRIGHTNESS_FACTOR
    );

    // Determine if planet has rings
    const hasRings = index === 0 || this.p.random() < SCENE_CONSTANTS.PLANET.RINGS.CHANCE;
    const ringHue =
      (hue +
        this.p.random(-SCENE_CONSTANTS.PLANET.RINGS.HUE_VARIANCE, SCENE_CONSTANTS.PLANET.RINGS.HUE_VARIANCE) +
        360) %
      360;
    const ringColor = hasRings
      ? this.p.color(
          ringHue,
          saturation * SCENE_CONSTANTS.PLANET.RINGS.SATURATION_FACTOR,
          brightness * SCENE_CONSTANTS.PLANET.RINGS.BRIGHTNESS_FACTOR
        )
      : undefined;

    return {
      x,
      y,
      size: this.p.random(SCENE_CONSTANTS.PLANET.SIZE.MIN, SCENE_CONSTANTS.PLANET.SIZE.MAX),
      color: mainColor,
      secondaryColor: secondColor,
      rotationSpeed: this.p.random(
        SCENE_CONSTANTS.PLANET.ROTATION.SPEED.MIN,
        SCENE_CONSTANTS.PLANET.ROTATION.SPEED.MAX
      ),
      rotation: this.p.random(this.p.TWO_PI),
      hasRings,
      ringColor,
      ringRotation: hasRings ? this.p.random(this.p.TWO_PI) : undefined,
      ringWidth: hasRings
        ? this.p.random(SCENE_CONSTANTS.PLANET.RINGS.WIDTH.MIN, SCENE_CONSTANTS.PLANET.RINGS.WIDTH.MAX)
        : undefined,
      ringTilt: hasRings
        ? this.p.random(SCENE_CONSTANTS.PLANET.RINGS.TILT.MIN, SCENE_CONSTANTS.PLANET.RINGS.TILT.MAX)
        : undefined,
    };
  }

  private drawPlanetRings(planet: Planet, isFront: boolean) {
    if (!planet.hasRings || !planet.ringColor) return;

    this.p.push();
    // Apply ring tilt
    this.p.rotate(planet.ringTilt!);

    // Draw outer ring with gradient
    const ringSteps = SCENE_CONSTANTS.PLANET.RINGS.DETAIL.STEPS;
    const innerRadius = planet.size * SCENE_CONSTANTS.PLANET.RINGS.INNER_RADIUS_FACTOR;
    const outerRadius = planet.size * planet.ringWidth!;

    // Draw only front or back half based on parameter
    const startAngle = isFront ? 0 : -this.p.PI;
    const endAngle = isFront ? this.p.PI : 0;

    for (let i = 0; i < ringSteps; i++) {
      const ratio = i / ringSteps;
      const radius = this.p.lerp(innerRadius, outerRadius, ratio);
      const alpha = this.p.sin(ratio * this.p.PI) * SCENE_CONSTANTS.PLANET.RINGS.ALPHA.MAX;

      // Create ring color with alpha
      const ringColor = this.p.color(
        this.p.hue(planet.ringColor),
        this.p.saturation(planet.ringColor),
        this.p.brightness(planet.ringColor),
        alpha
      );

      this.p.stroke(ringColor);
      this.p.strokeWeight(1);
      this.p.noFill();
      this.p.arc(0, 0, radius * 2, radius * 0.5, startAngle, endAngle, this.p.OPEN);
    }

    // Add detail lines
    const numLines = SCENE_CONSTANTS.PLANET.RINGS.DETAIL.LINES;
    this.p.strokeWeight(0.5);
    for (let i = 0; i < numLines; i++) {
      const radius = this.p.lerp(innerRadius, outerRadius, i / (numLines - 1));
      const alpha = this.p.sin((i / (numLines - 1)) * this.p.PI) * SCENE_CONSTANTS.PLANET.RINGS.ALPHA.DETAIL_MAX;
      this.p.stroke(
        this.p.hue(planet.ringColor),
        this.p.saturation(planet.ringColor),
        this.p.brightness(planet.ringColor),
        alpha
      );
      this.p.arc(0, 0, radius * 2, radius * 0.5, startAngle, endAngle, this.p.OPEN);
    }

    this.p.pop();
  }

  private drawPlanet(planet: Planet, screenX: number, screenY: number) {
    this.p.push();
    this.p.translate(screenX, screenY);

    if (planet.hasRings) {
      // Draw back half of rings first
      this.drawPlanetRings(planet, false);
    }

    // Draw the planet sphere
    this.p.noStroke();
    const lightAngle = -this.p.PI / 4;
    const lightX = this.p.cos(lightAngle);
    const lightY = this.p.sin(lightAngle);

    const resolution = 50;
    for (let y = -resolution; y <= resolution; y++) {
      for (let x = -resolution; x <= resolution; x++) {
        const px = (x / resolution) * (planet.size / 2);
        const py = (y / resolution) * (planet.size / 2);
        const distFromCenter = this.p.sqrt(px * px + py * py) / (planet.size / 2);

        if (distFromCenter <= 1) {
          const nx = px / (planet.size / 2);
          const ny = py / (planet.size / 2);
          const nz = this.p.sqrt(1 - nx * nx - ny * ny);

          if (!isNaN(nz)) {
            const lightIntensity = (nx * lightX + ny * lightY + nz * 0.5) * 0.8 + 0.2;
            const planetColor = this.p.color(
              this.p.hue(planet.color),
              this.p.saturation(planet.color),
              this.p.brightness(planet.color) * this.p.constrain(lightIntensity, 0.2, 1)
            );

            this.p.fill(planetColor);
            this.p.rect(px, py, planet.size / resolution + 1, planet.size / resolution + 1);
          }
        }
      }
    }

    if (planet.hasRings) {
      // Draw front half of rings last
      this.drawPlanetRings(planet, true);
    }

    this.p.pop();
  }

  public update() {
    this.planets.forEach((planet) => {
      planet.rotation += planet.rotationSpeed;
    });
  }

  public draw(cameraX: number, cameraY: number) {
    this.planets.forEach((planet) => {
      const screenX = planet.x - cameraX;
      const screenY = planet.y - cameraY;

      // Only draw planets that are near the visible area
      if (
        screenX > -planet.size &&
        screenX < this.p.width + planet.size &&
        screenY > -planet.size &&
        screenY < this.p.height + planet.size
      ) {
        this.drawPlanet(planet, screenX, screenY);
      }
    });
  }

  public handleResize() {
    this.initialize();
  }
}
