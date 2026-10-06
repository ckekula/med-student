Wipe everything:
```bash
docker compose exec backend rm -f migrations/versions/*.py
docker compose down -v
docker compose up -d
```

generate and apply migration:
```bash
docker compose exec backend alembic revision --autogenerate -m "initial schema"
docker compose exec backend alembic upgrade head
docker compose cp backend:/app/migrations/versions/. ./backend/migrations/versions/
```