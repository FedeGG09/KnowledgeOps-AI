# modules/oauth.py
from __future__ import annotations

import os
import bcrypt
from datetime import datetime, timedelta
from typing import Any, Dict, Optional

from fastapi import Depends, HTTPException, status
from fastapi.encoders import jsonable_encoder
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

# =========================
# AUTH CONFIG
# =========================
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "knowledgeops_ai_portfolio_demo_secret_2026"
)

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 300


# =========================
# AUTH HELPERS
# =========================
def verify_password(hash_password: str, password: str) -> bool:
    """
    Verifica password plana contra hash bcrypt almacenado.
    """
    try:
        return bcrypt.checkpw(
            password.encode("utf-8"),
            hash_password.encode("utf-8")
        )
    except Exception:
        return False


def create_access_token(
    data: Dict[str, Any],
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Genera JWT firmado.
    """
    to_encode = data.copy()

    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    to_encode.update({"exp": expire})

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


# =========================
# EXCEPTION
# =========================
credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)


# =========================
# CURRENT USER
# =========================
async def get_current_user(
    db: AsyncSession,
    token: str = Depends(oauth2_scheme)
):
    """
    Decodifica JWT y valida usuario activo/verificado.
    """
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("id")
        email = payload.get("email")

        if not user_id or not email:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    query = text("""
        SELECT *
        FROM users
        WHERE id = :id
          AND email = :email
          AND verified_account = true
        LIMIT 1
    """)

    result = await db.execute(
        query,
        {"id": user_id, "email": email}
    )

    user = result.one_or_none()

    if not user:
        raise credentials_exception

    return jsonable_encoder(user)
