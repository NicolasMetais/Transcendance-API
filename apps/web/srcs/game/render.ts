import type { GameState } from './types';

export function renderGameState(ctx: CanvasRenderingContext2D, s: GameState) {
  const w = s.width, h = s.height;
  ctx.clearRect(0, 0, w, h);

  // centre
  ctx.strokeStyle = '#244';
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(w / 2, 0);
  ctx.lineTo(w / 2, h);
  ctx.stroke();
  ctx.setLineDash([]);

  // scores
  ctx.fillStyle = '#7cf';
  ctx.font = 'bold 32px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText(String(s.p1.score), w / 4, 40);
  ctx.fillText(String(s.p2.score), 3 * w / 4, 40);

  // paddles
  ctx.fillStyle = '#eef';
  ctx.fillRect(20, s.p1.y, s.paddleW, s.paddleH);
  ctx.fillRect(w - 20 - s.paddleW, s.p2.y, s.paddleW, s.paddleH);

  // balle
  ctx.beginPath();
  ctx.arc(s.ball.x, s.ball.y, s.ballR, 0, Math.PI * 2);
  ctx.fill();

  // bouton "Jouer" si en attente
  if (s.waiting && s.running) {
    ctx.fillStyle = 'rgba(0,0,0,.7)';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Appuyez sur une touche ou cliquez "Jouer"', w / 2, h / 2 - 20);
  }

  // gagnant
  if (!s.running && s.winner) {
    ctx.fillStyle = 'rgba(0,0,0,.5)';
    ctx.fillRect(0, h / 2 - 40, w, 80);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px system-ui';
    ctx.fillText(`Joueur ${s.winner} gagne !`, w / 2, h / 2 + 8);
  }
} 