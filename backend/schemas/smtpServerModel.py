from pydantic import BaseModel


class MailBody(BaseModel):

    to: str
    body: str
    subject: str
