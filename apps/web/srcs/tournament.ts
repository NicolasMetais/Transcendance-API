import { Pong3D } from './game3d';

interface Player {
	id: number;
	name: string;
	isAI: boolean;
	wins: number;
	losses: number;
}

interface Match {
	id: number;
	player1: Player;
	player2: Player;
	winner?: Player;
	score1: number;
	score2: number;
	isFinished: boolean;
	isCurrent: boolean;
}

interface Tournament {
	players: Player[];
	matches: Match[];
	currentRound: number;
	isFinished: boolean;
	winner?: Player;
}

let tournament: Tournament;
let game3D: Pong3D;
let currentMatch: Match | null = null;
let player1Name: string = "Player 1";
let player2Name: string = "Player 2";
let nextMatchScheduled: boolean = false;
let tournamentOverlayShown: boolean = false;

export function createTournamentPage(): void {
	const app = document.getElementById('app');
	if (!app) return;

	tournamentOverlayShown = false;

	app.innerHTML = `
    <div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center px-4 py-8">
      <div class="w-full max-w-6xl bg-gray-800/80 rounded-3xl shadow-2xl p-8 flex flex-col items-center border border-gray-700 backdrop-blur-md">
        <div class="w-full text-center mb-8">
          <h1 class="text-5xl font-extrabold mb-2 text-white drop-shadow-lg animate-pulse">
            TOURNAMENT
          </h1>
          <p class="text-lg text-gray-300 mb-1 tracking-wide">8-player tournament</p>
        </div>
        
        <div class="w-full flex flex-col gap-8 mb-8">
          <div class="w-full bg-gray-900/50 rounded-2xl p-6 border border-gray-600">
            <h2 class="text-2xl font-bold text-white mb-4 text-center">Brackets</h2>
            <div id="tournamentBracket" class="space-y-4">
            </div>
          </div>
          
          <div class="w-full bg-gray-900/50 rounded-2xl p-6 border border-gray-600">
            <h2 class="text-2xl font-bold text-white mb-4 text-center">🎮 Current Match</h2>
            <div id="currentMatch" class="text-center">
              <p class="text-gray-400">No match in progress</p>
            </div>
            
            <div class="mt-6 relative bg-black border-4 rounded-2xl shadow-lg overflow-hidden">
              <canvas id="game3d" width="800" height="500" class="rounded-xl shadow-inner block mx-auto"></canvas>
              <div class="absolute inset-0 pointer-events-none rounded-xl ring-2 ring-blue-400/30 animate-pulse"></div>
            </div>
            
            <div class="mt-4 flex justify-center items-center gap-6">
              <div class="flex flex-col items-center">
                <span id="player1Name" class="text-lg font-bold text-blue-400">Player 1</span>
                <span id="score1" class="text-2xl font-extrabold text-blue-200 bg-blue-900/60 px-3 py-1 rounded-lg">0</span>
              </div>
              <span class="text-xl font-bold text-gray-400">|</span>
              <div class="flex flex-col items-center">
                <span id="player2Name" class="text-lg font-bold text-red-400">Player 2</span>
                <span id="score2" class="text-2xl font-extrabold text-red-200 bg-red-900/60 px-3 py-1 rounded-lg">0</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex flex-wrap gap-4 justify-center w-full">
          <button id="startMatchBtn" class="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg transition-all duration-200">
        	Start match
          </button>
          <button id="nextMatchBtn" class="px-6 py-3 bg-gradient-to-r from-green-600 to-green-400 hover:from-green-700 hover:to-green-500 text-white font-bold rounded-xl shadow-lg transition-all duration-200">
            Next match
          </button>
          <button id="restartTournamentBtn" class="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-400 hover:from-purple-700 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg transition-all duration-200">
            New tournament
          </button>
          <button id="backBtn" class="px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-500 hover:from-gray-800 hover:to-gray-600 text-white font-bold rounded-xl shadow-lg transition-all duration-200">
            🏠 Back
          </button>
        </div>
      </div>
    </div>
  `;

	initializeTournament();
	updateTournamentDisplay();
	if (currentMatch) {
		player1Name = currentMatch.player1.name;
		player2Name = currentMatch.player2.name;
		updatePlayerNames();
	}

	loadPlayerNames().then(() => {
		if (tournament?.players) {
			const me = tournament.players.find(p => p.id === 1);
			if (me) me.name = player1Name;
			updateTournamentDisplay();
			if (currentMatch) {
				player1Name = currentMatch.player1.name;
				player2Name = currentMatch.player2.name;
				updatePlayerNames();
			}
		}
	});

	const canvas = document.getElementById('game3d') as HTMLCanvasElement;
	if (canvas) {
		try {
			canvas.addEventListener('wheel', (e) => {
				e.preventDefault();
			}, { passive: false });
		} catch { }

		if (game3D) {
			game3D.dispose();
		}

		game3D = new Pong3D(canvas);
		game3D.setShowOverlayOnGameOver(false);
		game3D.render();

		resetScoreDisplay();
	}

	const startMatchBtn = document.getElementById('startMatchBtn');
	const nextMatchBtn = document.getElementById('nextMatchBtn');
	const restartTournamentBtn = document.getElementById('restartTournamentBtn');
	const backBtn = document.getElementById('backBtn');

	if (startMatchBtn) {
		startMatchBtn.addEventListener('click', startCurrentMatch);
	}

	if (nextMatchBtn) {
		nextMatchBtn.addEventListener('click', nextMatch);
	}

	if (restartTournamentBtn) {
		restartTournamentBtn.addEventListener('click', restartTournament);
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
}

async function loadPlayerNames(): Promise<void> {
	try {
		const token = localStorage.getItem('auth_token');
		console.log("paco1");
		if (!token) {
			player1Name = "Player 1";
			updatePlayerNames();
			return;
		}
		console.log("paco2");
		const payload = JSON.parse(atob(token.split('.')[1]));
		const userId = payload.userId;

		try {
			const res = await fetch('https://localhost:8443/myprofile', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
				body: JSON.stringify({ id: userId })
			});
			console.log("cool");
			if (res.ok) {
				const data = await res.json();
				const name = data?.user?.username || data?.user?.name || null;
				if (name) {
					player1Name = name;
					updatePlayerNames();
					if (tournament?.players) {
						const me = tournament.players.find(p => p.id === 1);
						if (me) me.name = player1Name;
						updateTournamentDisplay();
					}
					return;
				}
			}
		} catch {

		}
		try {
			const res2 = await fetch(`https://localhost:8443/users/${userId}`, {
				headers: { 'Authorization': `Bearer ${token}` }
			});
			if (res2.ok) {
				const data2 = await res2.json();
				const name2 = data2?.user?.username || data2?.user?.name || null;
				if (name2) {
					player1Name = name2;
					updatePlayerNames();
					if (tournament?.players) {
						const me = tournament.players.find(p => p.id === 1);
						if (me) me.name = player1Name;
						updateTournamentDisplay();
					}
					return;
				}
			}
		} catch { }

		if (payload.username) {
			player1Name = payload.username;
			updatePlayerNames();
			if (tournament?.players) {
				const me = tournament.players.find(p => p.id === 1);
				if (me) me.name = player1Name;
				updateTournamentDisplay();
			}
			return;
		}

		player1Name = "Player 1";
		updatePlayerNames();
	} catch {
		player1Name = "Player 1";
		updatePlayerNames();
	}
}

