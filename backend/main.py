# main.py
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

from routes.loginService import routerLogin
from routes.chatService import routerChat
from routes.rolesService import routerRoles
from routes.fileService import routerFiles
from routes.signupService import sign_up
from routes.pwdRecoveryService import routerPwdRecovery

# =========================================================
# APP CONFIG
# =========================================================
APP_TITLE = "KnowledgeOps AI API"
APP_VERSION = "2.0.0"
APP_DESCRIPTION = (
    "Enterprise-grade FastAPI backend for document intelligence, "
    "authentication, role management and AI-powered knowledge retrieval."
)

DEMO_MODE = os.getenv("DEMO_MODE", "0") == "1"

# =========================================================
# LOGGING
# =========================================================
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
)
logger = logging.getLogger(__name__)

# =========================================================
# DATABASE HELPERS
# =========================================================
async def wait_for_database(max_retries: int = 30, delay_seconds: int = 2) -> None:
    """
    Espera a que la base de datos esté disponible antes de levantar la app.
    Ideal para Docker / Render / Railway.
    """
    last_error = None

    for attempt in range(1, max_retries + 1):
        try:
            async with engine.begin() as conn:
                await conn.execute(text("SELECT 1"))
            logger.info("✅ Database connection established.")
            return
        except Exception as exc:
            last_error = exc
            logger.warning(
                f"⏳ Database unavailable ({attempt}/{max_retries}) → {exc}"
            )
            await asyncio.sleep(delay_seconds)

    raise RuntimeError(
        f"❌ Database unavailable after {max_retries} retries."
    ) from last_error


async def init_models() -> None:
    """
    Crea las tablas automáticamente si no existen.
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    logger.info("✅ Database schema initialized.")


# =========================================================
# APP LIFECYCLE
# =========================================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifecycle moderno de FastAPI (startup + shutdown).
    Más enterprise que @app.on_event.
    """
    logger.info("🚀 Starting application...")

    if DEMO_MODE:
        logger.info("🎯 Running in DEMO MODE → database disabled.")
    else:
        await wait_for_database()
        await init_models()

    yield

    if not DEMO_MODE:
        await engine.dispose()

    logger.info("🛑 Application shutdown complete.")


# =========================================================
# FASTAPI APP
# =========================================================
app = FastAPI(
    title=APP_TITLE,
    description=APP_DESCRIPTION,
    version=APP_VERSION,
    lifespan=lifespan,
)

# AWS Lambda / Cloud adapters
handler = Mangum(app)

# =========================================================
# CORS
# =========================================================
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "https://llm.analyticstown.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if not DEMO_MODE else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================================================
# ROUTERS
# =========================================================
app.include_router(routerLogin, prefix="/api")
app.include_router(routerChat, prefix="/api")
app.include_router(routerRoles, prefix="/api")
app.include_router(routerFiles, prefix="/api")
app.include_router(sign_up, prefix="/api")
app.include_router(routerPwdRecovery, prefix="/api")

# =========================================================
# SYSTEM ROUTES
# =========================================================
@app.get("/", tags=["System"])
async def read_root():
    return {
        "message": "🚀 KnowledgeOps AI API running",
        "version": APP_VERSION,
        "demo_mode": DEMO_MODE,
    }


@app.get("/health", tags=["System"])
async def health():
    return {
        "status": "ok",
        "app": APP_TITLE,
        "version": APP_VERSION,
        "demo_mode": DEMO_MODE,
    }


@app.get("/health/db", tags=["System"])
async def health_db():
    if DEMO_MODE:
        return {
            "status": "ok",
            "database": "disabled (demo mode)",
        }

    try:
        async with engine.begin() as conn:
            await conn.execute(text("SELECT 1"))

        return {
            "status": "ok",
            "database": "connected",
        }
    except Exception as exc:
        logger.error(f"❌ Database health failed → {exc}")
        return {
            "status": "error",
            "database": "down",
            "detail": str(exc),
        }


# =========================================================
# LOCAL DEV ENTRYPOINT
# =========================================================
if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
    )
