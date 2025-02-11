import p5 from 'p5';
import { Camera, MouseState } from '../types';
import { SCENE_CONSTANTS } from '../utils/constants';

export class CameraSystem {
  private camera: Camera;
  private mouseState: MouseState;
  private p: p5;

  constructor(p: p5) {
    this.p = p;
    this.camera = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
    };
    this.mouseState = {
      isDragging: false,
      dragStartX: 0,
      dragStartY: 0,
      cameraDragStartX: 0,
      cameraDragStartY: 0,
    };
  }

  public startDrag(mouseX: number, mouseY: number) {
    this.mouseState.isDragging = true;
    this.mouseState.dragStartX = mouseX;
    this.mouseState.dragStartY = mouseY;
    this.mouseState.cameraDragStartX = this.camera.x;
    this.mouseState.cameraDragStartY = this.camera.y;
  }

  public endDrag() {
    this.mouseState.isDragging = false;
  }

  public update(mouseX: number, mouseY: number) {
    if (this.mouseState.isDragging) {
      // Manual panning
      this.camera.x = this.mouseState.cameraDragStartX + (this.mouseState.dragStartX - mouseX);
      this.camera.y = this.mouseState.cameraDragStartY + (this.mouseState.dragStartY - mouseY);
    } else {
      // Auto-panning when not dragging
      this.camera.targetX += SCENE_CONSTANTS.AUTO_PAN_SPEED;
      this.camera.targetY += SCENE_CONSTANTS.AUTO_PAN_SPEED * 0.5;
      this.camera.x += (this.camera.targetX - this.camera.x) * SCENE_CONSTANTS.CAMERA_LERP_FACTOR;
      this.camera.y += (this.camera.targetY - this.camera.y) * SCENE_CONSTANTS.CAMERA_LERP_FACTOR;
    }
  }

  public getPosition(): { x: number; y: number } {
    return {
      x: this.camera.x,
      y: this.camera.y,
    };
  }

  public isDragging(): boolean {
    return this.mouseState.isDragging;
  }
}
