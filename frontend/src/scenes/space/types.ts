import p5 from 'p5';

export interface Star {
  x: number;
  y: number;
  size: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  brightness: number;
  layer: number; // For parallax effect
}

export interface Planet {
  x: number;
  y: number;
  size: number;
  color: p5.Color;
  secondaryColor: p5.Color;
  rotationSpeed: number;
  rotation: number;
  hasRings?: boolean;
  ringColor?: p5.Color;
  ringRotation?: number;
  ringWidth?: number;
  ringTilt?: number;
}

export interface UserDetailsParticle {
  x: number;
  y: number;
  name: string;
  country: string;
  flag: string;
  color: p5.Color;
  alpha: number;
  rotation: number;
  rotationSpeed: number;
  size: number;
  velocityX: number;
  velocityY: number;
}

export interface Camera {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
}

export interface MouseState {
  isDragging: boolean;
  dragStartX: number;
  dragStartY: number;
  cameraDragStartX: number;
  cameraDragStartY: number;
}
