from fastapi import APIRouter

routerPwdRecovery = APIRouter()


@routerPwdRecovery.get("/pwdrecovery", tags=["password-recovery"])
async def password_recovery_deprecated():
    return {
        "message": "Password recovery disabled in demo-free mode."
    }
