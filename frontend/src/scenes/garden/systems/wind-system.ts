import p5 from 'p5';

export class WindSystem {
  private p: p5;
  private windForce: number = 0;
  private windAngle: number = 0;
  private targetWindAngle: number = 0;

  constructor(p: p5) {
    this.p = p;
  }

  public update(mouseX: number, mouseY: number, lastMousePos: { x: number; y: number }, isMousePressed: boolean) {
    if (isMousePressed) {
      const dx = mouseX - lastMousePos.x;
      const dy = mouseY - lastMousePos.y;
      const moveSpeed = Math.sqrt(dx * dx + dy * dy);

      // Update wind force based on mouse movement speed
      this.windForce = this.p.lerp(this.windForce, this.p.min(moveSpeed * 0.1, 1), 0.2);

      // Update wind angle based on mouse movement direction
      if (moveSpeed > 1) {
        this.targetWindAngle = Math.atan2(dy, dx);
      }
    }

    // Smoothly interpolate wind angle
    const angleDiff = ((this.targetWindAngle - this.windAngle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    this.windAngle += angleDiff * 0.1;

    // Decay wind force gradually
    this.windForce *= 0.99;
  }

  public draw() {
    if (this.windForce > 0.1) {
      this.p.push();
      this.p.translate(50, 50);
      this.p.stroke(0, 0, 50, this.windForce * 0.3);
      this.p.noFill();
      const arrowLength = 20 * this.windForce;
      this.p.line(0, 0, Math.cos(this.windAngle) * arrowLength, Math.sin(this.windAngle) * arrowLength);
      this.p.pop();
    }
  }

  public getWindForce(): number {
    return this.windForce;
  }

  public getWindAngle(): number {
    return this.windAngle;
  }
}
