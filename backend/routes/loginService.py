from fastapi import APIRouter

routerLogin = APIRouter()


@routerLogin.get("/login", tags=["login"])
async def login_deprecated():
    return {
        "message": "Authentication disabled in demo-free mode."
    }
