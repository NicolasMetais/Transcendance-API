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

## 📡 API DOC

# 📡 API Documentation

## 📝 Description
L'API est un serveur qui communique **uniquement** avec `http://localhost:5173`.  
Elle permet d’effectuer des requêtes sur la base de données en toute sécurité, en servant d’intermédiaire entre le **frontend** et la **base de données**.  

- Les échanges se font **au format JSON**.  
- Les requêtes **doivent** envoyer du JSON dans leur corps.  
- Les réponses seront toujours en JSON.  

## 🔑 Authentification
Pour effectuer la majorité des requêtes, **un token JWT** est nécessaire.  
Ce token valide que vous êtes un utilisateur authentifié.  

### Format du header :
Authorization: Bearer <votre_token>

## 🚪 Routes **sans authentification**
Ces routes ne nécessitent **pas** de token.

`GET /auth/google/callback`
- **Description** : OAuth Google.  
- **Processus** :  
  1. Redirigez l’utilisateur vers la page OAuth fournie par Google.  
  2. Google vous renvoie un **code**.  
  3. Envoyez ce code à cette route pour obtenir un **token JWT**.  
- **Réponse** : `{ token: "<jwt>" }`

`POST /auth/google/SignIn`
- **Description** : Connexion par email + mot de passe.  
- **Body attendu** :
```json
{
  "email": "string",
  "password": "string"
}
```

`POST /auth/google/2fa_req`  
- **Description** : Validation de la connexion à deux facteurs.  
- **Body attendu** : 
```json 
{
  "id": "string",
  "code": "string" // 6 chiffres
}  
```
- **URL de requête** : https://localhost:8443/2fa_req  

---

## 🔑 Routes **avec authentification**  
Toutes les autres routes nécessitent un token d'authentification.  
Chaque requête doit contenir un token dans son header au format :  
Authorization: Bearer <token>

---

### **Routes de test (à supprimer, uniquement pour debug)**  
Ces routes permettent de visualiser les données de la base en JSON.  
- GET https://localhost:8443/showUsers  
- GET https://localhost:8443/showStats  
- GET https://localhost:8443/showFriends  
- GET https://localhost:8443/showMatches

---

### **Incrémentation des statistiques**  
POST https://localhost:8443/incrementGameplayed  
- **Body attendu** :  
```json
{
  "user_id_1": "string",
  "user_id_2": "string"
}
```
---

### **Gestion des amis**  

#### Créer une demande d’ami  
POST https://localhost:8443/friendRequest 
```json
{
  "user_id": "string",
  "friend_id": "string"
}
```

#### Liste d'amis  
GET https://localhost:8443/friendlist/:id

#### Demandes d’amis en attente  
GET https://localhost:8443/friendReq/:id

#### Accepter une demande  
POST https://localhost:8443/friendAccept  
```json
{
  "user_id": "string",
  "friend_id": "string"
}
```
#### Refuser une demande  
POST https://localhost:8443/friendRefuse  
```json
{
  "user_id": "string",
  "friend_id": "string"
}
```
#### Bloquer un ami
POST https://localhost:8443/friendBlock
```json
{
  "user_id": "string",
  "friend_id": "string"
}
```
#### Débloquer un ami  
POST https://localhost:8443/unblockFriend  
```json
{
  "user_id": "string",
  "friend_id": "string"
}
```
#### Supprimer un ami  
POST https://localhost:8443/unblockFriend  
```json
{
  "user_id": "string",
  "friend_id": "string"
}
```
---

### **Gestion des matchs**  

#### Ajouter un match fini  
POST https://localhost:8443/newMatch  
```json
{
  "id1": "string",
  "id2": "string",
  "winner_id": "string",
  "scoreP1": "number",
  "scoreP2": "number"
}
```
#### Récupérer les données d’un match  
GET https://localhost:8443/matches/:id

---

### **Gestion des profils**  

#### Récupérer le profil d’un utilisateur  
GET https://localhost:8443/users/:id

#### Récupérer le profil de l’utilisateur connecté  
POST https://localhost:8443/myprofile  
```json
{
  "id": "string"
}
```
#### Mettre à jour un utilisateur  
PUT https://localhost:8443/users/:id  
- **Body attendu** : une ou plusieurs données de la table user.

#### Rendre un utilisateur anonyme  
POST https://localhost:8443/anonymise  
```json
{
  "id": "string"
}
```
#### Supprimer un utilisateur  
DELETE https://localhost:8443/users/:id

---

📄 **ISC # Transcendance-API**

ISC # Transcendance-API
