import p5 from 'p5';
import { FlowField, MouseForce } from '../types';
import { SCENE_CONSTANTS } from '../utils/constants';

export class FlowFieldSystem {
  private flowField: FlowField;
  private p: p5;
  private zoff: number = 0;

  constructor(p: p5) {
    this.p = p;
    this.flowField = {
      vectors: [],
      cols: Math.floor(p.width / SCENE_CONSTANTS.FIELD_SCALE),
      rows: Math.floor(p.height / SCENE_CONSTANTS.FIELD_SCALE),
    };
    this.initialize();
  }

  private initialize() {
    this.flowField.vectors = new Array(this.flowField.rows);
    for (let y = 0; y < this.flowField.rows; y++) {
      this.flowField.vectors[y] = new Array(this.flowField.cols);
    }
  }

  public update(mouseForce: MouseForce | null) {
    let yoff = 0;
    for (let y = 0; y < this.flowField.rows; y++) {
      let xoff = 0;
      for (let x = 0; x < this.flowField.cols; x++) {
        // Base flow field from noise
        const angle = this.p.noise(xoff, yoff, this.zoff) * this.p.TWO_PI * 4;
        const v = p5.Vector.fromAngle(angle);
        v.setMag(1);

        // Add mouse force influence if active
        if (mouseForce) {
          const cellPos = this.p.createVector(x * SCENE_CONSTANTS.FIELD_SCALE, y * SCENE_CONSTANTS.FIELD_SCALE);
          const distToMouse = p5.Vector.dist(cellPos, mouseForce.pos);

          if (distToMouse < SCENE_CONSTANTS.FORCE.RADIUS) {
            // Create force vector pointing away from mouse
            const forceDir = p5.Vector.sub(cellPos, mouseForce.pos);
            const forceMag = this.p.map(distToMouse, 0, SCENE_CONSTANTS.FORCE.RADIUS, mouseForce.strength, 0);
            forceDir.setMag(forceMag);
            v.add(forceDir);
          }
        }

        this.flowField.vectors[y][x] = v;
        xoff += SCENE_CONSTANTS.FIELD_NOISE_SCALE;
      }
      yoff += SCENE_CONSTANTS.FIELD_NOISE_SCALE;
    }
    this.zoff += SCENE_CONSTANTS.FIELD_CHANGE_SPEED;
  }

  public getFlowVector(x: number, y: number): p5.Vector | null {
    const col = Math.floor(x / SCENE_CONSTANTS.FIELD_SCALE);
    const row = Math.floor(y / SCENE_CONSTANTS.FIELD_SCALE);

    if (row >= 0 && row < this.flowField.rows && col >= 0 && col < this.flowField.cols) {
      return this.flowField.vectors[row][col];
    }
    return null;
  }

  public handleResize() {
    this.flowField.cols = Math.floor(this.p.width / SCENE_CONSTANTS.FIELD_SCALE);
    this.flowField.rows = Math.floor(this.p.height / SCENE_CONSTANTS.FIELD_SCALE);
    this.initialize();
  }

  public visualizeField(mouseForce: MouseForce | null) {
    if (mouseForce) {
      // Visualize force field
      this.p.noFill();
      this.p.stroke(0, 0, 100, 0.1);
      this.p.circle(mouseForce.pos.x, mouseForce.pos.y, SCENE_CONSTANTS.FORCE.RADIUS * 2);
    }
  }
}
