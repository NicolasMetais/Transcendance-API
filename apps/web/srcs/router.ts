import { createHomePage } from './home';
import { createGamePage } from './game';

// Fonctions pour afficher les pages
export function showHomePage(): void {
  createHomePage();
}

export function showGamePage(): void {
  createGamePage();
}

// Fonction pour gérer le routage
export function handleRoute(): void {
  const path = window.location.pathname;
  
  switch (path) {
    case '/':
    case '':
      showHomePage();
      break;
    case '/game':
      showGamePage();
      break;
    default:
      // Page 404 - rediriger vers l'accueil
      window.history.pushState({}, '', '/');
      showHomePage();
      break;
  }
}

// Initialiser le routage
export function initRouter(): void {
  // Gérer la navigation initiale
  handleRoute();
  
  // Écouter les changements d'URL (boutons retour/avancer du navigateur)
  window.addEventListener('popstate', handleRoute);
} 