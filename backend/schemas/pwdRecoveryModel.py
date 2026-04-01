from pydantic import BaseModel

class EmailModel(BaseModel):

    email: str
   
class PasswordRecoveryVerificationCodeModel(BaseModel):
    email: str
    recovery_code: str
    password: str