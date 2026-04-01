import os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base

# =========================
# DATABASE CONFIG
# =========================
DATABASE_URL = os.getenv("DATABASE_URL")

# fallback demo para Render Free / portfolio
if not DATABASE_URL:
    DATABASE_URL = "sqlite+aiosqlite:///./demo.db"

engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    future=True
)

AsyncScopedSession = async_sessionmaker(
    bind=engine,
    expire_on_commit=False
)

Base = declarative_base()


async def get_db():
    async with AsyncScopedSession() as session:
        yield session
