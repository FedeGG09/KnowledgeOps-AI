# main.py
import asyncio
import os

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
from routes.chatService import chat_instance

APP_TITLE = "Xitrus API"
APP_VERSION = "1.0.0"


app = FastAPI(
    title=APP_TITLE,
    description="Backend Xitrus / Besalco",
    version=APP_VERSION,
)

# Para AWS Lambda / API Gateway
handler = Mangum(app)

# CORS: local + producción
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "https://llm.analyticstown.com",
    "https://llm.analyticstown.com/",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(routerLogin)
app.include_router(routerChat)
app.include_router(routerRoles)
app.include_router(routerFiles)
app.include_router(sign_up)
app.include_router(routerPwdRecovery)


async def wait_for_database(max_retries: int = 30, delay_seconds: int = 2) -> None:
    """
    Espera a que PostgreSQL esté disponible antes de inicializar tablas.
    """
    last_error = None

    for attempt in range(1, max_retries + 1):
        try:
            async with engine.begin() as conn:
                await conn.execute(text("SELECT 1"))
            return
        except Exception as exc:
            last_error = exc
            print(f"[DB] PostgreSQL no disponible (intento {attempt}/{max_retries}): {exc}")
            await asyncio.sleep(delay_seconds)

    raise RuntimeError(f"No se pudo conectar a PostgreSQL luego de {max_retries} intentos") from last_error


async def init_models() -> None:
    """
    Crea las tablas si no existen.
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


DEMO_MODE = os.getenv("DEMO_MODE", "0") == "1"

@app.on_event("startup")
async def on_startup():
    if DEMO_MODE:
        print("[APP] Running in DEMO MODE → database disabled")
        return

    await wait_for_database()
    await init_models()
    print("[APP] Base de datos lista.")


@app.on_event("shutdown")
async def on_shutdown():
    """
    Cierra conexiones del engine.
    """
    await engine.dispose()
    print("[APP] Engine cerrado correctamente.")


@app.get("/")
async def read_root():
    return {"message": "Welcome to the AUTH API XITRUS!"}


@app.get("/health")
async def health():
    return {"status": "ok", "app": APP_TITLE, "version": APP_VERSION}


@app.get("/health/db")
async def health_db():
    try:
        async with engine.begin() as conn:
            await conn.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception as exc:
        return {"status": "error", "database": "down", "detail": str(exc)}


if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
