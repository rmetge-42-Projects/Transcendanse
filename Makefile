NAME = transcendence

GREEN = \033[0;32m
RED = \033[0;31m
YELLOW = \033[0;33m
RESET = \033[0m

all: start

start:
	@echo "$(GREEN)Building and starting containers for $(NAME)...$(RESET)"
	@if [ ! -s secrets/nginx-certs/transcendance.crt ] || [ ! -s secrets/nginx-certs/transcendance.key ]; then ./generate-certs.sh; fi
	@if [ ! -s vault-certs/vault.crt ] || [ ! -s vault-certs/vault.key ]; then ./generate-vault-certs.sh; fi
	@mkdir -p backups && chmod 700 backups
	@python3 ensure-public-api-key.py
	@unset PUBLIC_API_KEY && docker compose up --build -d
	@echo "$(GREEN)$(NAME) is up and running!$(RESET)"

down:
	@echo "$(YELLOW)Stopping $(NAME) containers...$(RESET)"
	docker compose down

clean:
	@echo "$(YELLOW)Removing this project's containers and local images (volumes are preserved)...$(RESET)"
	docker compose down --rmi local

fclean: down
	@echo "$(RED)Deep clean: Removing project containers, networks, images, and volumes...$(RESET)"
	docker compose down -v --rmi all
	@echo "$(GREEN)Project cleanup complete.$(RESET)"

re: fclean all

.PHONY: all start down clean fclean re
