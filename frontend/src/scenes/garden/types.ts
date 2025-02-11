import p5 from 'p5';

export interface Plant {
  x: number;
  y: number;
  segments: Branch[];
  flowers: Flower[];
  leaves: Leaf[];
  maxHeight: number;
  growthProgress: number;
  growthSpeed: number;
  swayOffset: number;
  color: p5.Color;
  type: 'flower' | 'grass' | 'tree';
}

export interface Branch {
  start: p5.Vector;
  end: p5.Vector;
  thickness: number;
  angle: number;
  length: number;
  children: Branch[];
}

export interface Flower {
  pos: p5.Vector;
  size: number;
  color: p5.Color;
  petalCount: number;
  rotation: number;
  bloomProgress: number;
}

export interface Leaf {
  pos: p5.Vector;
  size: number;
  angle: number;
  baseAngle: number;
  swayOffset: number;
}

export interface Particle {
  pos: p5.Vector;
  vel: p5.Vector;
  size: number;
  color: p5.Color;
  alpha: number;
  rotationSpeed: number;
  rotation: number;
  type: 'petal' | 'leaf' | 'light';
}

export interface UserDetailsParticle {
  pos: p5.Vector;
  vel: p5.Vector;
  acc: p5.Vector;
  maxSpeed: number;
  color: p5.Color;
  alpha: number;
  name: string;
  country: string;
  flag: string;
  glowPhase: number;
  glowSpeed: number;
  curveOffset: number;
  curveScale: number;
}

export interface Cloud {
  pos: p5.Vector;
  vel: p5.Vector;
  width: number;
  height: number;
  alpha: number;
  segments: number;
}