function initializeTournament(): void {
	const players: Player[] = [
		{ id: 1, name: player1Name, isAI: false, wins: 0, losses: 0 },
		{ id: 2, name: "Alpha", isAI: true, wins: 0, losses: 0 },
		{ id: 3, name: "Bravo", isAI: true, wins: 0, losses: 0 },
		{ id: 4, name: "Charlie", isAI: true, wins: 0, losses: 0 },
		{ id: 5, name: "Delta", isAI: true, wins: 0, losses: 0 },
		{ id: 6, name: "Echo", isAI: true, wins: 0, losses: 0 },
		{ id: 7, name: "Foxtrot", isAI: true, wins: 0, losses: 0 },
		{ id: 8, name: "Golf", isAI: true, wins: 0, losses: 0 }
	];

	for (let i = players.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[players[i], players[j]] = [players[j], players[i]];
	}

	const matches: Match[] = [];
	for (let i = 0; i < players.length; i += 2) {
		matches.push({
			id: matches.length + 1,
			player1: players[i],
			player2: players[i + 1],
			score1: 0,
			score2: 0,
			isFinished: false,
			isCurrent: false
		});
	}

	for (let round = 2; round <= 3; round++) {
		const matchesInRound = Math.pow(2, 4 - round);
		for (let i = 0; i < matchesInRound; i++) {
			matches.push({
				id: matches.length + 1,
				player1: { id: 0, name: "To be determined", isAI: true, wins: 0, losses: 0 },
				player2: { id: 0, name: "To be determined", isAI: true, wins: 0, losses: 0 },
				score1: 0,
				score2: 0,
				isFinished: false,
				isCurrent: false
			});
		}
	}

	tournament = {
		players,
		matches,
		currentRound: 1,
		isFinished: false
	};

	if (matches.length > 0) {
		matches[0].isCurrent = true;
		currentMatch = matches[0];
	}
}

