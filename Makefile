NAME = transcendence

GREEN = \033[0;32m
RED = \033[0;31m
YELLOW = \033[0;33m
RESET = \033[0m

all: $(NAME)

$(NAME):
	@echo "$(GREEN)Building and starting containers for $(NAME)...$(RESET)"
	@if [ ! -s secrets/nginx-certs/transcendance.crt ] || [ ! -s secrets/nginx-certs/transcendance.key ]; then ./generate-certs.sh; fi
	@if [ ! -s vault-certs/vault.crt ] || [ ! -s vault-certs/vault.key ]; then ./generate-vault-certs.sh; fi
	@mkdir -p backups && chmod 700 backups
	docker compose build backend
	docker compose build frontend
	docker compose up -d
	@echo "$(GREEN)$(NAME) is up and running!$(RESET)"
	@touch $(NAME)

down:
	@echo "$(YELLOW)Stopping $(NAME) containers...$(RESET)"
	docker compose down
	@rm -f $(NAME)

clean:
	@echo "$(YELLOW)Removing this project's containers and local images (volumes are preserved)...$(RESET)"
	docker compose down --rmi local
	@rm -f $(NAME)

fclean: down
	@echo "$(RED)Deep clean: Removing project containers, networks, images, and volumes...$(RESET)"
	docker compose down -v --rmi all
	@echo "$(GREEN)Project cleanup complete.$(RESET)"

re: fclean all

.PHONY: all down clean fclean re

