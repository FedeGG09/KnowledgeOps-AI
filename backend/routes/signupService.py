# fastatpi
from fastapi import APIRouter, Depends, BackgroundTasks
from fastapi.encoders import jsonable_encoder
# db
from db.db import get_db
from sqlalchemy.ext.asyncio import AsyncSession
# schemas
from schemas.userModel import UserSignIn, VerificationCode
from schemas.smtpServerModel import MailBody
# modules
from modules.helpers.response import manage_responses
from modules.auth.password_manager import hash_password
from modules.mailer import send_email
from modules.auth.verification_code import generate_verification_code

sign_up = APIRouter()
tag = 'SIGN UP'
url_base = '/sign_up'

@sign_up.post(url_base, tags=[tag])
async def sign_up_user(
        user: UserSignIn,
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
            WHERE email = :email
            """,
            {"email": user.email}
        )
        user_exists = user_exists.one_or_none()

        if user_exists:

            return manage_responses(message="User email already exists", success=False, status=401)

        else:
            # verifico que la contraseña sea valida y la hasheo
            new_password = hash_password(user.password)

            if new_password:
                # si la contraseñan es válida
                # genero el codigo de verificacion y registro al usuario
                verification_code = generate_verification_code()
                await db.execute(
                    """
                        INSERT INTO users
                        (name, lastname, email, password, verification_code)
                        VALUES 
                        (
                            :name,
                            :lastname,
                            :email,
                            :password,
                            :verification_code
                        )
                    """,
                    {
                        "name": user.name,
                        "lastname": user.lastname,
                        "email": user.email,
                        "password": new_password,
                        "verification_code": verification_code
                    }
                )

                await db.commit()

                # ASIGNAR BACKGROUND TASKS PARA EL ENVÍO DEL CORREO
                tasks.add_task(send_email, MailBody(**{
                    "to": user.email,
                    "body": f"""
                        Welcome! 
                        Your verification code is: {verification_code}
                    """,
                    "subject": "Welcome to Xitrus!"
                }))

                return manage_responses(message="Verify your email to continue with the sign up", status=200)

            else:

                return manage_responses(message="The password does not follow the established parameters", status=403, success=False)

    except Exception as e:

        print(e)
        return manage_responses(message="Internal Server Error", status=500, success=False, log=str(e))


################################
##  CHECK VERIFICATION CODE   ##
################################
@sign_up.post(url_base + '/verify_user', tags=[tag])
async def verify_user(
    user: VerificationCode,
    db: AsyncSession = Depends(get_db)
):
    try:

        # BUSCO EL USUARIO POR EMAIL
        query = await db.execute(
            f"""
            SELECT 
                * 
            FROM users
            WHERE email = :email
            """,
            {
                "email": user.email
            }
        )

        user_exists = query.one_or_none()
        user_exists = jsonable_encoder(user_exists)

        if user_exists:

            valid_verification_code = user_exists['verification_code']

            # verifico que el codigo de verificacion sea correcto
            if valid_verification_code == user.verification_code:

                await db.execute(
                    f"""
                    UPDATE users
                    SET verified_account = :verified_account
                    WHERE id = :id
                    """,
                    {
                        "verified_account": True,
                        "id": user_exists['id']
                    }
                )

                await db.commit()
                return manage_responses(message="User verified successfully", success=True, status=200)

            else:

                return manage_responses(message="Invalid verification code", success=False, status=401)

        else:

            return manage_responses(message='User not found', status=404, success=False)

    except Exception as e:

        print(e)
        return manage_responses(status=500)
