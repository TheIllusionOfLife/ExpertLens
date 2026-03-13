.PHONY: dev-api dev-web test lint typecheck seed deploy

dev-api:
	uv run uvicorn app.api.main:app --reload --port 8000

dev-web:
	cd app/web && bun run dev

test:
	uv run pytest tests/ -v
	cd app/web && bun run test:e2e

lint:
	uv run ruff check app/ agent/ tests/
	cd app/web && bun run lint

typecheck:
	uv run pyright
	cd app/web && bun run typecheck

seed:
	uv run python scripts/seed_firestore.py

deploy:
	./infra/deploy.sh
