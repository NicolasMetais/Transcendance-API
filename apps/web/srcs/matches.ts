export async function createMatchesPage(): Promise<void> {
	const app = document.getElementById('app');
	if (!app) return;

	const token = localStorage.getItem('auth_token');
	if (!token) {
		window.history.pushState({}, '', '/signIn');
		window.dispatchEvent(new PopStateEvent('popstate'));
		return;
	}

	let userId: number | null = null;
	try {
		const payload = JSON.parse(atob(token.split('.')[1]));
		userId = payload.userId;
	} catch { }
	if (!userId) {
		window.history.pushState({}, '', '/signIn');
		window.dispatchEvent(new PopStateEvent('popstate'));
		return;
	}

	app.innerHTML = `
	<div class="min-h-screen bg-gray-50">
	<div class="max-w-3xl mx-auto px-4 py-8">
		<div class="flex items-center justify-between mb-6">
		<h1 class="text-2xl font-bold text-gray-900">Historique des matchs</h1>
		<button id="backBtn" class="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800">Retour</button>
		</div>
		<div id="list" class="space-y-3">
		<div class="text-gray-500 text-sm">Chargement...</div>
		</div>
	</div>
	</div>
	`;

	const backBtn = document.getElementById('backBtn');
	backBtn?.addEventListener('click', () => {
		window.history.pushState({}, '', '/dashboard');
		window.dispatchEvent(new PopStateEvent('popstate'));
	});

	const list = document.getElementById('list');
	try {
		const res = await fetch(`https://localhost:8443/matches/${userId}`, {
			headers: { 'Authorization': `Bearer ${token}` }
		});
		if (!res.ok) {
			list!.innerHTML = `<div class="text-sm text-gray-500">Aucun match trouvé</div>`;
			return;
		}
		const matches = await res.json();
		if (!Array.isArray(matches) || matches.length === 0) {
			list!.innerHTML = `<div class="text-sm text-gray-500">Aucun match trouvé</div>`;
			return;
		}

		const userIds = new Set<number>();
		matches.forEach((m: any) => {
			userIds.add(m.player1_id);
			userIds.add(m.player2_id);
		});

		const usernameCache = new Map<number, string>();
		await Promise.all(Array.from(userIds).map(async (id) => {
			try {
				const userRes = await fetch(`https://localhost:8443/users/${id}`, {
					headers: { 'Authorization': `Bearer ${token}` }
				});
				if (userRes.ok) {
					const userData = await userRes.json();
					usernameCache.set(id, userData?.user?.username || `Utilisateur ${id}`);
				} else {
					usernameCache.set(id, `Utilisateur ${id}`);
				}
			} catch {
				usernameCache.set(id, `Utilisateur ${id}`);
			}
		}));

		list!.innerHTML = matches.map((m: any) => {
			const youAreP1 = m.player1_id === userId;
			const meScore = youAreP1 ? m.score_player1 : m.score_player2;
			const oppScore = youAreP1 ? m.score_player2 : m.score_player1;
			const result = m.winner_id === userId ? 'Victoire' : 'Défaite';

			const player1Name = usernameCache.get(m.player1_id) || `Utilisateur ${m.player1_id}`;
			const player2Name = usernameCache.get(m.player2_id) || `Utilisateur ${m.player2_id}`;

			return `
		<div class="p-4 bg-white rounded shadow flex items-center justify-between">
		<div>
			<div class="text-sm text-gray-600">Match ID #${m.id}</div>
			<div class="text-lg font-semibold">${result} ${meScore} - ${oppScore}</div>
			<div class="text-sm text-gray-500">${player1Name} vs ${player2Name}</div>
		</div>
		<div class="text-xs text-gray-500">${youAreP1 ? 'Vous étiez P1' : 'Vous étiez P2'}</div>
		</div>
	`;
		}).join('');
	} catch (e) {
		list!.innerHTML = `<div class="text-sm text-red-600">Erreur de chargement</div>`;
	}
}


