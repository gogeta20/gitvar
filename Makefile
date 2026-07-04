COMPOSE ?= docker compose

.PHONY: help up down build shell logs format clean

help:
	@printf "%s\n" \
	"Available targets:" \
	"  make up      - Build and start the dev container" \
	"  make down    - Stop the dev container" \
	"  make build   - Rebuild the dev container image" \
	"  make shell   - Open a shell in the dev container" \
	"  make logs    - Tail container logs" \
	"  make format  - Placeholder for project formatters" \
	"  make clean   - Remove dev container and volumes"

up:
	$(COMPOSE) up -d dev

down:
	$(COMPOSE) down

build:
	$(COMPOSE) build dev

shell:
	$(COMPOSE) exec dev bash

logs:
	$(COMPOSE) logs -f dev

format:
	@printf "%s\n" "Formatters not configured yet."

clean:
	$(COMPOSE) down -v