function updateTournamentDisplay(): void {
	const bracketElement = document.getElementById('tournamentBracket');
	const currentMatchElement = document.getElementById('currentMatch');

	if (!bracketElement || !currentMatchElement) return;

	bracketElement.innerHTML = generateBracketHTML();

	if (currentMatch) {
		currentMatchElement.innerHTML = `
      <div class="bg-gray-800 rounded-lg p-4">
        <h3 class="text-lg font-bold text-white mb-2">Match #${currentMatch.id}</h3>
        <div class="flex justify-between items-center">
          <div class="text-blue-400 font-semibold">${currentMatch.player1.name}</div>
          <div class="text-gray-400">vs</div>
          <div class="text-red-400 font-semibold">${currentMatch.player2.name}</div>
        </div>
        ${currentMatch.isFinished ? `
          <div class="mt-2 text-center">
            <span class="text-green-400 font-bold">🏆 ${currentMatch.winner?.name} wins!</span>
          </div>
        ` : ''}
      </div>
    `;
	} else {
		currentMatchElement.innerHTML = '<p class="text-gray-400">Tournament finished</p>';
	}

	updatePlayerNames();
}

function generateBracketHTML(): string {
	let html = '';

	html += '<div class="mb-6">';
	html += '<h3 class="text-lg font-bold text-blue-400 mb-2">First round</h3>';
	for (let i = 0; i < 4; i++) {
		const match = tournament.matches[i];
		html += generateMatchHTML(match, i);
	}
	html += '</div>';

	html += '<div class="mb-6">';
	html += '<h3 class="text-lg font-bold text-green-400 mb-2">Semifinals</h3>';
	for (let i = 4; i < 6; i++) {
		const match = tournament.matches[i];
		html += generateMatchHTML(match, i);
	}
	html += '</div>';

	html += '<div>';
	html += '<h3 class="text-lg font-bold text-yellow-400 mb-2">Final</h3>';
	const finalMatch = tournament.matches[6];
	html += generateMatchHTML(finalMatch, 6);
	html += '</div>';

	return html;
}

function generateMatchHTML(match: Match, index: number): string {
	const isCurrent = match.isCurrent;
	const isFinished = match.isFinished;
	const bgColor = isCurrent ? 'bg-blue-900/50 border-blue-500' :
		isFinished ? 'bg-green-900/50 border-green-500' :
			'bg-gray-800/50 border-gray-600';

	return `
    <div class="${bgColor} border rounded-lg p-3 mb-2">
      <div class="flex justify-between items-center text-sm">
        <div class="flex-1">
          <div class="text-blue-400 font-medium">${match.player1.name}</div>
          <div class="text-red-400 font-medium">${match.player2.name}</div>
        </div>
        <div class="text-center mx-2">
          <div class="text-lg font-bold text-white">${match.score1}</div>
          <div class="text-lg font-bold text-white">${match.score2}</div>
        </div>
        <div class="text-right">
          ${isCurrent ? '🎮' : isFinished ? '✅' : '⏳'}
        </div>
      </div>
    </div>
  `;
}

function startCurrentMatch(): void {
	if (!currentMatch || currentMatch.isFinished) return;

	player1Name = currentMatch.player1.name;
	player2Name = currentMatch.player2.name;
	updatePlayerNames();

	if (game3D) {
		game3D.restartGame();
		resetScoreDisplay();
		game3D.startGame();
	}
}

function nextMatch(): void {
	if (!currentMatch) return;

	currentMatch.isFinished = true;
	currentMatch.isCurrent = false;

	const score = game3D.getScore();
	currentMatch.score1 = score.p1;
	currentMatch.score2 = score.p2;
	currentMatch.winner = score.p1 > score.p2 ? currentMatch.player1 : currentMatch.player2;

	currentMatch.winner.wins++;
	const loser = currentMatch.winner === currentMatch.player1 ? currentMatch.player2 : currentMatch.player1;
	loser.losses++;

	// a chaque match ca regarde si on peut afficher le reste des matchs
	// dans les brakcets
	populateNextRounds();

	const nextMatchIndex = findNextMatch();
	if (nextMatchIndex !== -1) {
		const nextM = tournament.matches[nextMatchIndex];
		nextM.isCurrent = true;
		currentMatch = nextM;

		if (nextMatchIndex >= 4) {
			updateNextRoundPlayers(nextMatchIndex);
		}

		player1Name = currentMatch.player1.name;
		player2Name = currentMatch.player2.name;
		updatePlayerNames();
		updateTournamentDisplay();

		if (game3D) {
			game3D.restartGame();
			resetScoreDisplay();
			game3D.startGame();
		}

		nextMatchScheduled = false;
	} else {
		tournament.isFinished = true;
		tournament.winner = currentMatch.winner;
		currentMatch = null;

		if (!tournamentOverlayShown) {
			showTournamentWinnerOverlay(tournament.winner?.name || 'Unknown');
		}
		nextMatchScheduled = false;
	}
}

