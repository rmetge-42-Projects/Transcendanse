AME = transcendence

# Colors for output
GREEN = \033[0;32m
RED = \033[0;31m
YELLOW = \033[0;33m
RESET = \033[0m

all: $(NAME)

$(NAME):
	@echo "$(GREEN)Building and starting containers for $(NAME)...$(RESET)"
	docker compose up --build -d
	@echo "$(GREEN)$(NAME) is up and running!$(RESET)"

down:
	@echo "$(YELLOW)Stopping $(NAME) containers...$(RESET)"
	docker compose down

clean: down
	@echo "$(YELLOW)Cleaning up stopped containers and dangling images...$(RESET)"
	docker system prune -f

fclean: down
	@echo "$(RED)Deep clean: Removing project containers, networks, images, and volumes...$(RESET)"
	docker compose down -v --rmi all
	@echo "$(GREEN)Project cleanup complete.$(RESET)"

re: fclean all

.PHONY: all down clean fclean re