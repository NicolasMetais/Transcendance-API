import { showHomePage } from './router';
import { FixedLoop } from './game/engine';
import { createGame } from './game/create';
import { GameState } from './game/types';
import { createInput } from './game/input';
import { updateGame } from './game/update';
import { renderGameState } from './game/render';

let state: GameState;
let gameLoop: FixedLoop;
let input: ReturnType<typeof createInput>;
let ctx: CanvasRenderingContext2D;

export function createGamePage(): void {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <div class="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold mb-4">🎮 Game</h1>
      </div>
      
      <!-- Canvas de jeu -->
      <div class="bg-black border-2 border-gray-600 rounded-lg">
        <canvas id="game" width="800" height="500"></canvas>
      </div>
      
      <!-- Boutons de contrôle -->
      <div class="mt-8 space-x-4">
        <button id="playBtn" class="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg">
          Jouer
        </button>
        <button id="replayBtn" class="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg">
          Rejouer
        </button>
        <button id="backBtn" class="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg">
          Retour
        </button>
      </div>
    </div>
  `;

  // Récupérer le contexte canvas
  const cv = document.getElementById('game') as HTMLCanvasElement;
  ctx = cv.getContext('2d')!;

  // Créer l'état du jeu
  state = createGame();
  console.log('Game state created:', state);

  // Créer le système d'entrées
  input = createInput();

  // Créer la boucle de jeu
  gameLoop = new FixedLoop(update, render, 60);
  gameLoop.start();

  // Fonction pour démarrer le jeu
  function startGame() {
    if (state.waiting) {
      state.waiting = false;
      state.ball.vx = 220 * (Math.random() < .5 ? -1 : 1);
      state.ball.vy = (Math.random() * 2 - 1) * 120;
      console.log('Game started!');
    }
  }

  // Ajouter les événements pour les boutons
  const playBtn = document.getElementById('playBtn');
  const replayBtn = document.getElementById('replayBtn');
  const backBtn = document.getElementById('backBtn');

  if (playBtn) {
    playBtn.addEventListener('click', startGame);
  }

  if (replayBtn) {
    replayBtn.addEventListener('click', () => {
      // Remettre l'état du jeu à zéro
      state = createGame();
      console.log('Game restarted:', state);
    });
  }

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      gameLoop.stop();
      history.back();
    });
  }

  // Démarrer le jeu quand une touche est pressée
  document.addEventListener('keydown', (e) => {
    if (['w', 'W', 's', 'S', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
      startGame();
    }
  });
}

function update(dt: number): void {
  updateGame(state, input, dt);
}

function render(): void {
  renderGameState(ctx, state);
} 