function findNextMatch(): number {
	for (let i = 0; i < tournament.matches.length; i++) {
		if (i > 6)
			return (-1);
		if (!tournament.matches[i].isFinished && !tournament.matches[i].isCurrent) {
			return i;
		}

	}
	return -1;
}

function updateNextRoundPlayers(matchIndex: number): void {
	const match = tournament.matches[matchIndex];

	if (matchIndex >= 4 && matchIndex < 6) {
		const match1Index = (matchIndex - 4) * 2;
		const match2Index = (matchIndex - 4) * 2 + 1;

		const winner1 = tournament.matches[match1Index].winner;
		const winner2 = tournament.matches[match2Index].winner;

		if (winner1 && winner2) {
			match.player1 = winner1;
			match.player2 = winner2;
		}
	} else if (matchIndex === 6) {
		const winner1 = tournament.matches[4].winner;
		const winner2 = tournament.matches[5].winner;

		if (winner1 && winner2) {
			match.player1 = winner1;
			match.player2 = winner2;
		}
	}
}

function populateNextRounds(): void {
	const qf0 = tournament.matches[0];
	const qf1 = tournament.matches[1];
	const sf1 = tournament.matches[4];
	if (qf0?.winner && qf1?.winner) {
		sf1.player1 = qf0.winner;
		sf1.player2 = qf1.winner;
	}

	const qf2 = tournament.matches[2];
	const qf3 = tournament.matches[3];
	const sf2 = tournament.matches[5];
	if (qf2?.winner && qf3?.winner) {
		sf2.player1 = qf2.winner;
		sf2.player2 = qf3.winner;
	}

	const finalMatch = tournament.matches[6];
	if (sf1?.winner && sf2?.winner) {
		finalMatch.player1 = sf1.winner;
		finalMatch.player2 = sf2.winner;
	}

	updateTournamentDisplay();
}

function restartTournament(): void {
	tournamentOverlayShown = false;
	initializeTournament();
	updateTournamentDisplay();

	if (game3D) {
		game3D.restartGame();
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

function updateScore(): void {
	if (!game3D) return;

	const score = game3D.getScore();
	const score1Element = document.getElementById('score1');
	const score2Element = document.getElementById('score2');

	if (score1Element) score1Element.textContent = score.p1.toString();
	if (score2Element) score2Element.textContent = score.p2.toString();

	if (game3D.isGameOver() && currentMatch && !currentMatch.isFinished && !nextMatchScheduled) {
		nextMatchScheduled = true;
		setTimeout(() => {
			nextMatch();
		}, 1200);
	}
}

function resetScoreDisplay(): void {
	const score1Element = document.getElementById('score1');
	const score2Element = document.getElementById('score2');

	if (score1Element) score1Element.textContent = '0';
	if (score2Element) score2Element.textContent = '0';
}

function showTournamentWinnerOverlay(name: string): void {
	tournamentOverlayShown = true;
	const overlay = document.createElement('div');
	overlay.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50';
	overlay.innerHTML = `
		<div class="bg-gray-900 border-2 border-yellow-500 rounded-2xl p-8 max-w-md w-full mx-4 text-center shadow-2xl">
		<div class="mb-6">
			<h2 class="text-3xl font-bold text-white mb-2">🏆 Tournament finished</h2>
			<div class="text-6xl mb-4">🥇</div>
			<h3 class="text-2xl font-bold text-yellow-400 mb-2">${name} won the tournament!</h3>
			<p class="text-sm text-gray-400">Tournament will automatically restart in 2.5s…</p>
		</div>
		<div class="flex flex-col gap-3">
			<button id="tournamentRestartBtn" class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
			🔄 New tournament
			</button>
			<button id="tournamentBackBtn" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
			🏠 Back to menu
			</button>
		</div>
		</div>
	`;
	document.body.appendChild(overlay);

	const restartBtn = overlay.querySelector('#tournamentRestartBtn');
	const backBtn = overlay.querySelector('#tournamentBackBtn');
	const autoTimer = setTimeout(() => {
		overlay.remove();
		restartTournament();
	}, 2500);

	restartBtn?.addEventListener('click', () => {
		clearTimeout(autoTimer);
		overlay.remove();
		restartTournament();
	});
	backBtn?.addEventListener('click', () => {
		clearTimeout(autoTimer);
		overlay.remove();
		history.back();
	});
}