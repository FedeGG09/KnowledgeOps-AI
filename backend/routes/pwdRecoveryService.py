# fastatpi
from fastapi import APIRouter, Depends, BackgroundTasks
from fastapi.encoders import jsonable_encoder
# db
from db.db import get_db
from sqlalchemy.ext.asyncio import AsyncSession
# schemas
from schemas.userModel import  VerificationCode
from schemas.pwdRecoveryModel import EmailModel,PasswordRecoveryVerificationCodeModel
from schemas.smtpServerModel import MailBody
# modules
from modules.helpers.response import manage_responses
from modules.auth.password_manager import hash_password
from modules.mailer import send_email
from modules.auth.verification_code import generate_verification_code

routerPwdRecovery = APIRouter()
tag = 'PWD RECOVERY'
url_base = '/pwdrecovery'

@routerPwdRecovery.post(url_base + '/get_code', tags=[tag])
async def get_code(
        data: EmailModel,
        tasks: BackgroundTasks,
        db: AsyncSession = Depends(get_db),
):

    try:

        # 1. VERIFICO SI EL USUARIO EXISTE
        user_exists = await db.execute(
            """
            SELECT id FROM users
            WHERE email = :email
            """,
            {"email": data.email}
        )
        user_exists = user_exists.one_or_none()

        if not user_exists:

            return manage_responses(message="Invalid User!", success=False, status=401)

        else:
            recovery_code = generate_verification_code()
            await db.execute(
                """
                    UPDATE public.users
                    SET recovery_code=:recovery WHERE email=:email;
                """,
                {
                    "email": data.email,
                    "recovery": recovery_code
                }
            )

            await db.commit()

            # ASIGNAR BACKGROUND TASKS PARA EL ENVÍO DEL CORREO
            tasks.add_task(send_email, MailBody(**{
                "to": data.email,
                "body": f""" 
                    Your recovery code is: {recovery_code}
                """,
                "subject": "Recovery Password Code!"
            }))

            return manage_responses(message="Verify your email to recover password", status=200)

    except Exception as e:

        print(e)
        return manage_responses(message="Internal Server Error", status=500, success=False, log=str(e))


@routerPwdRecovery.post(url_base + '/change', tags=[tag])
async def change(
        data: PasswordRecoveryVerificationCodeModel,
        tasks: BackgroundTasks,
        db: AsyncSession = Depends(get_db),
):
    """
    Chequeo Password:
    -----------------
    *Tiene un mínimo de 8 caracteres de longitud \n
    *Al menos una letra mayúscula en inglés \n
    *Al menos una letra minúscula en inglés \n
    *Al menos un dígito \n
    *Al menos un carácter especial #?!@$%^&*- \n
    """

    try:

        # 1. VERIFICO SI EL USUARIO EXISTE
        user_exists = await db.execute(
            """
            SELECT id FROM users
            WHERE email = :email and recovery_code = :code
            """,
            {"email": data.email, "code": data.recovery_code}
        )
        user_exists = user_exists.one_or_none()

        if user_exists:

            # verifico que la contraseña sea valida y la hasheo
            new_password = hash_password(data.password)

            if new_password:
                await db.execute(
                    """
                        UPDATE public.users
                        SET password=:password WHERE email=:email;
                    """,
                    {
                        "email": data.email,
                        "password": new_password
                    }
                )
                await db.commit()

                return manage_responses(message="Password changed. Now you can log in", status=200, success=False)

            else:
                return manage_responses(message="The password does not follow the established parameters", status=200, success=False)
        else:
            return manage_responses(message="Invalid Email or recovery code", status=200, success=False)

    except Exception as e:

        print(e)
        return manage_responses(message="Internal Server Error", status=500, success=False, log=str(e))
