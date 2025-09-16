import { showGamePage, showDashboardPage, showTournamentPage, showStatsPage } from './router';
import { showSignInPage } from './router';

export function createHomePage(): void {
	const app = document.getElementById('app');
	if (!app) return;

	app.innerHTML = `
		<div class="min-h-screen bg-black text-white">
		<!-- Header with user icon -->
		<header class="flex justify-end p-6">
			<button id="userIcon" class="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
			<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
				<path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
			</svg>
			</button>
		</header>

		<main class="max-w-xl mx-auto py-16 px-6">
			<h1 class="text-3xl font-bold mb-4 text-white animate-pulse" style="text-shadow: 
			2px 2px 0px #ffffff,
			4px 4px 0px #e0e0e0,
			6px 6px 0px #c0c0c0,
			8px 8px 0px #a0a0a0,
			10px 10px 0px #808080,
			12px 12px 0px #606060,
			14px 14px 0px #404040,
			16px 16px 0px #202020,
			18px 18px 20px rgba(0,0,0,0.5),
			20px 20px 40px rgba(0,0,0,0.3);
			transform: perspective(500px) rotateX(15deg);
			letter-spacing: 2px;">TRANSCENDENCE</h1>
			
			<div class="space-y-4">
			<button id="ping" class="px-4 py-2 border border-gray-600 rounded hover:bg-gray-800 transition-colors text-white">
				Tester l'API HTTPS
			</button>
			
			<button id="gameBtn" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
				Jeu
			</button>
			
			<button id="tournamentBtn" class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors">
				Tournoi (8 joueurs)
			</button>
			</div>

			<div class="bg-white rounded-lg shadow-sm p-6 mt-9 mb-9">
              <div class="flex items-center space-x-4">
                <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <span class="text-2xl text-green-600">📊</span>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-green-700">Statistics</h3>
                  <p class="text-green-600">Graphana statistics</p>
                </div>
              </div>
              <div class="mt-4">
                <button id="statsBtn" class="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition-colors">
                  View statistics
                </button>
              </div>
        	</div>
			
			<pre id="out" class="mt-4 p-3 bg-gray-900 border border-gray-600 rounded text-green-400"></pre>
		</main>
		</div>
	`;

	const pingBtn = document.getElementById("ping");
	const out = document.getElementById("out");

	if (pingBtn && out) {
		pingBtn.addEventListener("click", async () => {
		out.textContent = "Appel en cours...";
		try {
			const token = localStorage.getItem('auth_token');
			if (!token) {
			out.textContent = "Erreur: Vous devez être connecté pour voir les utilisateurs";
			return;
			}

			const res = await fetch("https://localhost:8443/showUsers", {
			credentials: "include",
			mode: 'cors',
			headers: {
				'Authorization': `Bearer ${token}`
			}
			});
			const json = await res.json();
			out.textContent = JSON.stringify(json, null, 2);
		} catch (e: any) {
			out.textContent = "Erreur: " + e.message;
		}
		});
	}

	const statsBtn = document.getElementById('statsBtn') as HTMLButtonElement;
	if (statsBtn) {
		statsBtn.addEventListener("click", () => {
		window.history.pushState({}, '', '/game');
		showStatsPage();
		});
	}
	const gameBtn = document.getElementById("gameBtn");
	if (gameBtn) {
		gameBtn.addEventListener("click", () => {
		window.history.pushState({}, '', '/game');
		showGamePage();
		});
	}

	const tournamentBtn = document.getElementById("tournamentBtn");
	if (tournamentBtn) {
		tournamentBtn.addEventListener("click", () => {
		window.history.pushState({}, '', '/tournament');
		showTournamentPage();
		});
	}

	const userIcon = document.getElementById("userIcon");
	if (userIcon) {
		userIcon.addEventListener("click", () => {
		const token = localStorage.getItem('auth_token');
		if (token) {
			window.history.pushState({}, '', '/dashboard');
			showDashboardPage();
		} else {
			window.history.pushState({}, '', '/signIn');
			showSignInPage();
		}
		});
	}
} 