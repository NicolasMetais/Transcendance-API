import { Pong3D } from './game3d';

let game3D: Pong3D;
let player1Name: string = "Player 1";
let player2Name: string = "Player 2";

export function createGamePage(): void {
	const app = document.getElementById('app');
	if (!app) return;

	app.innerHTML = `
		<div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center px-4 py-8">
		<div class="w-full max-w-3xl bg-gray-800/80 rounded-3xl shadow-2xl p-8 flex flex-col items-center border border-gray-700 backdrop-blur-md">
			<div class="w-full text-center mb-8">
			<h1 class="text-5xl font-extrabold mb-2 text-white drop-shadow-lg animate-pulse">
				TRANSCENDENCE
			</h1>
			</div>
			
			<!-- 3d canvas -->
			<div class="relative bg-black border-4 rounded-2xl shadow-lg overflow-hidden">
			<canvas id="game3d" width="800" height="500" class="rounded-xl shadow-inner"></canvas>
			<div class="absolute inset-0 pointer-events-none rounded-xl ring-2 ring-blue-400/30 animate-pulse"></div>
			</div>
			
			<!-- score -->
			<div class="mt-6 w-full flex justify-center items-center gap-8">
			<div class="flex flex-col items-center">
				<span id="player1Name" class="text-2xl font-bold text-blue-400 drop-shadow">Player 1</span>
				<span id="score1" class="text-4xl font-extrabold text-blue-200 bg-blue-900/60 px-4 py-1 rounded-lg mt-1 shadow">0</span>
			</div>
			<span class="text-3xl font-bold text-gray-400 select-none">|</span>
			<div class="flex flex-col items-center">
				<span id="player2Name" class="text-2xl font-bold text-red-400 drop-shadow">Player 2</span>
				<span id="score2" class="text-4xl font-extrabold text-red-200 bg-red-900/60 px-4 py-1 rounded-lg mt-1 shadow">0</span>
			</div>
			</div>
			
			<!-- buttons -->
			<div class="mt-10 flex flex-wrap gap-6 justify-center w-full">
			<button id="playBtn" class="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300">
				<span class="inline-flex items-center gap-2"><svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 3v18l15-9L5 3z"/></svg>Play</span>
			</button>
			<button id="replayBtn" class="px-8 py-3 bg-gradient-to-r from-green-600 to-green-400 hover:from-green-700 hover:to-green-500 text-white font-bold rounded-xl shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-300">
				<span class="inline-flex items-center gap-2"><svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 4v5h.582M20 20v-5h-.581M5.455 19.045A9 9 0 1 1 19.045 5.455"/></svg>Replay</span>
			</button>
			<button id="backBtn" class="px-8 py-3 bg-gradient-to-r from-gray-700 to-gray-500 hover:from-gray-800 hover:to-gray-600 text-white font-bold rounded-xl shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400">
				<span class="inline-flex items-center gap-2"><svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>Back</span>
			</button>
			</div>
		</div>
		</div>
	`;

	loadPlayerNames().then(() => {
		updatePlayerNames();
	});

	const canvas = document.getElementById('game3d') as HTMLCanvasElement;

	if (game3D) {
		game3D.dispose();
	}

	game3D = new Pong3D(canvas);

	game3D.render();

	const score1Element = document.getElementById('score1');
	const score2Element = document.getElementById('score2');
	if (score1Element) score1Element.textContent = '0';
	if (score2Element) score2Element.textContent = '0';

	function startGame() {
		game3D.startGame();
	}

	function updateScore() {
		const score = game3D.getScore();
		const score1Element = document.getElementById('score1');
		const score2Element = document.getElementById('score2');

		if (score1Element) score1Element.textContent = score.p1.toString();
		if (score2Element) score2Element.textContent = score.p2.toString();

		if (game3D.isGameOver()) {
			postMatchIfNeeded();
		}
	}

	const playBtn = document.getElementById('playBtn');
	const replayBtn = document.getElementById('replayBtn');
	const backBtn = document.getElementById('backBtn');

	if (playBtn) {
		playBtn.addEventListener('click', startGame);
	}

	if (replayBtn) {
		replayBtn.addEventListener('click', () => {
			game3D.restartGame();
			updateScore();
		});
	}

	if (backBtn) {
		backBtn.addEventListener('click', () => {
			if (game3D) {
				game3D.dispose();
			}
			history.back();
		});
	}

	const scoreInterval = setInterval(updateScore, 100);

	try {
		const w = window as unknown as { pageCleanup?: () => void };
		w.pageCleanup = () => {
			clearInterval(scoreInterval);
			if (game3D) {
				game3D.dispose();
			}
			w.pageCleanup = undefined;
		};
	} catch { }

	window.addEventListener('beforeunload', () => {
		clearInterval(scoreInterval);
		if (game3D) {
			game3D.dispose();
		}
	});

	let posted = false;
	async function postMatchIfNeeded() {
		if (posted) return;
		posted = true;

		try {
			const token = localStorage.getItem('auth_token');
			if (!token) return;

			const payload = JSON.parse(atob(token.split('.')[1]));
			const userId = payload.userId;

			const { winner, score1, score2 } = game3D.getFinal();
			const player1_id = userId;
			const player2_id = 1;
			const winner_id = winner === 1 ? player1_id : player2_id;

			await fetch('https://localhost:8443/newMatch', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify({
					player1_id,
					player2_id,
					winner_id,
					score_player1: score1,
					score_player2: score2
				})
			});

			await fetch('https://localhost:8443/incrementGameplayed', {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify({
					player1_id,
					player2_id
				})
			});
		} catch (e) {
			console.error(e);
		}
	}

	async function loadPlayerNames(): Promise<void> {
		try {
			const token = localStorage.getItem('auth_token');
			if (!token) {
				player1Name = "Player 1";
				return;
			}

			const payload = JSON.parse(atob(token.split('.')[1]));
			const userId = payload.userId;

			try {
				const res = await fetch('https://localhost:8443/myprofile', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
					body: JSON.stringify({ id: userId })
				});
				if (res.ok) {
					const data = await res.json();
					const name = data?.user?.username || data?.user?.name || null;
					if (name) {
						player1Name = name;
						return;
					}
				}
			} catch { }

			try {
				const res2 = await fetch(`https://localhost:8443/users/${userId}`, {
					headers: { 'Authorization': `Bearer ${token}` }
				});
				if (res2.ok) {
					const data2 = await res2.json();
					const name2 = data2?.user?.username || data2?.user?.name || null;
					if (name2) {
						player1Name = name2;
						return;
					}
				}
			} catch { }

			try {
				const res3 = await fetch('https://localhost:8443/showUsers', {
					headers: { 'Authorization': `Bearer ${token}` }
				});
				if (res3.ok) {
					const arr = await res3.json();
					if (Array.isArray(arr)) {
						const me = arr.find((u: any) => u.id === userId || u.id == userId);
						if (me?.username) {
							player1Name = me.username;
							return;
						}
					}
				}
			} catch { }

			if (payload.username) {
				player1Name = payload.username;
				return;
			}

			player1Name = "Player 1";
		} catch {
			player1Name = "Player 1";
		}
	}

	function updatePlayerNames(): void {
		const player1NameElement = document.getElementById('player1Name');
		const player2NameElement = document.getElementById('player2Name');

		if (player1NameElement) {
			player1NameElement.textContent = player1Name;
		}
		if (player2NameElement) {
			player2NameElement.textContent = player2Name;
		}
	}
}
