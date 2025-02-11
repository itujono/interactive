import p5 from 'p5';

export interface BaseParticle {
  pos: p5.Vector;
  vel: p5.Vector;
  acc: p5.Vector;
  maxSpeed: number;
  color: p5.Color;
  alpha: number;
}

export interface UserDetailsParticle extends BaseParticle {
  name: string;
  country: string;
  flag: string;
}

export interface MouseForce {
  pos: p5.Vector;
  strength: number;
  maxStrength: number;
}

export interface FlowField {
  vectors: p5.Vector[][];
  cols: number;
  rows: number;
}
