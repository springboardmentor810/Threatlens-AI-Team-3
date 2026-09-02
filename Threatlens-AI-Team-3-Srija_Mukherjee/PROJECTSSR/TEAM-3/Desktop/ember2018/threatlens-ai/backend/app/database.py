import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import StaticPool

# Load environment variables from backend/.env
ENV_FILE = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    ".env"
)

load_dotenv(ENV_FILE)

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in .env")

# `pool_pre_ping` prevents stale PostgreSQL connections from causing a request
# to fail. SQLite is supported only for isolated tests, where this pool option
# and the thread check need different settings.
engine_options = {"pool_pre_ping": True}
if DATABASE_URL.startswith("sqlite"):
    engine_options["connect_args"] = {"check_same_thread": False}
    # An in-memory SQLite database otherwise creates one database per test
    # connection, which makes API tests see no tables.
    if DATABASE_URL.endswith(":memory:"):
        engine_options["poolclass"] = StaticPool

engine = create_engine(DATABASE_URL, **engine_options)

# Create database session
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base class for SQLAlchemy models
Base = declarative_base()


def get_db():
    """Get PostgreSQL database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create missing tables. Schema changes are applied through migrations."""
    # Importing models registers every mapped table before create_all runs.
    import app.models  # noqa: F401
    Base.metadata.create_all(bind=engine)

