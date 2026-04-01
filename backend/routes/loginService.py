from fastapi import APIRouter, HTTPException, Depends

from models.models import User, Chat
from sqlalchemy import select
from db.db import get_db
from sqlalchemy.ext.asyncio import AsyncSession

from fastapi.encoders import jsonable_encoder
from modules.oauth import create_access_token, verify_password
from modules.auth.password_manager import hash_password
import datetime

# schemas
from schemas.usuarioLoginModel import UserLogin

routerLogin = APIRouter()


@routerLogin.post("/login", tags=['login'])
async def login(user: UserLogin, db: AsyncSession = Depends(get_db)):
    res = ""

    # VERIFICAR EXISTENCIA DEL USUARIO
    user_exists = await db.execute(
        """
        SELECT * FROM users
        WHERE email = :email
        """,
        {"email": user.email}
    )
    user_exists = user_exists.one_or_none()
    user_exists = jsonable_encoder(user_exists)

    if user_exists:
        # verifico que la contraseña sea valida y la hasheo
        valid_password = verify_password(
            hash_password=user_exists['password'],
            password=user.password
        )

        if valid_password:
            res=user_exists;
            token = create_access_token({"id": res["id"], "email": res["email"]},
                                        expiration_date=datetime.datetime.now()+datetime.timedelta(days=30))
            return {"token": token, "email": res["email"], "name": res["name"],"lastname": res["lastname"]}

    raise HTTPException(
        status_code=404, detail="Usuario o Contraseña incorrectos")
