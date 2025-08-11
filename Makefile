# FT Gamberge - Makefile
.PHONY: help dev build start stop logs clean test api web certs

# Variables
DOCKER_COMPOSE = docker-compose -f docker/compose.yml

# Help
help: ## Affiche l'aide
	@echo "FT Gamberge - Commandes disponibles:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

# Développement
dev: ## Démarre l'environnement de développement (build + start)
	$(DOCKER_COMPOSE) up --build

start: ## Démarre les services
	$(DOCKER_COMPOSE) up

stop: ## Arrête les services
	$(DOCKER_COMPOSE) down

logs: ## Affiche les logs
	$(DOCKER_COMPOSE) logs -f

# Services individuels
api: ## Démarre seulement l'API
	$(DOCKER_COMPOSE) up api

web: ## Démarre seulement le frontend
	$(DOCKER_COMPOSE) up web

# Logs par service
logs-api: ## Affiche les logs de l'API
	$(DOCKER_COMPOSE) logs -f api

logs-web: ## Affiche les logs du frontend
	$(DOCKER_COMPOSE) logs -f web

# Nettoyage
clean: ## Nettoie les conteneurs et images
	$(DOCKER_COMPOSE) down -v
	docker system prune -f

# Tests
test: ## Teste l'API
	@echo "Testing API health endpoint..."
	@curl -k -s https://localhost:8443/health || echo "API not responding"

# Certificats
certs: ## Génère les certificats SSL
	@echo "Generating SSL certificates..."
	@mkdir -p infra/certs
	@openssl req -x509 -newkey rsa:2048 -nodes \
		-keyout infra/certs/key.pem \
		-out infra/certs/cert.pem \
		-days 365 \
		-subj "/CN=localhost"
	@echo "Certificates generated in infra/certs/"

# Installation manuelle
install-api: ## Installe les dépendances de l'API
	cd apps/api && npm install

install-web: ## Installe les dépendances du frontend
	cd apps/web && npm install

install: install-api install-web ## Installe toutes les dépendances

# Développement manuel
dev-api: ## Démarre l'API en mode développement local
	cd apps/api && npm run dev

dev-web: ## Démarre le frontend en mode développement local
	cd apps/web && npm run dev

# Par défaut
.DEFAULT_GOAL := help 