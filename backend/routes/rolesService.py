from fastapi import APIRouter, HTTPException, Depends
from fastapi import Header

from models.models import User, Chat
from sqlalchemy import select
from db.db import get_db

from sqlalchemy.ext.asyncio import AsyncSession
from modules.oauth import get_current_user

from fastapi.encoders import jsonable_encoder
import hashlib

# schemas
from schemas.rolModel import RolModel, DeleteRolModel

routerRoles = APIRouter()

@routerRoles.get("/roles/getAllRoles", tags=['roles'])
async def roles(token: str = Header(default=""), db: AsyncSession = Depends(get_db)):
    # VALIDAR JWT
    authorized = await get_current_user(
        db=db,
        token=token
    )

    if not authorized:
        raise credentials_exception

    response = ""
    res = await db.execute("select * from roles inner join roles_user on roles.id=roles_user.idrol where roles_user.userid=:userid", {"userid": authorized["id"]})
    response = jsonable_encoder(res.all())
    return {"message": response}

@routerRoles.post("/roles/update", tags=['update'])
async def roles_update(data: RolModel,token: str = Header(default=""), db: AsyncSession = Depends(get_db)):
    # VALIDAR JWT
    authorized = await get_current_user(
        db=db,
        token=token
    )

    if not authorized:
        raise credentials_exception

    if data.id==0:
        result=await db.execute("INSERT INTO roles (name, description) VALUES(:name, :description) returning id", {
                    "name": data.name, "description": data.description})
        await db.commit()
        
        rol=jsonable_encoder(result.all())

        await db.execute("INSERT INTO roles_user (idrol, userid) VALUES(:idrol, :userid);", {
                    "idrol": rol[0]["id"], "userid": authorized["id"]})
        await db.commit()
    
    else:
        await db.execute("UPDATE roles SET name=:name, description=:description where id=:id;", {
                    "name": data.name, "description": data.description, "id": data.id})
        await db.commit()

    return {"message": "ok"}

@routerRoles.post("/roles/delete", tags=['delete'])
async def roles_delete(data: DeleteRolModel, token: str = Header(default=""), db: AsyncSession = Depends(get_db)):
    # VALIDAR JWT
    authorized = await get_current_user(
        db=db,
        token=token
    )

    if not authorized:
        raise credentials_exception

    if data.id!=0:
        result=await db.execute("DELETE FROM roles_user WHERE roles_user.idrol=:id and roles_user.userid=:userid returning id", {
                    "id": data.id, "userid":authorized["id"]})
        await db.commit()

        rol=jsonable_encoder(result.all())
    
        message=""
        id=0
        if rol: 
            if rol[0]["id"]:
                message="ok"
                id=rol[0]["id"]
        else:
            message="Error al eliminar"

    return {"id":id,"message": message}