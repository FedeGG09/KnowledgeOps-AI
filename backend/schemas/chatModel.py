from pydantic import BaseModel
from fastapi import Header

class ChatRequestModel(BaseModel):

    query: str
    rol: int

class ChatModel(BaseModel):

    rol: int