export type GameState = {
  width: number;
  height: number;
  paddleW: number;
  paddleH: number;
  ballR: number;
  p1: { y: number; score: number };
  p2: { y: number; score: number };
  ball: { x: number; y: number; vx: number; vy: number };
  running: boolean;
  winner: 1 | 2 | null;
  waiting: boolean;
}; 