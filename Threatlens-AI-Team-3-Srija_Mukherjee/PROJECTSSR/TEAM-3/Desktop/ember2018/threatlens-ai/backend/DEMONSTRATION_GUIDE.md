# ThreatLens database and integration demonstration

## What is complete

- PostgreSQL connection pooling, schema relationships, integrity indexes, and Alembic migration history.
- Audit timestamps on every database table and soft deletion for scans.
- BCrypt password hashing, JWT login, and authenticated, role-aware API access.
- Per-user scan deduplication, persisted static/ML analysis, alerts, reports, and scan history.
- PostgreSQL backup script and isolated automated integration test.

## First-time setup

1. Copy `.env.example` to `.env` if it does not exist.
2. Set `DATABASE_URL` and a long random `JWT_SECRET_KEY` in `.env`.
3. Install packages with `pip install -r requirements.txt`.
4. Existing databases: run `alembic stamp 20260901_00` once, then `alembic upgrade head`.
   New databases: run `alembic upgrade head`, then start the API; startup creates any base tables.

## Demonstration order

1. Run `python test_backend.py` to show isolated integration testing.
2. Run `alembic current` to show migration version `20260901_01`.
3. Start `uvicorn app.main:app --reload --port 8000`.
4. In `/docs`, register, log in, click **Authorize**, and enter the access token value (without typing `Bearer`).
5. Call `/api/auth/me`; then upload a sample through `/api/upload/scan`.
6. List scans, open scan details, upload the same file again to demonstrate deduplication, then soft-delete it.
7. Run `scripts/backup_postgres.ps1` to create a PostgreSQL backup.
