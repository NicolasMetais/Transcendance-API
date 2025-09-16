import { createHomePage } from './home';
import { createGamePage } from './game';
import { createTournamentPage } from './tournament';
import { createSignInPage } from './signIn';
import { createSignUpPage } from './signUp';
import { createDashboardPage } from './dashboard';
import { createProfilePage } from './profile';
import { createMatchesPage } from './matches';
import { createStatsPage } from './stats';

export function showHomePage(): void {
	createHomePage();
}

export function showGamePage(): void {
	createGamePage();
}

export function showTournamentPage(): void {
	createTournamentPage();
}

export function showSignInPage(): void {
	createSignInPage();
}

export function showSignUpPage(): void {
	createSignUpPage();
}

export function showDashboardPage(): void {
	createDashboardPage();
}

export function showProfilePage(): void {
	createProfilePage();
}

export function showMatchesPage(): void {
	createMatchesPage();
}

export function showStatsPage(): void {
	createStatsPage();
}

export function handleRoute(): void {
	const path = window.location.pathname;

	try {
		const w = window as unknown as { pageCleanup?: () => void };
		w.pageCleanup?.();
		w.pageCleanup = undefined;
	} catch { }

	switch (path) {
		case '/':
		case '':
			showHomePage();
			break;
		case '/game':
			showGamePage();
			break;
		case '/tournament':
			showTournamentPage();
			break;
		case '/signIn':
			showSignInPage();
			break;
		case '/signUp':
			showSignUpPage();
			break;
		case '/dashboard':
			showDashboardPage();
			break;
		case '/profile':
			showProfilePage();
			break;
		case '/matches':
			showMatchesPage();
			break;
		case '/stats':
			showStatsPage();
			break;
		default:
			window.history.pushState({}, '', '/');
			showHomePage();
			break;
	}
}


export function initRouter(): void {
	handleRoute();
	window.addEventListener('popstate', handleRoute);
} 