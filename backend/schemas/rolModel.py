from pydantic import BaseModel
from fastapi import Header

class RolModel(BaseModel):

    id: int
    name: str
    description: str

class DeleteRolModel(BaseModel):

    id: int