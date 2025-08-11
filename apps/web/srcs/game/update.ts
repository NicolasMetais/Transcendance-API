import type { GameState } from './types';

export function updateGame(s: GameState, input: { p1Up: boolean; p1Down: boolean; p2Up: boolean; p2Down: boolean }, dt: number) {
  if (!s.running) return;
  const paddleSpeed = 320;
  
  // paddles
  const dy1 = (input.p1Down ? 1 : 0) - (input.p1Up ? 1 : 0);
  const dy2 = (input.p2Down ? 1 : 0) - (input.p2Up ? 1 : 0);
  s.p1.y = clamp(s.p1.y + dy1 * paddleSpeed * dt, 0, s.height - s.paddleH);
  s.p2.y = clamp(s.p2.y + dy2 * paddleSpeed * dt, 0, s.height - s.paddleH);
  
  // ball move (seulement si pas en attente)
  if (!s.waiting) {
    s.ball.x += s.ball.vx * dt;
    s.ball.y += s.ball.vy * dt;
  }
  
  // walls
  if (s.ball.y < s.ballR) {
    s.ball.y = s.ballR;
    s.ball.vy *= -1;
  }
  if (s.ball.y > s.height - s.ballR) {
    s.ball.y = s.height - s.ballR;
    s.ball.vy *= -1;
  }
  
  // paddles (simple AABB)
  const leftX = 20, rightX = s.width - 20 - s.paddleW;
  const hitLeft = s.ball.x - s.ballR < leftX + s.paddleW &&
                  s.ball.y > s.p1.y && s.ball.y < s.p1.y + s.paddleH && s.ball.vx < 0;
  const hitRight = s.ball.x + s.ballR > rightX &&
                   s.ball.y > s.p2.y && s.ball.y < s.p2.y + s.paddleH && s.ball.vx > 0;
  
  if (hitLeft || hitRight) {
    // Accélération de la balle
    s.ball.vx *= -1.15; // Augmentation de 15% de la vitesse horizontale
    s.ball.vy *= 1.1;   // Augmentation de 10% de la vitesse verticale
    
    const py = hitLeft ? s.p1.y : s.p2.y;
    const center = py + s.paddleH / 2;
    const offset = (s.ball.y - center) / (s.paddleH / 2); // -1..1
    s.ball.vy = offset * 240;
    
    // éviter vitesses démentes
    const max = 800, sp = Math.hypot(s.ball.vx, s.ball.vy);
    if (sp > max) {
      const k = max / sp;
      s.ball.vx *= k;
      s.ball.vy *= k;
    }
    s.ball.x += Math.sign(s.ball.vx) * 2; // écarter pour éviter recollision immédiate
  }
  
  // scoring
  if (s.ball.x < -30) {
    s.p2.score++;
    resetBall(s);
  }
  if (s.ball.x > s.width + 30) {
    s.p1.score++;
    resetBall(s);
  }
  
  // win
  if (s.p1.score >= 5) {
    s.running = false;
    s.winner = 1;
  }
  if (s.p2.score >= 5) {
    s.running = false;
    s.winner = 2;
  }
}

export function resetBall(s: GameState) {
  s.ball.x = s.width / 2;
  s.ball.y = s.height / 2;
  s.ball.vx = 0;
  s.ball.vy = 0;
  s.waiting = true;
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
} 