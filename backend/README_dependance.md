# Dépendances du projet — Chi-Fou-Mi

Ce document liste tout ce qui doit être installé pour faire fonctionner le projet, avec l'explication du rôle de chaque dépendance.

## Prérequis système

- **Node.js** (version 20+) — moteur qui fait tourner backend et front
- **Docker Desktop** — orchestre tous les services ensemble (voir `docker-compose.yml`)

## Backend (`backend/`)

### Déjà présentes dès le départ
- **NestJS** (`@nestjs/core`, `@nestjs/common`, etc.) — framework backend
- **`@nestjs/jwt`** — fabrique les tokens JWT
- **`@nestjs/config`** — lecture du fichier `.env`
- **`class-validator`**, **`class-transformer`** — validation automatique des DTO

### Installées pour la base de données (Prisma)
```bash
npm install prisma@6 --save-dev
npm install @prisma/client@6
```
- **Prisma** — ORM, traduit le code TypeScript en requêtes SQL
- Utilisé avec **PostgreSQL** (voir Docker plus bas)

### Installées pour la sécurité des mots de passe
```bash
npm install bcrypt
npm install -D @types/bcrypt
```
- **bcrypt** — hache les mots de passe avant stockage, jamais en clair

### Installées pour l'authentification par token (Guards)
```bash
npm install @nestjs/passport passport passport-jwt
npm install -D @types/passport-jwt
```
- **passport / passport-jwt** — vérifient qu'un token JWT est valide avant d'autoriser l'accès à une route
- Utilisées dans `jwt.strategy.ts` et `jwt-auth.guard.ts`

### Installées pour la double authentification (2FA)
```bash
npm install otplib qrcode
```
- **otplib** — génère et vérifie les codes TOTP (codes à 6 chiffres, type Google Authenticator)
- **qrcode** — génère l'image du QR code à scanner pour activer la 2FA

## Frontend (`front/`)

### Déjà présentes dès le départ
- **Next.js**, **React** — framework et librairie d'interface
- **Tailwind CSS** — style visuel
- **axios** — envoi des requêtes HTTP vers le backend
- **react-hook-form** — gestion des formulaires
- **@tanstack/react-query** — gestion du cache et des requêtes au serveur

### Installée pour les icônes
```bash
npm install lucide-react
```
- **lucide-react** — icônes utilisées dans les formulaires (afficher/masquer mot de passe, flèches, etc.)
- ⚠️ Cette dépendance manquait à un moment et empêchait toute interactivité sur les pages qui l'importaient (voir section "Bugs résolus" plus bas)

## Infrastructure (Docker)

Le fichier `docker-compose.yml`, à la racine du projet, orchestre 5 services :

| Service | Rôle |
|---|---|
| `database` | PostgreSQL — stocke réellement les données |
| `backend` | Le serveur NestJS, construit depuis `backend/Dockerfile` |
| `frontend` | Le site Next.js, construit depuis `front/Dockerfile` (mode **production**, pas dev — voir plus bas) |
| `nginx` | Redirige le trafic, gère le HTTPS, fait le lien entre `/api/...` (backend) et le reste (frontend) |
| `vault` | Gestion des secrets (HashiCorp Vault) — présent mais pas encore intégré au code |

### Variables d'environnement nécessaires (fichier `.env` à la racine, jamais commité)

```
DB_USER=...
DB_PASSWORD=...
DB_NAME=...
JWT_SECRET=...
DATABASE_URL=postgresql://...
VAULT_TOKEN=...
```

Copier `.env.example` en `.env` et remplacer les valeurs.

### Lancer tout le projet

```bash
docker compose up --build
```

Accessible ensuite sur **https://localhost** (certificat auto-signé, accepter l'avertissement de sécurité).

## Bugs résolus, pour référence

- **`lucide-react` manquant** → empêchait toute la page (formulaire, boutons) de devenir interactive. Réinstallé côté front.
- **Frontend en mode dev dans Docker** → le Hot Module Reload (WebSocket) échouait via nginx (non configuré pour les WebSockets), perturbant l'hydratation React. Corrigé en passant le `Dockerfile` du front en mode **production** (`npm run build` puis `npm run start`).
- **`select` Prisma trop restrictif** → plusieurs fonctions (`getProfile`, `modifyProfile`, `updateProfile`, `myMatchProfile`) ne renvoyaient que `id`/`email`/`createdAt`, ce qui cassait la détection "profil complet" côté front (redirection en boucle vers `/createProfile`). Élargi aux vrais champs de profil.