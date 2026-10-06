# Makefile — Chi-Fou-Mi
# Usage : tape "make <commande>" a la racine du projet

# ==============================================================================
# LISTE CENTRALISEE DE TOUTES LES DEPENDANCES DU PROJET
# Ajoute ici toute nouvelle dependance : elle sera installee a chaque build
# ==============================================================================
BACKEND_DEPS := prisma@6 @prisma/client@6 bcrypt @types/bcrypt \
                @nestjs/passport passport passport-jwt @types/passport-jwt \
                otplib qrcode \
                @nestjs/websockets@11 @nestjs/platform-socket.io@11 socket.io

FRONTEND_DEPS := lucide-react socket.io-client

# ==============================================================================
# VERIFICATION DES PREREQUIS SYSTEME
# ==============================================================================
check-docker:
	@if ! command -v docker &> /dev/null; then \
		echo ""; \
		echo "ERREUR : Docker n'est pas installe sur cette machine."; \
		echo "-> Installe Docker Desktop depuis : https://www.docker.com/products/docker-desktop/"; \
		echo "-> Une fois installe et lance, relance : make install"; \
		echo ""; \
		exit 1; \
	fi
	@if ! docker info &> /dev/null; then \
		echo ""; \
		echo "ERREUR : Docker est installe mais ne semble pas demarre."; \
		echo "-> Lance l'application Docker Desktop, attends qu'elle soit prete, puis relance : make install"; \
		echo ""; \
		exit 1; \
	fi
	@echo "-> Docker est installe et demarre, on continue."

# ==============================================================================
# INSTALLATION COMPLETE — a lancer en premier, sur une machine qui n'a jamais
# vu le projet
# ==============================================================================
install: check-docker
	@echo "== Verification du fichier .env =="
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "-> .env cree a partir de .env.example."; \
		echo "-> ATTENTION : ouvre .env et remplace les valeurs par les tiennes avant de continuer."; \
		echo "-> Relance ensuite : make install"; \
		exit 1; \
	else \
		echo "-> .env existe deja, on continue."; \
	fi
	@$(MAKE) build
	@echo ""
	@echo "== Attente que la base de donnees soit prete =="
	@sleep 5
	@echo ""
	@echo "== Application des migrations Prisma =="
	docker compose exec backend npx prisma migrate deploy
	@echo ""
	@echo "== C'est pret ! =="
	@echo "-> Site accessible sur https://localhost (accepter l'avertissement de certificat)"
	@echo "-> Voir les logs : make logs"

# ==============================================================================
# GESTION QUOTIDIENNE
# ==============================================================================

# Demarre tous les services (en arriere-plan), sans reconstruire ni reinstaller
up: check-docker
	docker compose up -d

# Reconstruit tout : installe TOUTES les dependances listees ci-dessus dans les
# conteneurs, sauvegarde package.json/lock sur le disque, puis reconstruit les
# images proprement. A utiliser a chaque fois qu'on ajoute une dependance.
build: check-docker
	docker compose up -d
	@echo "== Installation des dependances backend =="
	docker compose exec backend npm install $(BACKEND_DEPS)
	docker compose cp backend:/app/package.json ./backend/package.json
	docker compose cp backend:/app/package-lock.json ./backend/package-lock.json
	@echo "== Installation des dependances frontend =="
	docker compose exec frontend npm install $(FRONTEND_DEPS)
	docker compose cp frontend:/app/package.json ./front/package.json
	docker compose cp frontend:/app/package-lock.json ./front/package-lock.json
	@echo "== Reconstruction des images =="
	docker compose down
	docker compose up --build -d
	@echo "== Termine =="

# Arrete tous les services
down:
	docker compose down

# Redemarre proprement tout
restart: down build

# Affiche l'etat de tous les services
ps:
	docker compose ps

# ==============================================================================
# LOGS
# ==============================================================================

logs:
	docker compose logs -f

logs-backend:
	docker compose logs -f backend

logs-frontend:
	docker compose logs -f frontend

# ==============================================================================
# AJOUTER UNE DEPENDANCE PONCTUELLE (en plus de la liste ci-dessus)
# Usage : make install-backend pkg="nom-du-package"
# Pense aussi a l'ajouter dans BACKEND_DEPS en haut de ce fichier, pour qu'elle
# survive aux prochains "make build" faits par toute l'equipe.
# ==============================================================================
install-backend: check-docker
	docker compose up -d
	docker compose exec backend npm install $(pkg)
	docker compose cp backend:/app/package.json ./backend/package.json
	docker compose cp backend:/app/package-lock.json ./backend/package-lock.json
	$(MAKE) build

install-frontend: check-docker
	docker compose up -d
	docker compose exec frontend npm install $(pkg)
	docker compose cp frontend:/app/package.json ./front/package.json
	docker compose cp frontend:/app/package-lock.json ./front/package-lock.json
	$(MAKE) build

# ==============================================================================
# BASE DE DONNEES (Prisma)
# ==============================================================================

# Usage : make migrate name="nom_de_la_migration"
migrate:
	docker compose exec backend npx prisma migrate dev --name $(name)

reset-db:
	docker compose exec backend npx prisma migrate reset

studio:
	docker compose exec backend npx prisma studio

db-shell:
	docker compose exec database psql -U $${DB_USER} -d $${DB_NAME}

# ==============================================================================
# ACCES AUX CONTENEURS
# ==============================================================================

shell-backend:
	docker compose exec backend sh

shell-frontend:
	docker compose exec frontend sh

# ==============================================================================
# NETTOYAGE
# ==============================================================================

# Arrete les conteneurs ET supprime les volumes (perte de donnees !)
clean:
	docker compose down -v

.PHONY: check-docker install up build down restart ps logs logs-backend logs-frontend install-backend install-frontend migrate reset-db studio shell-backend shell-frontend db-shell clean