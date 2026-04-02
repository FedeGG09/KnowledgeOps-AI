from __future__ import annotations

import asyncio
import logging
import os
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from sqlalchemy import text

from db.db import engine
from models.models import Base

from routes.chatService import routerChat
from routes.rolesService import routerRoles
from routes.fileService import routerFiles

APP_TITLE = "KnowledgeOps AI API"
APP_VERSION = "2.0.0"
APP_DESCRIPTION = (
    "Enterprise-grade FastAPI backend for document intelligence, "
    "role management and AI-powered knowledge retrieval."
)

# Demo libre, sin autenticación
DEMO_MODE = True

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
)
logger = logging.getLogger(__name__)


async def wait_for_database(max_retries: int = 30, delay_seconds: int = 2) -> None:
    last_error = None

    for attempt in range(1, max_retries + 1):
        try:
            async with engine.begin() as conn:
                await conn.execute(text("SELECT 1"))
            logger.info("✅ Database connection established.")
            return
        except Exception as exc:
            last_error = exc
            logger.warning(f"⏳ Database unavailable ({attempt}/{max_retries}) → {exc}")
            await asyncio.sleep(delay_seconds)

    raise RuntimeError(
        f"❌ Database unavailable after {max_retries} retries."
    ) from last_error


async def init_models() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    logger.info("✅ Database schema initialized.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Starting application...")
    await wait_for_database()
    await init_models()
    logger.info("🎯 Demo mode enabled: no authentication layer.")
    yield
    await engine.dispose()
    logger.info("🛑 Application shutdown complete.")


app = FastAPI(
    title=APP_TITLE,
    description=APP_DESCRIPTION,
    version=APP_VERSION,
    lifespan=lifespan,
)

handler = Mangum(app)

origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "https://knowledgeops-ai-web.pages.dev",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers públicos
app.include_router(routerChat, prefix="/api")
app.include_router(routerRoles, prefix="/api")
app.include_router(routerFiles, prefix="/api")


@app.get("/", tags=["System"])
async def read_root():
    return {
        "message": "🚀 KnowledgeOps AI API running",
        "version": APP_VERSION,
        "mode": "demo-free",
    }


@app.get("/health", tags=["System"])
async def health():
    return {
        "status": "ok",
        "app": APP_TITLE,
        "version": APP_VERSION,
        "mode": "demo-free",
    }


@app.get("/health/db", tags=["System"])
async def health_db():
    try:
        async with engine.begin() as conn:
            await conn.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception as exc:
        logger.error(f"❌ Database health failed → {exc}")
        return {"status": "error", "database": "down", "detail": str(exc)}


if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
