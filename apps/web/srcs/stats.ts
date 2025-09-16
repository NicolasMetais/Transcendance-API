export function createStatsPage(): void {
	const app = document.getElementById('app');
	if (!app) return;
	app.innerHTML = `
    <div class="min-h-screen bg-gray-50">
        <h1 class="text-3xl font-bold text-gray-900">Ouais</h1>
    </div>
  `;
}