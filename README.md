# FT Gamberge

Modern web application with HTTPS/WSS support using Vite, Fastify, and Docker Compose.

## 🚀 Features

- **Frontend**: Vite + TypeScript + Tailwind CSS
- **Backend**: Fastify + HTTPS + CORS
- **Development**: Hot reload for both front and back
- **Deployment**: Docker Compose orchestration
- **Security**: Self-signed HTTPS certificates for development

## 📋 Prerequisites

- Node.js (v20 or higher)
- Docker & Docker Compose
- OpenSSL (for certificate generation)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ft_gamberge
   ```

2. **Generate SSL certificates** (if not already done)
   ```bash
   make certs
   ```

## 🚀 Development

### Using Makefile (Recommended)

```bash
# Voir toutes les commandes disponibles
make

# Démarrer l'environnement de développement
make dev

# Tester l'API
make test

# Voir les logs
make logs

# Arrêter les services
make stop
```

### Using Docker Compose

Start both frontend and backend with hot reload:

```bash
docker-compose -f docker/compose.yml up --build
```

This will:
- Start the API on `https://localhost:8443`
- Start the frontend on `http://localhost:5173`
- Enable hot reload for both services

### Manual Development

Start services individually:

```bash
# Terminal 1 - Backend
cd apps/api && npm install && npm run dev

# Terminal 2 - Frontend
cd apps/web && npm install && npm run dev
```

## 🛠️ Makefile Commands

```bash
# Développement
make dev              # Démarre l'environnement de développement
make start            # Démarre les services
make stop             # Arrête les services
make logs             # Affiche les logs
make test             # Teste l'API

# Services individuels
make api              # Démarre seulement l'API
make web              # Démarre seulement le frontend
make logs-api         # Logs de l'API
make logs-web         # Logs du frontend

# Installation
make install          # Installe toutes les dépendances
make install-api      # Installe les dépendances de l'API
make install-web      # Installe les dépendances du frontend

# Développement manuel
make dev-api          # Démarre l'API en local
make dev-web          # Démarre le frontend en local

# Utilitaires
make certs            # Génère les certificats SSL
make clean            # Nettoie les conteneurs et images
make help             # Affiche l'aide
```

## 🐳 Docker Commands

```bash
# Start services
docker-compose -f docker/compose.yml up

# Start in background
docker-compose -f docker/compose.yml up -d

# Stop services
docker-compose -f docker/compose.yml down

# Rebuild and start
docker-compose -f docker/compose.yml up --build

# View logs
docker-compose -f docker/compose.yml logs

# View logs for specific service
docker-compose -f docker/compose.yml logs api
docker-compose -f docker/compose.yml logs web
```

## 📡 API Endpoints

### Health Check
- `GET https://localhost:8443/health`
- Returns: `{ ok: true }`

## 🎨 Frontend

- **URL**: `http://localhost:5173`
- **Framework**: Vite + TypeScript
- **Styling**: Tailwind CSS
- **Hot Reload**: Enabled

## 🔧 Configuration

### Environment Variables

- `NODE_ENV` - Environment (development/production)

### Ports

- Frontend: `5173` (HTTP)
- Backend: `8443` (HTTPS)

### Certificates

Self-signed certificates are stored in `infra/certs/`:
- `key.pem` - Private key
- `cert.pem` - Certificate

## 🧪 Testing

### Test the API
```bash
make test
# ou
curl -k https://localhost:8443/health
```

### Test the Frontend
1. Open `http://localhost:5173` in your browser
2. The application should load without errors

## 📁 Project Structure

```
ft_gamberge/
├── apps/
│   ├── api/                 # Backend (Fastify + HTTPS)
│   │   ├── src/
│   │   │   └── index.ts
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── web/                 # Frontend (Vite + TypeScript)
│       ├── src/
│       ├── Dockerfile
│       ├── package.json
│       ├── tailwind.config.js
│       └── postcss.config.js
├── docker/
│   └── compose.yml         # Docker Compose configuration
├── infra/
│   └── certs/              # SSL certificates
├── Makefile               # Commandes simplifiées
└── README.md
```

## 🔒 Security Notes

- Self-signed certificates are used for development only
- For production, use proper SSL certificates
- CORS is configured to allow `http://localhost:5173`

## 🐛 Troubleshooting

### Certificate Issues
If you get certificate warnings in the browser:
1. Accept the self-signed certificate
2. Or regenerate certificates: `make certs`

### Port Conflicts
If ports are already in use:
- Change ports in `docker/compose.yml`
- Or stop conflicting services: `make stop`

### Docker Issues
```bash
# Clean up containers and images
make clean

# Rebuild from scratch
make dev
```

### Node Version Issues
The project works with Node.js v20+. For older versions, consider upgrading.

## 📄 License

ISC # Transcendance-API
