from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from fastapi.encoders import jsonable_encoder
import datetime
import os

from db.db import get_db
from modules.oauth import create_access_token, verify_password
from modules.auth.password_manager import hash_password
from schemas.usuarioLoginModel import UserLogin

routerLogin = APIRouter()

DEMO_EMAIL = "demo@knowledgeops.ai"
DEMO_PASSWORD = "Knowledge123!"


@routerLogin.post("/login", tags=["login"])
async def login(user: UserLogin, db: AsyncSession = Depends(get_db)):
    # =====================================================
    # AUTO CREATE DEMO USER IF MISSING
    # =====================================================
    if user.email == DEMO_EMAIL and user.password == DEMO_PASSWORD:
        user_exists = await db.execute(
            text("SELECT * FROM users WHERE email = :email"),
            {"email": DEMO_EMAIL},
        )
        demo_user = user_exists.one_or_none()

        if not demo_user:
            await db.execute(
                text("""
                    INSERT INTO users (name, lastname, email, password, verified_account)
                    VALUES (:name, :lastname, :email, :password, true)
                """),
                {
                    "name": "Demo",
                    "lastname": "User",
                    "email": DEMO_EMAIL,
                    "password": hash_password(DEMO_PASSWORD),
                },
            )
            await db.commit()

        # volver a consultar
        user_exists = await db.execute(
            text("SELECT * FROM users WHERE email = :email"),
            {"email": DEMO_EMAIL},
        )
        demo_user = jsonable_encoder(user_exists.one())

        token = create_access_token(
            {"id": demo_user["id"], "email": demo_user["email"]},
            expiration_date=datetime.datetime.now()
            + datetime.timedelta(days=30),
        )

        return {
            "token": token,
            "email": demo_user["email"],
            "name": demo_user["name"],
            "lastname": demo_user["lastname"],
        }

    # =====================================================
    # NORMAL LOGIN
    # =====================================================
    user_exists = await db.execute(
        text("""
            SELECT * FROM users
            WHERE email = :email
        """),
        {"email": user.email},
    )

    user_exists = user_exists.one_or_none()
    user_exists = jsonable_encoder(user_exists)

    if user_exists:
        valid_password = verify_password(
            hash_password=user_exists["password"],
            password=user.password,
        )

        if valid_password:
            token = create_access_token(
                {"id": user_exists["id"], "email": user_exists["email"]},
                expiration_date=datetime.datetime.now()
                + datetime.timedelta(days=30),
            )

            return {
                "token": token,
                "email": user_exists["email"],
                "name": user_exists["name"],
                "lastname": user_exists["lastname"],
            }

    raise HTTPException(
        status_code=404,
        detail="Usuario o Contraseña incorrectos",
    )
# demo login v2
