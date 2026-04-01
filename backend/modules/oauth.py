# fastapi
from fastapi import Depends,  HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from fastapi.encoders import jsonable_encoder
# db
from sqlalchemy.ext.asyncio import AsyncSession
# datetime
from datetime import datetime, timedelta
from datetime import datetime, timedelta
# jwt
from jose import JWTError, jwt
# others
from decouple import config
import bcrypt

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

SECRET_KEY = config('SECRET_KEY')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 300


def verify_password(hash_password: str, password: str):
    return bcrypt.checkpw(password.encode('utf8'), hash_password.encode('utf8'))


def create_access_token(data: dict, expiration_date: datetime):
    to_encode = data.copy()

    to_encode.update({"exp": expiration_date})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)


async def get_current_user(
    db: AsyncSession,
    token: str = Depends(oauth2_scheme)
):
    
    """
    Funcionamiento:
    ---------------
    Decodificar el JWT y obtener los datos del usuario para verificarlo en una base de datos y encontrarlo
    En caso de no existir retorna raise Error y bloquea el acceso
    """
    try:

        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        id: str = payload.get("id")
        email: str = payload.get("email")

        if email is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    user = await db.execute("SELECT * FROM users WHERE id = :id AND email = :email AND verified_account = true ", {"id":id, "email": email})
    
    user = user.one_or_none()

    if user:

        user = jsonable_encoder(user)

        return user

    else:

        return False