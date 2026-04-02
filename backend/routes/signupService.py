from fastapi import APIRouter

sign_up = APIRouter()


@sign_up.get("/sign_up", tags=["signup"])
async def signup_deprecated():
    return {
        "message": "Signup disabled in demo-free mode."
    }
