from pydantic import BaseModel
from fastapi import Header

class UserSignIn(BaseModel):
    name: str
    lastname: str
    email: str
    password: str

class VerificationCode(BaseModel):
    email: str
    verification_code: str
