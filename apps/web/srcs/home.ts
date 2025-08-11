import { showGamePage } from './router';

export function createHomePage(): void {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <div class="min-h-screen bg-gray-50 text-gray-900">
      <main class="max-w-xl mx-auto py-16 px-6">
        <h1 class="text-3xl font-bold mb-4">Hello, ft_transcendence 👋</h1>
        <p class="mb-6">Ceci est ta SPA en TypeScript + Tailwind.</p>
        
        <div class="space-y-4">
          <button id="ping" class="px-4 py-2 border rounded hover:bg-gray-100 transition-colors">
            Tester l'API HTTPS
          </button>
          
          <button id="gameBtn" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
            🎮 Aller aux jeux
          </button>
        </div>
        
        <pre id="out" class="mt-4 p-3 bg-white border rounded"></pre>
      </main>
    </div>
  `;

  // Ajouter l'événement pour le bouton ping
  const pingBtn = document.getElementById("ping");
  const out = document.getElementById("out");
  
  if (pingBtn && out) {
    pingBtn.addEventListener("click", async () => {
      out.textContent = "Appel en cours...";
      try {
        const res = await fetch("https://localhost:8443/showUsers", { credentials: "include" });
        const json = await res.json();
        out.textContent = JSON.stringify(json, null, 2);
      } catch (e: any) {
        out.textContent = "Erreur: " + e.message;
      }
    });
  }

  // Ajouter l'événement pour le bouton game
  const gameBtn = document.getElementById("gameBtn");
  if (gameBtn) {
    gameBtn.addEventListener("click", () => {
      window.history.pushState({}, '', '/game');
      showGamePage();
    });
  }
} 