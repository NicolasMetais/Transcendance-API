import { GameState } from './types';

export function createGame(w = 800, h = 500): GameState {
  const paddleH = 90, paddleW = 12, ballR = 8;
  return {
    width: w, height: h, paddleW, paddleH, ballR,
    p1: { y: h / 2 - paddleH / 2, score: 0 },
    p2: { y: h / 2 - paddleH / 2, score: 0 },
    ball: { x: w / 2, y: h / 2, vx: 0, vy: 0 },
    running: true, winner: null, waiting: true
  };
} 